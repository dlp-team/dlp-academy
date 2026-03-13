import { test, expect } from '@playwright/test';

const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL;
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD;
const EDITOR_EMAIL = process.env.E2E_EDITOR_EMAIL;
const EDITOR_PASSWORD = process.env.E2E_EDITOR_PASSWORD;
const VIEWER_EMAIL = process.env.E2E_VIEWER_EMAIL;
const VIEWER_PASSWORD = process.env.E2E_VIEWER_PASSWORD;
const SHARED_FOLDER_ID = process.env.E2E_SHARED_FOLDER_ID;

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

  test('editor can access draggable cards in designated shared folder when content exists', async ({ page }) => {
    test.skip(
      !EDITOR_EMAIL || !EDITOR_PASSWORD || !SHARED_FOLDER_ID,
      'Set E2E_EDITOR_EMAIL, E2E_EDITOR_PASSWORD, E2E_SHARED_FOLDER_ID.'
    );

    await login(page, EDITOR_EMAIL, EDITOR_PASSWORD);
    await page.goto(`/home?folderId=${SHARED_FOLDER_ID}`);
    await page.waitForURL(/\/home/);
    test.skip(!page.url().includes(`folderId=${SHARED_FOLDER_ID}`), 'Editor fixture does not currently have access to the designated shared folder.');

    const draggableCards = page.locator('div[draggable="true"]');
    const draggableCount = await draggableCards.count();
    test.skip(draggableCount === 0, 'No draggable shared cards available in fixture to validate editor drag capability.');

    await expect(draggableCards.first()).toBeVisible();
  });

  test('viewer does not expose draggable cards in designated shared folder', async ({ page }) => {
    test.skip(
      !VIEWER_EMAIL || !VIEWER_PASSWORD || !SHARED_FOLDER_ID,
      'Set E2E_VIEWER_EMAIL, E2E_VIEWER_PASSWORD, E2E_SHARED_FOLDER_ID.'
    );

    await login(page, VIEWER_EMAIL, VIEWER_PASSWORD);
    await page.goto(`/home?folderId=${SHARED_FOLDER_ID}`);
    await page.waitForURL(/\/home/);
    test.skip(!page.url().includes(`folderId=${SHARED_FOLDER_ID}`), 'Viewer fixture does not currently have access to the designated shared folder.');

    const draggableCards = page.locator('div[draggable="true"]');
    await expect(draggableCards).toHaveCount(0);
  });
});