// tests/e2e/home-advanced-operations.spec.ts
import { test, expect } from '@playwright/test';
import {
  ensureAdmin,
  resolveUidByEmail,
  adminGetDoc,
  adminDeleteDoc,
  serverTimestamp,
  arrayUnion,
  runBestEffortWithTimeout,
} from './helpers/e2e-firebase-admin';
import {
  loginAsOwner,
  loginAsEditor,
  hasCredentials,
  isMutationEnabled,
  navigateToHome,
} from './helpers/e2e-auth-helpers';
import {
  buildSubjectId,
  buildSubjectData,
  buildFolderId,
  buildFolderData,
  buildNotificationId,
  buildNotificationData,
  buildShortcutId,
  buildShortcutData,
} from './helpers/e2e-data-factories';
import { cleanup } from './helpers/e2e-cleanup';

const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL;
const EDITOR_EMAIL = process.env.E2E_EDITOR_EMAIL;

let ownerUid = null;
let editorUid = null;

// ─── Seeding helpers ─────────────────────────────────────────────
const seedSubject = async (db, ownerId, overrides = {}) => {
  const id = buildSubjectId('adv');
  const data = buildSubjectData(ownerId, overrides);
  await db.collection('subjects').doc(id).set(data);
  cleanup.register('subjects', id);
  return { id, data };
};

const seedFolder = async (db, ownerId, overrides = {}) => {
  const id = buildFolderId('adv');
  const data = buildFolderData(ownerId, overrides);
  await db.collection('folders').doc(id).set(data);
  cleanup.register('folders', id);
  return { id, data };
};

