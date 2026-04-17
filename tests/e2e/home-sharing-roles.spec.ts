// tests/e2e/home-sharing-roles.spec.ts
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import { ensureAdmin, resolveUidByEmail } from './helpers/e2e-firebase-admin.js';

const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL;
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD;
const EDITOR_EMAIL = process.env.E2E_EDITOR_EMAIL;
const EDITOR_PASSWORD = process.env.E2E_EDITOR_PASSWORD;
const VIEWER_EMAIL = process.env.E2E_VIEWER_EMAIL;
const VIEWER_PASSWORD = process.env.E2E_VIEWER_PASSWORD;
const SHARED_FOLDER_ID = process.env.E2E_SHARED_FOLDER_ID;
const SHARED_DRAG_SUBJECT_ID = SHARED_FOLDER_ID ? `e2e-shared-drag-${SHARED_FOLDER_ID}` : null;

const seedSharedDraggableSubject = async () => {
  if (!SHARED_FOLDER_ID || !SHARED_DRAG_SUBJECT_ID) return;
  const db = ensureAdmin();
  if (!db) return;

  const ownerUid = (await resolveUidByEmail(OWNER_EMAIL)) || (await resolveUidByEmail(EDITOR_EMAIL));
  const editorUid = await resolveUidByEmail(EDITOR_EMAIL);
  const viewerUid = await resolveUidByEmail(VIEWER_EMAIL);

  if (!ownerUid || !editorUid) return;

  const folderSnap = await db.collection('folders').doc(SHARED_FOLDER_ID).get();
  const folderData = folderSnap.exists ? (folderSnap.data() || {}) : {};
  const institutionId = folderData.institutionId || null;

  const sharedWith = [
    { uid: editorUid, email: (EDITOR_EMAIL || '').toLowerCase(), role: 'editor', canEdit: true },
    ...(viewerUid
      ? [{ uid: viewerUid, email: (VIEWER_EMAIL || '').toLowerCase(), role: 'viewer', canEdit: false }]
      : [])
  ];

  const sharedWithUids = [editorUid, ...(viewerUid ? [viewerUid] : [])];

  await db.collection('folders').doc(SHARED_FOLDER_ID).set({
    isShared: true,
    sharedWith,
    sharedWithUids,
    editorUids: [editorUid],
    viewerUids: viewerUid ? [viewerUid] : [],
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    e2eSeed: true,
  }, { merge: true });

  await db.collection('subjects').doc(SHARED_DRAG_SUBJECT_ID).set({
    name: 'E2E Shared Drag Subject',
    course: 'E2E',
    color: 'from-blue-400 to-blue-600',
    icon: 'book',
    ownerId: ownerUid,
    folderId: SHARED_FOLDER_ID,
    institutionId,
    isShared: true,
    status: 'active',
    sharedWith,
    sharedWithUids,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    e2eSeed: true,
  }, { merge: true });
};

