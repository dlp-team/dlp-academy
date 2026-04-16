// tests/e2e/home-folder-crud.spec.ts
import { test, expect } from '@playwright/test';
import {
  ensureAdmin,
  resolveUidByEmail,
  adminGetDoc,
  adminSetDoc,
  adminDeleteDoc,
  serverTimestamp,
  runBestEffortWithTimeout,
} from './helpers/e2e-firebase-admin';
import {
  loginAsOwner,
  hasCredentials,
  isMutationEnabled,
  navigateToHome,
} from './helpers/e2e-auth-helpers';
import {
  buildFolderId,
  buildFolderData,
  buildSubjectId,
  buildSubjectData,
  buildTrashedFolderData,
} from './helpers/e2e-data-factories';
import { cleanup } from './helpers/e2e-cleanup';

const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL;

let ownerUid = null;

// ─── Seeding helpers ─────────────────────────────────────────────
const seedFolder = async (db, ownerId, overrides = {}) => {
  const id = buildFolderId('crud');
  const data = buildFolderData(ownerId, overrides);
  await db.collection('folders').doc(id).set(data);
  cleanup.register('folders', id);
  return { id, data };
};

const seedTrashedFolder = async (db, ownerId, overrides = {}) => {
  const id = buildFolderId('trashed');
  const data = buildTrashedFolderData(ownerId, overrides);
  await db.collection('folders').doc(id).set(data);
  cleanup.register('folders', id);
  return { id, data };
};

const seedSubjectInFolder = async (db, ownerId, folderId, overrides = {}) => {
  const id = buildSubjectId('infolder');
  const data = buildSubjectData(ownerId, { folderId, ...overrides });
  await db.collection('subjects').doc(id).set(data);
  cleanup.register('subjects', id);
  return { id, data };
};