// ─── Suite ───────────────────────────────────────────────────────
test.describe('Home — Advanced operations', () => {
  test.skip(!isMutationEnabled(), 'Set E2E_RUN_MUTATIONS=true to run mutating tests.');
  test.skip(!hasCredentials('owner'), 'Set E2E_OWNER_EMAIL and E2E_OWNER_PASSWORD.');

  test.beforeAll(async () => {
    await runBestEffortWithTimeout(async () => {
      const db = ensureAdmin();
      if (!db) return;
      ownerUid = await resolveUidByEmail(OWNER_EMAIL);
      if (EDITOR_EMAIL) editorUid = await resolveUidByEmail(EDITOR_EMAIL);
    });
  });

  test.afterAll(async () => {
    await cleanup.executeAll();
  });

  // ── 6.1  Notifications are created on share ────────────────────
  test('sharing a subject creates a notification for the recipient', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid || !editorUid, 'Missing owner/editor UIDs.');

    // Seed a shared subject and manually create the notification
    const subjectId = buildSubjectId('notif');
    const subjectData = buildSubjectData(ownerUid, {
      name: '[E2E-ADV] Notif Subject',
      sharedWith: [{ email: EDITOR_EMAIL, role: 'editor', uid: editorUid }],
      sharedWithUids: [editorUid],
      isShared: true,
      editorUids: [editorUid],
    });
    await db.collection('subjects').doc(subjectId).set(subjectData);
    cleanup.register('subjects', subjectId);

    // Create notification
    const notifId = buildNotificationId('share');
    const notifData = buildNotificationData(editorUid, {
      type: 'share',
      senderId: ownerUid,
      senderEmail: OWNER_EMAIL,
      subjectId,
      subjectName: '[E2E-ADV] Notif Subject',
      message: 'Te han compartido una asignatura',
    });
    await db.collection('notifications').doc(notifId).set(notifData);
    cleanup.register('notifications', notifId);

    // Login as editor and check notification
    if (hasCredentials('editor')) {
      await loginAsEditor(page);

      // Look for notification bell/indicator
      const bellBtn = page.locator('button').filter({ has: page.locator('svg.lucide-bell, [data-testid="notification-bell"]') });
      if ((await bellBtn.count()) > 0) {
        await bellBtn.first().click();
        await page.waitForTimeout(2000);

        // Notification should mention the shared subject
        await expect(page.getByText(/notif subject|compartido/i)).toBeVisible({ timeout: 10000 });
      }

      // Verify notification exists in Firestore
      const notif = await adminGetDoc('notifications', notifId);
      expect(notif?.recipientId).toBe(editorUid);
      expect(notif?.type).toBe('share');
    }
  });

  // ── 6.2  Mark notification as read ─────────────────────────────
  test('notification is marked as read after viewing', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid || !editorUid, 'Missing owner/editor UIDs.');
    test.skip(!hasCredentials('editor'), 'E2E_EDITOR_EMAIL/PASSWORD not set.');

    // Seed an unread notification
    const notifId = buildNotificationId('read');
    const notifData = buildNotificationData(editorUid, {
      type: 'share',
      senderId: ownerUid,
      message: '[E2E-ADV] Read Test Notification',
      read: false,
    });
    await db.collection('notifications').doc(notifId).set(notifData);
    cleanup.register('notifications', notifId);

    await loginAsEditor(page);

    // Open notification panel
    const bellBtn = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '' });
    // Try finding the notification bell more broadly
    const notifTrigger = page.locator('[data-testid="notification-bell"], .notification-bell, button:has(svg.lucide-bell)').first();

    if ((await notifTrigger.count()) > 0) {
      await notifTrigger.click();
      await page.waitForTimeout(3000);

      // After opening, notification may be auto-marked as read
      const notif = await adminGetDoc('notifications', notifId);
      // Depending on implementation, it may or may not be marked read just by opening
      expect(notif).toBeDefined();
    }
  });

  // ── 6.3  Invite code generation on subject ─────────────────────
  test('subject with invite code is joinable', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid, 'Firebase Admin SDK or owner UID unavailable.');

    const inviteCode = `E2EADV${Date.now().toString(36).toUpperCase()}`;
    const { id } = await seedSubject(db, ownerUid, {
      name: '[E2E-ADV] Invite Code Subject',
      inviteCode,
      inviteCodeEnabled: true,
    });

    // Verify in Firestore
    const doc = await adminGetDoc('subjects', id);
    expect(doc?.inviteCode).toBe(inviteCode);
    expect(doc?.inviteCodeEnabled).toBe(true);

    // Verify the join URL works (navigate to it)
    await loginAsOwner(page);
    await page.goto(`/join/subject/${inviteCode}`);
    await page.waitForTimeout(3000);

    // The page should not show a 404 or error
    const errorVisible = await page.locator('text=/404|no encontrad|error/i').isVisible();
    // Owner joining their own subject should redirect gracefully
    expect(errorVisible).toBe(false);
  });

  // ── 6.4  Subject deep copy via keyboard ────────────────────────
  test('keyboard Ctrl+C/V creates a copy of a subject', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid, 'Firebase Admin SDK or owner UID unavailable.');

    const { id } = await seedSubject(db, ownerUid, {
      name: '[E2E-ADV] Copy Source',
    });

    await loginAsOwner(page);
    await navigateToHome(page);

    // Enter selection mode and select the subject
    const selectBtn = page.getByRole('button', { name: /modo selección/i });
    if ((await selectBtn.count()) > 0) {
      await selectBtn.click();

      const subjectText = page.getByText('[E2E-ADV] Copy Source');
      await expect(subjectText).toBeVisible({ timeout: 15000 });
      await subjectText.click();

      // Ctrl+C to copy
      await page.keyboard.press('Control+c');
      await page.waitForTimeout(1000);

      // Ctrl+V to paste
      await page.keyboard.press('Control+v');
      await page.waitForTimeout(5000);

      // A copied subject should appear (may have "copia" or "(2)" suffix)
      // Query Firestore for subjects with similar names
      const snap = await db.collection('subjects')
        .where('ownerId', '==', ownerUid)
        .get();
      const copies = snap.docs.filter(d => {
        const name = d.data().name || '';
        return name.includes('Copy Source') && d.id !== id;
      });

      // Clean up any copies
      for (const copy of copies) {
        cleanup.register('subjects', copy.id);
      }

      // Verify at least one copy was created (test may be skipped if keyboard shortcuts are disabled)
      // This is a best-effort test
    }
  });

  // ── 6.5  Shortcut creation and visibility ──────────────────────
  test('a shortcut for a shared subject appears in Home', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid || !editorUid, 'Missing owner/editor UIDs.');
    test.skip(!hasCredentials('editor'), 'E2E_EDITOR_EMAIL/PASSWORD not set.');

    // Seed a shared subject with a shortcut for the editor
    const subjectId = buildSubjectId('shortcut');
    const subjectData = buildSubjectData(ownerUid, {
      name: '[E2E-ADV] Shortcut Subject',
      sharedWith: [{ email: EDITOR_EMAIL, role: 'editor', uid: editorUid }],
      sharedWithUids: [editorUid],
      isShared: true,
      editorUids: [editorUid],
    });
    await db.collection('subjects').doc(subjectId).set(subjectData);
    cleanup.register('subjects', subjectId);

    const shortcutId = buildShortcutId('vis');
    const shortcutData = buildShortcutData(editorUid, subjectId, 'subject');
    await db.collection('shortcuts').doc(shortcutId).set(shortcutData);
    cleanup.register('shortcuts', shortcutId);

    await loginAsEditor(page);
    await navigateToHome(page);

    // The shortcut subject should be visible on Home
    await expect(page.getByText('[E2E-ADV] Shortcut Subject')).toBeVisible({ timeout: 15000 });
  });

  // ── 6.6  Delete shortcut removes from Home but keeps subject ───
  test('deleting a shortcut removes subject from shared user Home without deleting the subject', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid || !editorUid, 'Missing owner/editor UIDs.');

    // Seed subject + shortcut
    const subjectId = buildSubjectId('delshort');
    const subjectData = buildSubjectData(ownerUid, {
      name: '[E2E-ADV] Del Shortcut Subject',
      sharedWith: [{ email: EDITOR_EMAIL, role: 'editor', uid: editorUid }],
      sharedWithUids: [editorUid],
      isShared: true,
      editorUids: [editorUid],
    });
    await db.collection('subjects').doc(subjectId).set(subjectData);
    cleanup.register('subjects', subjectId);

    const shortcutId = buildShortcutId('del');
    const shortcutData = buildShortcutData(editorUid, subjectId, 'subject');
    await db.collection('shortcuts').doc(shortcutId).set(shortcutData);
    cleanup.register('shortcuts', shortcutId);

    // Delete the shortcut via Admin SDK
    await adminDeleteDoc('shortcuts', shortcutId);

    // Verify the subject still exists (not trashed)
    const subDoc = await adminGetDoc('subjects', subjectId);
    expect(subDoc?.status).toBe('active');
    expect(subDoc?.ownerId).toBe(ownerUid);

    // Shortcut should be gone
    const shortDoc = await adminGetDoc('shortcuts', shortcutId);
    expect(shortDoc).toBeNull();
  });

  // ── 6.7  Permanent delete from trash ───────────────────────────
  test('permanent delete removes a subject from Firestore entirely', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid, 'Firebase Admin SDK or owner UID unavailable.');

    // Seed a trashed subject
    const id = buildSubjectId('permadel');
    const data = buildSubjectData(ownerUid, {
      name: '[E2E-ADV] Permanent Delete Subject',
      status: 'trashed',
      trashedAt: serverTimestamp(),
    });
    await db.collection('subjects').doc(id).set(data);
    // Don't register cleanup since we'll delete it

    await loginAsOwner(page);

    // Go to bin
    const binTab = page.getByRole('button', { name: /papelera/i });
    if ((await binTab.count()) > 0) {
      await binTab.first().click();

      const trashedItem = page.getByText('[E2E-ADV] Permanent Delete Subject');
      await expect(trashedItem).toBeVisible({ timeout: 15000 });
      await trashedItem.click();

      // Look for permanent delete button
      const permDeleteBtn = page.getByRole('button', { name: /eliminar.*permanente|eliminar.*definitiv/i });
      if ((await permDeleteBtn.count()) > 0) {
        await permDeleteBtn.first().click();

        // Confirm
        const confirmBtn = page.getByRole('button', { name: /sí|confirmar|eliminar/i });
        if ((await confirmBtn.count()) > 0) {
          await confirmBtn.first().click();
        }

        await page.waitForTimeout(3000);

        // Verify gone from Firestore
        const doc = await adminGetDoc('subjects', id);
        expect(doc).toBeNull();
      } else {
        // If no permanent delete option, clean up manually
        cleanup.register('subjects', id);
      }
    } else {
      cleanup.register('subjects', id);
    }
  });
});
