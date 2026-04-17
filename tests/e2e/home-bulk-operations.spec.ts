// tests/e2e/home-bulk-operations.spec.ts
import { test, expect } from '@playwright/test';
import {
  ensureAdmin,
  resolveUidByEmail,
  adminGetDoc,
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
  buildSubjectId,
  buildSubjectData,
  buildFolderId,
  buildFolderData,
} from './helpers/e2e-data-factories';
import { cleanup } from './helpers/e2e-cleanup';

const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL;

let ownerUid = null;

// ─── Seeding helpers ─────────────────────────────────────────────
const seedSubject = async (db, ownerId, overrides = {}) => {
  const id = buildSubjectId('bulk');
  const data = buildSubjectData(ownerId, overrides);
  await db.collection('subjects').doc(id).set(data);
  cleanup.register('subjects', id);
  return { id, data };
};

const seedFolder = async (db, ownerId, overrides = {}) => {
  const id = buildFolderId('bulk');
  const data = buildFolderData(ownerId, overrides);
  await db.collection('folders').doc(id).set(data);
  cleanup.register('folders', id);
  return { id, data };
};

// ─── Suite ───────────────────────────────────────────────────────
test.describe('Home — Bulk operations', () => {
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

  // ── 5.1  Enter selection mode ──────────────────────────────────
  test('enter and exit selection mode', async ({ page }) => {
    await loginAsOwner(page);

    // Click "Modo selección" button
    const selectBtn = page.getByRole('button', { name: /modo selección/i });
    await expect(selectBtn).toBeVisible({ timeout: 10000 });
    await selectBtn.click();

    // Selection toolbar should show "0 seleccionados"
    await expect(page.getByText(/0 seleccionados/)).toBeVisible({ timeout: 5000 });

    // Exit selection mode
    const exitBtn = page.getByRole('button', { name: /salir de la selección/i });
    await exitBtn.click();

    // Selection count should disappear
    await expect(page.getByText(/seleccionados/)).not.toBeVisible({ timeout: 5000 });
  });

  // ── 5.2  Select multiple items ─────────────────────────────────
  test('select multiple subjects in selection mode', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid, 'Firebase Admin SDK or owner UID unavailable.');

    // Seed two subjects
    await seedSubject(db, ownerUid, { name: '[E2E-BULK] Select A' });
    await seedSubject(db, ownerUid, { name: '[E2E-BULK] Select B' });

    await loginAsOwner(page);
    await navigateToHome(page);

    // Enter selection mode
    const selectBtn = page.getByRole('button', { name: /modo selección/i });
    await expect(selectBtn).toBeVisible({ timeout: 10000 });
    await selectBtn.click();

    // Click on both subjects to select them
    const itemA = page.getByText('[E2E-BULK] Select A');
    const itemB = page.getByText('[E2E-BULK] Select B');

    await expect(itemA).toBeVisible({ timeout: 15000 });
    await expect(itemB).toBeVisible({ timeout: 5000 });

    await itemA.click({ force: true });
    await page.waitForTimeout(500);
    await itemB.click({ force: true });

    // Ensure both items are selected before executing bulk delete
    await expect(page.getByText(/2 seleccionados/)).toBeVisible({ timeout: 5000 });

    // Should show "2 seleccionados"
    await expect(page.getByText(/2 seleccionados/)).toBeVisible({ timeout: 5000 });

    // Clear selection
    const clearBtn = page.getByRole('button', { name: /limpiar/i });
    if ((await clearBtn.count()) > 0) {
      await clearBtn.click();
      await expect(page.getByText(/0 seleccionados/)).toBeVisible({ timeout: 5000 });
    }
  });

  // ── 5.3  Bulk delete selected items ────────────────────────────
  test('bulk delete moves selected subjects to trash', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid, 'Firebase Admin SDK or owner UID unavailable.');

    const { id: idA } = await seedSubject(db, ownerUid, { name: '[E2E-BULK] Delete A' });
    const { id: idB } = await seedSubject(db, ownerUid, { name: '[E2E-BULK] Delete B' });

    await loginAsOwner(page);
    await navigateToHome(page);

    // Enter selection mode
    await page.getByRole('button', { name: /modo selección/i }).click();

    // Select both items
    const itemA = page.getByText('[E2E-BULK] Delete A');
    const itemB = page.getByText('[E2E-BULK] Delete B');
    await expect(itemA).toBeVisible({ timeout: 15000 });
    await itemA.click({ force: true });
    await page.waitForTimeout(500);
    await itemB.click({ force: true });

    // Ensure both items are selected before executing bulk move
    await expect(page.getByText(/2 seleccionados/)).toBeVisible({ timeout: 5000 });

    // Click "Mover a papelera"
    const deleteBtn = page.getByRole('button', { name: /mover a papelera/i });
    await expect(deleteBtn).toBeEnabled();
    await deleteBtn.click();

    // Confirm if a dialog appears
    const confirmBtn = page.getByRole('button', { name: /sí|confirmar|mover/i });
    if ((await confirmBtn.count()) > 0) {
      await confirmBtn.first().click();
    }

    // Verify both are eventually trashed in Firestore
    await expect
      .poll(async () => {
        const docA = await adminGetDoc('subjects', idA);
        const docB = await adminGetDoc('subjects', idB);
        return {
          statusA: docA?.status ?? null,
          statusB: docB?.status ?? null,
        };
      }, {
        timeout: 30000,
        message: 'Expected both selected subjects to be moved to trash',
      })
      .toEqual({ statusA: 'trashed', statusB: 'trashed' });
  });

  // ── 5.4  Bulk move to a folder ─────────────────────────────────
  test('bulk move selected subjects into a folder', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid, 'Firebase Admin SDK or owner UID unavailable.');

    // Seed a target folder and two subjects
    const uniqueTag = Date.now().toString().slice(-6);
    const { id: folderId } = await seedFolder(db, ownerUid, { name: '[E2E-BULK] Target Folder' });
    const moveNameA = `[E2E-BULK] Move A ${uniqueTag}`;
    const moveNameB = `[E2E-BULK] Move B ${uniqueTag}`;
    const { id: idA } = await seedSubject(db, ownerUid, { name: moveNameA });
    const { id: idB } = await seedSubject(db, ownerUid, { name: moveNameB });

    await loginAsOwner(page);
    await navigateToHome(page);

    // Enter selection mode
    await page.getByRole('button', { name: /modo selección/i }).click();

    // Select both subjects
    const itemA = page.getByText(moveNameA).first();
    const itemB = page.getByText(moveNameB).first();
    await expect(itemA).toBeVisible({ timeout: 15000 });
    await itemA.click({ force: true });
    await page.waitForTimeout(500);
    await itemB.click({ force: true });

    // Select the target folder from the dropdown
    const folderSelect = page.locator('select[aria-label="Destino para mover selección"]');
    if ((await folderSelect.count()) > 0) {
      await folderSelect.selectOption(folderId);

      // Click "Mover a..."
      const moveBtn = page.getByRole('button', { name: /mover a\.\.\./i });
      await moveBtn.click();

      // Confirm if dialog appears
      const confirmBtn = page.getByRole('button', { name: /sí|confirmar|mover/i });
      if ((await confirmBtn.count()) > 0) {
        await confirmBtn.first().click();
      }

      // Verify both subjects eventually move into the target folder
      await expect
        .poll(async () => {
          const docA = await adminGetDoc('subjects', idA);
          const docB = await adminGetDoc('subjects', idB);
          return {
            folderA: docA?.folderId ?? null,
            folderB: docB?.folderId ?? null,
          };
        }, {
          timeout: 30000,
          message: 'Expected both selected subjects to be moved into target folder',
        })
        .toEqual({ folderA: folderId, folderB: folderId });
    }
  });

  // ── 5.5  Create folder from selection ──────────────────────────
  test('create a new folder from selected subjects', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid, 'Firebase Admin SDK or owner UID unavailable.');

    const { id: idA } = await seedSubject(db, ownerUid, { name: '[E2E-BULK] Group A' });
    const { id: idB } = await seedSubject(db, ownerUid, { name: '[E2E-BULK] Group B' });

    await loginAsOwner(page);
    await navigateToHome(page);

    // Enter selection mode
    await page.getByRole('button', { name: /modo selección/i }).click();

    // Select both subjects
    const itemA = page.getByText('[E2E-BULK] Group A');
    const itemB = page.getByText('[E2E-BULK] Group B');
    await expect(itemA).toBeVisible({ timeout: 15000 });
    await itemA.click({ force: true });
    await page.waitForTimeout(500);
    await itemB.click({ force: true });

    // Click "Crear carpeta"
    const createFolderBtn = page.getByRole('button', { name: /crear carpeta/i });
    if ((await createFolderBtn.count()) > 0) {
      await createFolderBtn.click();

      // A folder modal might appear to name the folder, or it may auto-create
      const nameInput = page.locator('.transform input[type="text"]').first();
      if ((await nameInput.count()) > 0) {
        const folderName = `[E2E-BULK] Grouped ${Date.now()}`;
        await nameInput.fill(folderName);

        const submitBtn = page.getByRole('button', { name: /^crear$/i });
        if ((await submitBtn.count()) > 0) {
          await submitBtn.click();
        }

        await page.waitForTimeout(3000);

        // Verify the new folder was created
        await expect(page.getByText(folderName)).toBeVisible({ timeout: 10000 });

        // Clean up the created folder
        const snap = await db.collection('folders')
          .where('ownerId', '==', ownerUid)
          .where('name', '==', folderName)
          .get();
        for (const doc of snap.docs) {
          cleanup.register('folders', doc.id);
        }
      }
    }
  });

  // ── 5.6  Bulk move to root ("Mover a inicio") ─────────────────
  test('bulk move subjects from a folder back to root', async ({ page }) => {
    const db = ensureAdmin();
    test.skip(!db || !ownerUid, 'Firebase Admin SDK or owner UID unavailable.');

    // Seed a folder with subjects inside
    const { id: folderId } = await seedFolder(db, ownerUid, { name: '[E2E-BULK] Source Folder' });
    const { id: idA } = await seedSubject(db, ownerUid, {
      name: '[E2E-BULK] Root A',
      folderId,
    });

    await loginAsOwner(page);
    await navigateToHome(page);

    // Navigate into the folder
    const folder = page.getByText('[E2E-BULK] Source Folder');
    await expect(folder).toBeVisible({ timeout: 15000 });
    await folder.click({ force: true });
    await expect(page.getByText('[E2E-BULK] Root A')).toBeVisible({ timeout: 10000 });

    // Enter selection mode
    const selectBtn = page.getByRole('button', { name: /modo selección/i });
    if ((await selectBtn.count()) > 0) {
      await selectBtn.click();

      // Select the subject
      await page.getByText('[E2E-BULK] Root A').click({ force: true });

      // Select "Mover a inicio" (empty value in dropdown)
      const folderSelect = page.locator('select[aria-label="Destino para mover selección"]');
      if ((await folderSelect.count()) > 0) {
        await folderSelect.selectOption(''); // empty = root

        const moveBtn = page.getByRole('button', { name: /mover a\.\.\./i });
        await moveBtn.click();

        // Confirm if dialog appears
        const confirmBtn = page.getByRole('button', { name: /sí|confirmar|mover/i });
        if ((await confirmBtn.count()) > 0) {
          await confirmBtn.first().click();
        }

        await page.waitForTimeout(3000);

        // Verify subject is now at root
        const doc = await adminGetDoc('subjects', idA);
        expect(doc?.folderId === null || doc?.folderId === undefined || doc?.folderId === '').toBeTruthy();
      }
    }
  });
});