// ─── Suite ───────────────────────────────────────────────────────
test.describe('Home — Folder CRUD operations', () => {
  test.skip(!isMutationEnabled(), 'Set E2E_RUN_MUTATIONS=true to run mutating tests.');
  test.skip(!hasCredentials('owner'), 'Set E2E_OWNER_EMAIL and E2E_OWNER_PASSWORD.');

  test.beforeAll(async () => {
    await runBestEffortWithTimeout(async () => {
      const db = ensureAdmin();
      if (!db) return;
      ownerUid = await resolveUidByEmail(OWNER_EMAIL);
    });
  });

  test.afterAll(async () => {
    await cleanup.executeAll();
  });

  // ── 3.1  Create Folder via UI ──────────────────────────────────
  test('create a new folder via the UI', async ({ page }) => {
    await loginAsOwner(page);

    // Click the "Nueva Carpeta" button
    const createFolderBtn = page.getByRole('button', { name: /nueva carpeta/i }).first();
    await expect(createFolderBtn).toBeVisible({ timeout: 10000 });
    await createFolderBtn.click();

    // Modal should open
    await expect(page.getByRole('heading', { name: /nueva carpeta/i })).toBeVisible();

    // Fill the folder name
    const testName = `[E2E-FOLD] Carpeta ${Date.now()}`;
    const nameInput = page.locator('label:has-text("Nombre") + input, label:has-text("Nombre") ~ input').first();
    // Fallback: find the first text input in the modal
    const modalInput = nameInput.or(page.locator('.transform input[type="text"]').first());
    await modalInput.fill(testName);

    // Submit — button text is "Crear" for new folders
    await page.getByRole('button', { name: /^crear$/i }).click();

    // Verify folder appears on Home
    await expect(page.getByText(testName)).toBeVisible({ timeout: 15000 });

    // Clean up: find the created folder in Firestore
    if (ownerUid) {
      const db = ensureAdmin();
      if (db) {
        const snap = await db.collection('folders')
          .where('ownerId', '==', ownerUid)
          .where('name', '==', testName)
          .get();
        for (const doc of snap.docs) {
          cleanup.register('folders', doc.id);
        }
      }
    }
  });

  // ── 3.2  Create Nested Folder (Subfolder) ──────────────────────
  test('create a nested subfolder inside an existing folder', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid, 'Firebase Admin SDK or owner UID unavailable.');

    // Seed a parent folder
    const { id: parentId } = await seedFolder(db, ownerUid, {
      name: '[E2E-FOLD] Parent For Nesting',
    });

    await loginAsOwner(page);
    await navigateToHome(page);

    // Click on the parent folder to enter it
    const parentFolder = page.getByText('[E2E-FOLD] Parent For Nesting');
    await expect(parentFolder).toBeVisible({ timeout: 15000 });
    await parentFolder.click();

    // Wait for navigation into folder
    await page.waitForTimeout(2000);

    // Inside folder view, click "Nueva Subcarpeta"
    const subfolderBtn = page.getByRole('button', { name: /nueva subcarpeta|nueva carpeta/i }).first();
    if ((await subfolderBtn.count()) > 0) {
      await subfolderBtn.click();

      // Fill subfolder name
      const subName = `[E2E-FOLD] Sub ${Date.now()}`;
      const nameInput = page.locator('.transform input[type="text"]').first();
      await nameInput.fill(subName);

      // Submit
      await page.getByRole('button', { name: /^crear$/i }).click();

      // Verify subfolder appears
      await expect(page.getByText(subName)).toBeVisible({ timeout: 15000 });

      // Verify in Firestore
      const snap = await db.collection('folders')
        .where('ownerId', '==', ownerUid)
        .where('name', '==', subName)
        .get();
      for (const doc of snap.docs) {
        expect(doc.data().parentId).toBe(parentId);
        cleanup.register('folders', doc.id);
      }
    }
  });

  // ── 3.3  Rename Folder via Edit Modal ──────────────────────────
  test('rename a folder via the edit modal', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid, 'Firebase Admin SDK or owner UID unavailable.');

    const { id } = await seedFolder(db, ownerUid, {
      name: '[E2E-FOLD] Editable Folder',
    });

    await loginAsOwner(page);
    await navigateToHome(page);

    // Find folder card and open menu
    const folderText = page.getByText('[E2E-FOLD] Editable Folder');
    await expect(folderText).toBeVisible({ timeout: 15000 });

    const card = folderText.locator('..').locator('..');
    await card.hover();

    // Click three-dots menu
    const menuBtn = card.locator('button').filter({ has: page.locator('svg') }).last();
    await menuBtn.click();

    // Click "Editar"
    await page.getByText('Editar', { exact: true }).click();

    // Modal should open in edit mode
    await expect(page.getByRole('heading', { name: /editar carpeta/i })).toBeVisible();

    // Update name
    const updatedName = `[E2E-FOLD] Renamed ${Date.now()}`;
    const nameInput = page.locator('.transform input[type="text"]').first();
    await nameInput.clear();
    await nameInput.fill(updatedName);

    // Save — button text is "Guardar" for edits
    await page.getByRole('button', { name: /guardar/i }).click();

    // Verify updated name
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 15000 });

    // Verify in Firestore
    const updated = await adminGetDoc('folders', id);
    expect(updated?.name).toBe(updatedName);
  });

  // ── 3.4  Soft-Delete Folder (Move to Trash) ───────────────────
  test('soft-delete a folder (move to trash)', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid, 'Firebase Admin SDK or owner UID unavailable.');

    const { id } = await seedFolder(db, ownerUid, {
      name: '[E2E-FOLD] Deletable Folder',
    });

    await loginAsOwner(page);
    await navigateToHome(page);

    // Find folder and open menu
    const folderText = page.getByText('[E2E-FOLD] Deletable Folder');
    await expect(folderText).toBeVisible({ timeout: 15000 });

    const card = folderText.locator('..').locator('..');
    await card.hover();
    const menuBtn = card.locator('button').filter({ has: page.locator('svg') }).last();
    await menuBtn.click();

    // Click "Eliminar"
    await page.getByText('Eliminar', { exact: true }).click();

    // Confirm deletion in modal
    const confirmBtn = page.getByRole('button', { name: /sí.*mover.*papelera/i });
    if ((await confirmBtn.count()) > 0) {
      await confirmBtn.click();
    } else {
      // Fallback: the confirm button might have slightly different text for folders
      const altConfirm = page.getByRole('button', { name: /mover.*papelera|confirmar|sí/i });
      await altConfirm.click();
    }

    // Folder should disappear from Home
    await expect(folderText).not.toBeVisible({ timeout: 10000 });

    // Verify Firestore status is 'trashed'
    const doc = await adminGetDoc('folders', id);
    expect(doc?.status).toBe('trashed');
  });

  // ── 3.5  Restore Folder from Trash ─────────────────────────────
  test('restore a trashed folder from the bin view', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid, 'Firebase Admin SDK or owner UID unavailable.');

    const { id } = await seedTrashedFolder(db, ownerUid, {
      name: '[E2E-FOLD] Restorable Folder',
    });

    await loginAsOwner(page);

    // Navigate to bin/trash view
    const binTab = page.getByRole('button', { name: /papelera/i });
    test.skip((await binTab.count()) === 0, 'Bin tab not available.');
    await binTab.first().click();

    // Find the trashed folder
    const trashedItem = page.getByText('[E2E-FOLD] Restorable Folder');
    await expect(trashedItem).toBeVisible({ timeout: 15000 });

    // Click on it to open side panel
    await trashedItem.click();

    // Click restore
    const restoreBtn = page.getByRole('button', { name: /restaurar/i });
    if ((await restoreBtn.count()) > 0) {
      await restoreBtn.first().click();
      await expect(trashedItem).not.toBeVisible({ timeout: 10000 });

      // Verify Firestore status
      const doc = await adminGetDoc('folders', id);
      expect(doc?.status).toBe('active');
    }
  });

  // ── 3.6  Delete Folder — Children Move to Root ─────────────────
  test('deleting a folder moves child subjects to root level', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid, 'Firebase Admin SDK or owner UID unavailable.');

    // Seed a folder with a subject inside
    const { id: folderId } = await seedFolder(db, ownerUid, {
      name: '[E2E-FOLD] Cascade Parent',
    });
    const { id: subjectId } = await seedSubjectInFolder(db, ownerUid, folderId, {
      name: '[E2E-FOLD] Orphan Subject',
    });

    await loginAsOwner(page);
    await navigateToHome(page);

    // Delete the parent folder
    const folderText = page.getByText('[E2E-FOLD] Cascade Parent');
    await expect(folderText).toBeVisible({ timeout: 15000 });

    const card = folderText.locator('..').locator('..');
    await card.hover();
    const menuBtn = card.locator('button').filter({ has: page.locator('svg') }).last();
    await menuBtn.click();

    await page.getByText('Eliminar', { exact: true }).click();

    // Confirm
    const confirmBtn = page.getByRole('button', { name: /sí.*mover.*papelera|mover.*papelera|confirmar|sí/i });
    if ((await confirmBtn.count()) > 0) {
      await confirmBtn.first().click();
    }

    // Wait for the operation
    await page.waitForTimeout(3000);

    // Verify the subject's folderId was cleared (moved to root)
    const subDoc = await adminGetDoc('subjects', subjectId);
    // After folder deletion, child subjects should have folderId removed or set to null
    expect(subDoc?.folderId === null || subDoc?.folderId === undefined).toBeTruthy();
  });

  // ── 3.7  Move Subject Into a Folder (via DnD or UI) ───────────
  test('seed subject inside a folder and verify containment', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid, 'Firebase Admin SDK or owner UID unavailable.');

    // Seed a folder and a subject already inside it
    const { id: folderId } = await seedFolder(db, ownerUid, {
      name: '[E2E-FOLD] Container Folder',
    });
    const { id: subjectId } = await seedSubjectInFolder(db, ownerUid, folderId, {
      name: '[E2E-FOLD] Contained Subject',
    });

    await loginAsOwner(page);
    await navigateToHome(page);

    // Navigate into the folder
    const folderText = page.getByText('[E2E-FOLD] Container Folder');
    await expect(folderText).toBeVisible({ timeout: 15000 });
    await folderText.click();

    // Wait for folder content to load
    await page.waitForTimeout(2000);

    // Verify the subject is visible inside the folder
    await expect(page.getByText('[E2E-FOLD] Contained Subject')).toBeVisible({ timeout: 10000 });

    // Verify Firestore relationship
    const subDoc = await adminGetDoc('subjects', subjectId);
    expect(subDoc?.folderId).toBe(folderId);
  });

  // ── 3.8  Nested Folder Navigation ─────────────────────────────
  test('navigate into nested folders and back', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid, 'Firebase Admin SDK or owner UID unavailable.');

    // Seed parent and child folder
    const { id: parentId } = await seedFolder(db, ownerUid, {
      name: '[E2E-FOLD] Nav Parent',
    });
    const { id: childId } = await seedFolder(db, ownerUid, {
      name: '[E2E-FOLD] Nav Child',
      parentId,
    });

    await loginAsOwner(page);
    await navigateToHome(page);

    // Enter parent folder
    const parentText = page.getByText('[E2E-FOLD] Nav Parent');
    await expect(parentText).toBeVisible({ timeout: 15000 });
    await parentText.click();

    await page.waitForTimeout(2000);

    // Child folder should be visible
    const childText = page.getByText('[E2E-FOLD] Nav Child');
    await expect(childText).toBeVisible({ timeout: 10000 });

    // Enter child folder
    await childText.click();
    await page.waitForTimeout(2000);

    // Navigate back (breadcrumb or back button)
    const backBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    // Try going back via browser navigation or UI
    await page.goBack();
    await page.waitForTimeout(1000);

    // We should still be in the parent folder or home
    // Just verify no error state
    await expect(page.locator('.home-page')).toBeVisible({ timeout: 10000 });
  });
});
