import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';

const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL;
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD;
const EDITOR_EMAIL = process.env.E2E_EDITOR_EMAIL;
const EDITOR_PASSWORD = process.env.E2E_EDITOR_PASSWORD;
const VIEWER_EMAIL = process.env.E2E_VIEWER_EMAIL;
const VIEWER_PASSWORD = process.env.E2E_VIEWER_PASSWORD;
const SHARED_FOLDER_ID = process.env.E2E_SHARED_FOLDER_ID;
const SHARED_DRAG_SUBJECT_ID = SHARED_FOLDER_ID ? `e2e-shared-drag-${SHARED_FOLDER_ID}` : null;

const ensureAdmin = () => {
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountRaw) return null;

  try {
    const normalized = serviceAccountRaw.trim().replace(/^'/, '').replace(/'$/, '');
    const serviceAccount = JSON.parse(normalized);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    return admin.firestore();
  } catch {
    return null;
  }
};

const resolveUidByEmail = async (email) => {
  if (!email) return null;
  try {
    const authUser = await admin.auth().getUserByEmail(String(email).trim().toLowerCase());
    return authUser?.uid || null;
  } catch {
    return null;
  }
};

const seedSharedDraggableSubject = async () => {
  if (!SHARED_FOLDER_ID) return;
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

const login = async (page, email, password) => {
  await page.goto('/login');
  await page.locator('#email').fill(email || '');
  await page.locator('#password').fill(password || '');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL(/\/home/);
  await expect(page.locator('.home-page')).toBeVisible();
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
    await seedSharedDraggableSubject();
  });

  test.beforeEach(async () => {
    await resetSharedDragSubject();
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

    const sourceFolderCard = page.locator('div[draggable="true"]', { hasText: sourceFolderName }).first();
    const targetFolderCard = page.locator('div[draggable="true"]', { hasText: targetFolderName }).first();
    await expect(sourceFolderCard).toBeVisible();
    await expect(targetFolderCard).toBeVisible();

    await sourceFolderCard.dragTo(targetFolderCard);

    await expect(async () => {
      const sourceCount = await page.locator('div', { hasText: sourceFolderName }).count();
      expect(sourceCount).toBe(0);
    }).toPass();
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
    if (availableCourseOptions <= 1) {
      await expect(page.getByText(/no hay cursos disponibles en la institución/i)).toBeVisible();
      await page.getByRole('button', { name: /cancelar/i }).click();
      return;
    }
    await courseSelect.selectOption({ index: 1 });

    await page.getByRole('button', { name: /^crear$/i }).click();

    const subjectCard = page.locator('div', { hasText: createdSubjectName }).first();
    await expect(subjectCard).toBeVisible();

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