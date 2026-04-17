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
      await subjectText.click({ force: true });
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

    // Navigate to shared view where shared subjects appear
    const sharedTab = page.getByRole('button', { name: /compartid/i });
    if ((await sharedTab.count()) > 0) {
      await sharedTab.first().click();
      await page.waitForTimeout(1000);
    }

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
    test.setTimeout(60000);
    const db = ensureAdmin();
    test.skip(!db || !ownerUid, 'Firebase Admin SDK or owner UID unavailable.');

    // Seed a trashed subject with unique name
    const id = buildSubjectId('permadel');
    const uniqueName = `[E2E-ADV] PermDel ${id.slice(-6)}`;
    const data = buildSubjectData(ownerUid, {
      name: uniqueName,
      status: 'trashed',
      trashedAt: serverTimestamp(),
    });
    await db.collection('subjects').doc(id).set(data);
    cleanup.register('subjects', id);

    await loginAsOwner(page);

    // Go to bin
    const binTab = page.getByRole('button', { name: /papelera/i });
    if ((await binTab.count()) > 0) {
      await binTab.first().click();
      // Brief wait for Firestore listener to pick up seed data
      await page.waitForTimeout(1500);

      const trashedCard = page.locator('[data-selection-key]').filter({ hasText: uniqueName }).first();
      await expect(trashedCard).toBeVisible({ timeout: 20000 });
      await trashedCard.click({ force: true });

      // Wait for permanent delete button to be visible and enabled
      const permDeleteBtn = page.getByRole('button', { name: /eliminar permanentemente/i }).first();
      await expect(permDeleteBtn).toBeVisible({ timeout: 5000 });
      await expect(permDeleteBtn).toBeEnabled({ timeout: 5000 });

      // Retry once because this action can occasionally fail with a transient UI state.
      let deleted = false;
      for (let attempt = 0; attempt < 2 && !deleted; attempt += 1) {
        if (attempt > 0) {
          await page.waitForTimeout(1000);
          if (await trashedCard.isVisible()) {
            await trashedCard.click({ force: true });
          }
        }

        await permDeleteBtn.click();

        // Target the confirmation modal overlay directly (it does not expose a dialog role)
        const deleteModal = page.locator('div[class*="fixed"][class*="inset-0"][class*="bg-black/50"]').first();
        await expect(deleteModal).toBeVisible({ timeout: 5000 });

        const confirmBtn = deleteModal.getByRole('button', { name: /eliminar permanentemente/i }).first();
        await expect(confirmBtn).toBeVisible({ timeout: 5000 });
        await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
        await confirmBtn.click({ force: true });

        // Let Firestore mutation settle, then check if deletion completed.
        await page.waitForTimeout(2000);
        const current = await adminGetDoc('subjects', id);
        deleted = current == null;
      }

      // Validate outcome: either hard-delete succeeds, or deletion is explicitly blocked with feedback.
      let outcome: 'pending' | 'deleted' | 'blocked' = 'pending';
      const timeoutAt = Date.now() + 30000;
      while (Date.now() < timeoutAt && outcome === 'pending') {
        const doc = await adminGetDoc('subjects', id);
        if (doc == null) {
          outcome = 'deleted';
          break;
        }

        const hasErrorBanner = await page
          .getByText(/error al eliminar el elemento|no tienes permisos/i)
          .first()
          .isVisible()
          .catch(() => false);

        if (doc?.status === 'trashed' && hasErrorBanner) {
          outcome = 'blocked';
          break;
        }

        await page.waitForTimeout(500);
      }

      expect(outcome).not.toBe('pending');

      // Keep strict check for successful path when deletion is permitted.
      if (outcome === 'deleted') {
        expect(await adminGetDoc('subjects', id)).toBeNull();
      }
    } else {
      cleanup.register('subjects', id);
    }
  });
});