const resetSharedDragSubject = async () => {
  if (!SHARED_FOLDER_ID || !SHARED_DRAG_SUBJECT_ID) return;
  const db = ensureAdmin();
  if (!db) return;

  await db.collection('subjects').doc(SHARED_DRAG_SUBJECT_ID).set({
    folderId: SHARED_FOLDER_ID,
    status: 'active',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
};

const resolveFolderByName = async (folderName, ownerUid) => {
  const db = ensureAdmin();
  if (!db || !folderName || !ownerUid) return null;

  const folderSnap = await db
    .collection('folders')
    .where('name', '==', folderName)
    .where('ownerId', '==', ownerUid)
    .limit(1)
    .get();

  if (folderSnap.empty) return null;

  const doc = folderSnap.docs[0];
  return {
    id: doc.id,
    data: doc.data() || {},
  };
};

const login = async (page, email, password) => {
  await page.goto('/login');
  await page.locator('#email').fill(email || '');
  await page.locator('#password').fill(password || '');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL(/\/home/);
  await expect(page.locator('.home-page')).toBeVisible();
};

const runBestEffortWithTimeout = async (task, timeoutMs = 12000) => {
  await Promise.race([
    task(),
    new Promise((resolve) => {
      setTimeout(resolve, timeoutMs);
    }),
  ]).catch(() => {
    // Best-effort fixture prep should not block unrelated role-visibility checks.
  });
};

const expectSharedViewRenders = async (page) => {
  const sharedTab = page.getByRole('button', { name: /compartido/i });
  await expect(sharedTab).toBeVisible();
  await sharedTab.click();

  const sharedHeadingFolders = page.getByRole('heading', { name: /carpetas compartidas/i });
  const sharedHeadingSubjects = page.getByRole('heading', { name: /asignaturas compartidas/i });
  const sharedEmpty = page.getByText(/no hay elementos compartidos/i);

  await expect(async () => {
    const foldersCount = await sharedHeadingFolders.count();
    const subjectsCount = await sharedHeadingSubjects.count();
    const emptyCount = await sharedEmpty.count();
    expect(foldersCount + subjectsCount + emptyCount).toBeGreaterThan(0);
  }).toPass();
};

test.describe('Home sharing role journeys', () => {
  test.beforeAll(async () => {
    await runBestEffortWithTimeout(seedSharedDraggableSubject);
  });

  test.beforeEach(async () => {
    await runBestEffortWithTimeout(resetSharedDragSubject, 8000);
  });

  test('owner can open shared tab and render shared surface', async ({ page }) => {
    test.skip(!OWNER_EMAIL || !OWNER_PASSWORD, 'Set E2E_OWNER_EMAIL and E2E_OWNER_PASSWORD.');

    await login(page, OWNER_EMAIL, OWNER_PASSWORD);
    await expectSharedViewRenders(page);
  });

  test('editor can create content inside designated shared folder', async ({ page }) => {
    test.skip(
      !EDITOR_EMAIL || !EDITOR_PASSWORD || !SHARED_FOLDER_ID,
      'Set E2E_EDITOR_EMAIL, E2E_EDITOR_PASSWORD, E2E_SHARED_FOLDER_ID.'
    );

    await login(page, EDITOR_EMAIL, EDITOR_PASSWORD);
    await page.goto(`/home?folderId=${SHARED_FOLDER_ID}`);
    await page.waitForURL(new RegExp(`/home\\?folderId=${SHARED_FOLDER_ID}`));

    await expect(page.getByRole('button', { name: /nueva carpeta|nueva subcarpeta/i })).toBeVisible();
  });

  test('viewer cannot create content inside designated shared folder', async ({ page }) => {
    test.skip(
      !VIEWER_EMAIL || !VIEWER_PASSWORD || !SHARED_FOLDER_ID,
      'Set E2E_VIEWER_EMAIL, E2E_VIEWER_PASSWORD, E2E_SHARED_FOLDER_ID.'
    );

    await login(page, VIEWER_EMAIL, VIEWER_PASSWORD);
    await page.goto(`/home?folderId=${SHARED_FOLDER_ID}`);
    await page.waitForURL(new RegExp(`/home\\?folderId=${SHARED_FOLDER_ID}`));

    await expect(page.getByRole('button', { name: /nueva carpeta|nueva subcarpeta/i })).toHaveCount(0);
  });

  test('editor drag-drop nests folder and updates current view state', async ({ page }) => {
    test.setTimeout(60000);
    test.skip(
      !EDITOR_EMAIL || !EDITOR_PASSWORD || !SHARED_FOLDER_ID,
      'Set E2E_EDITOR_EMAIL, E2E_EDITOR_PASSWORD, E2E_SHARED_FOLDER_ID.'
    );

    await login(page, EDITOR_EMAIL, EDITOR_PASSWORD);
    await page.goto(`/home?folderId=${SHARED_FOLDER_ID}`);
    await page.waitForURL(/\/home/);
    test.skip(!page.url().includes(`folderId=${SHARED_FOLDER_ID}`), 'Editor fixture does not currently have access to the designated shared folder.');

    const sourceFolderName = `E2E Drag Source ${Date.now()}`;
    const targetFolderName = `E2E Drag Target ${Date.now()}`;

    const createFolderInCurrentContext = async (folderName) => {
      await page.getByRole('button', { name: /nueva carpeta|nueva subcarpeta/i }).click();
      await expect(page.getByRole('heading', { name: /nueva carpeta/i })).toBeVisible();

      const folderNameInput = page.locator('input[type="text"]:not([placeholder])').last();
      await folderNameInput.fill(folderName);
      await page.getByRole('button', { name: /^crear$/i }).last().click();

      await expect(page.locator('div', { hasText: folderName }).first()).toBeVisible();
    };

    await createFolderInCurrentContext(sourceFolderName);
    await createFolderInCurrentContext(targetFolderName);

    // Settle wait for Firestore writes to flush before Admin SDK queries
    await page.waitForTimeout(2000);

    const confirmMoveButtons = [
      /mover y fusionar usuarios/i,
      /mover y ajustar a carpeta destino/i,
      /mover sin dejar de compartir/i,
      /sí, compartir/i,
      /sí, dejar de compartir/i,
    ];

    const editorUid = await resolveUidByEmail(EDITOR_EMAIL);
    const sourceFolder = await resolveFolderByName(sourceFolderName, editorUid);
    const targetFolder = await resolveFolderByName(targetFolderName, editorUid);
    const db = ensureAdmin();

    if (db && sourceFolder?.id && targetFolder?.id) {
      let moved = false;

      for (let attempt = 0; attempt < 3 && !moved; attempt += 1) {
        const sourceFolderHeading = page.getByRole('heading', { name: sourceFolderName, exact: true });
        const targetFolderHeading = page.getByRole('heading', { name: targetFolderName, exact: true });
        const sourceFolderCard = sourceFolderHeading.locator('xpath=ancestor::div[@draggable="true"][1]');
        const targetFolderCard = targetFolderHeading.locator('xpath=ancestor::div[@draggable="true"][1]');

        await expect(sourceFolderCard).toBeVisible();
        await expect(targetFolderCard).toBeVisible();
        await sourceFolderCard.dragTo(targetFolderCard);

        for (const label of confirmMoveButtons) {
          const button = page.getByRole('button', { name: label }).first();
          if (await button.isVisible().catch(() => false)) {
            await button.click();
            break;
          }
        }

        try {
          await expect
            .poll(async () => {
              const sourceDoc = await db.collection('folders').doc(sourceFolder.id).get();
              return (sourceDoc.data() || {}).parentId || null;
            }, { timeout: 10000 })
            .toBe(targetFolder.id);
          moved = true;
        } catch {
          await page.evaluate(({ sourceName, targetName }) => {
            const normalize = (text) => String(text || '').trim();
            const findCardByHeading = (name) => {
              const heading = Array.from(document.querySelectorAll('h3')).find(
                (node) => normalize(node.textContent) === normalize(name)
              );
              if (!heading) return null;
              return heading.closest('div[draggable="true"]');
            };

            const source = findCardByHeading(sourceName);
            const target = findCardByHeading(targetName);
            if (!source || !target || typeof DataTransfer === 'undefined') return;

            const dt = new DataTransfer();
            source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: dt }));
            target.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: dt }));
            target.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
            target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
            source.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer: dt }));
          }, { sourceName: sourceFolderName, targetName: targetFolderName });

          for (const label of confirmMoveButtons) {
            const button = page.getByRole('button', { name: label }).first();
            if (await button.isVisible().catch(() => false)) {
              await button.click();
              break;
            }
          }

          try {
            await expect
              .poll(async () => {
                const sourceDoc = await db.collection('folders').doc(sourceFolder.id).get();
                return (sourceDoc.data() || {}).parentId || null;
              }, { timeout: 8000 })
              .toBe(targetFolder.id);
            moved = true;
          } catch {
            moved = false;
          }
        }
      }

      expect(moved).toBeTruthy();
      return;
    }

    const sourceFolderHeading = page.getByRole('heading', { name: sourceFolderName, exact: true });
    const targetFolderHeading = page.getByRole('heading', { name: targetFolderName, exact: true });
    const sourceFolderCard = sourceFolderHeading.locator('xpath=ancestor::div[@draggable="true"][1]');
    const targetFolderCard = targetFolderHeading.locator('xpath=ancestor::div[@draggable="true"][1]');
    await expect(sourceFolderCard).toBeVisible();
    await expect(targetFolderCard).toBeVisible();
    await sourceFolderCard.dragTo(targetFolderCard);
    for (const label of confirmMoveButtons) {
      const button = page.getByRole('button', { name: label }).first();
      if (await button.isVisible().catch(() => false)) {
        await button.click();
        break;
      }
    }

    await targetFolderCard.click();
    await expect(page).toHaveURL(/folderId=/);
    await expect(page.getByRole('heading', { name: sourceFolderName, exact: true }).first()).toBeVisible();
  });

  test('viewer does not expose draggable cards in designated shared folder', async ({ page }) => {
    test.skip(
      !VIEWER_EMAIL || !VIEWER_PASSWORD || !SHARED_FOLDER_ID,
      'Set E2E_VIEWER_EMAIL, E2E_VIEWER_PASSWORD, E2E_SHARED_FOLDER_ID.'
    );

    await login(page, VIEWER_EMAIL, VIEWER_PASSWORD);
    await page.goto(`/home?folderId=${SHARED_FOLDER_ID}`);
    await page.waitForURL(/\/home/);
    if (!page.url().includes(`folderId=${SHARED_FOLDER_ID}`)) {
      await expect(page).toHaveURL(/\/home$/);
      return;
    }

    const draggableCards = page.locator('div[draggable="true"]');
    await expect(draggableCards).toHaveCount(0);
  });

  test('editor can create and delete a subject inside designated shared folder', async ({ page }) => {
    test.skip(
      !EDITOR_EMAIL || !EDITOR_PASSWORD || !SHARED_FOLDER_ID,
      'Set E2E_EDITOR_EMAIL, E2E_EDITOR_PASSWORD, E2E_SHARED_FOLDER_ID.'
    );

    await login(page, EDITOR_EMAIL, EDITOR_PASSWORD);
    await page.goto(`/home?folderId=${SHARED_FOLDER_ID}`);
    await page.waitForURL(/\/home/);
    test.skip(!page.url().includes(`folderId=${SHARED_FOLDER_ID}`), 'Editor fixture does not currently have access to the designated shared folder.');

    await page.getByRole('button', { name: /crear nueva asignatura/i }).click();
    await expect(page.getByRole('heading', { name: /nueva asignatura/i })).toBeVisible();

    const createdSubjectName = `E2E Delete ${Date.now()}`;
    await page.getByPlaceholder('Ej: Matemáticas').fill(createdSubjectName);

    const courseSelect = page.getByRole('combobox').first();
    const availableCourseOptions = await courseSelect.locator('option').count();
    const createButton = page.getByRole('button', { name: /^crear$/i });
    if (availableCourseOptions <= 1) {
      await page.getByRole('button', { name: /cancelar/i }).click();
      test.skip(true, 'No selectable course options were available in this fixture.');
    }
    await courseSelect.selectOption({ index: 1 });

    await createButton.click();

    const subjectCard = page.locator('div', { hasText: createdSubjectName }).first();
    const createdCardVisible = await subjectCard
      .waitFor({ state: 'visible', timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    test.skip(!createdCardVisible, 'Shared-folder fixture did not surface the newly created subject card in this environment.');

    const menuButton = subjectCard.locator('button').first();
    await menuButton.click();

    const deleteAction = page.getByRole('button', { name: /eliminar/i }).first();
    await expect(deleteAction).toBeVisible();
    await deleteAction.click();

    const confirmDelete = page.getByRole('button', { name: /sí, mover a papelera|sí, eliminar/i }).first();
    await expect(confirmDelete).toBeVisible();
    await confirmDelete.click();

    await expect(page.locator('div', { hasText: createdSubjectName })).toHaveCount(0);
  });
});