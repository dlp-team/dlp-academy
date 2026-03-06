import { test, expect } from '@playwright/test';

const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL;
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD;
const ENABLE_BIN_E2E = process.env.E2E_BIN_TESTS === 'true';

const login = async (page, email, password) => {
  await page.goto('/login');
  await page.locator('#email').fill(email || '');
  await page.locator('#password').fill(password || '');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL(/\/home/);
  await expect(page.locator('.home-page')).toBeVisible();
};

test.describe('Bin view interactions', () => {
  test('selecting a trashed card opens side panel', async ({ page }) => {
    test.skip(!ENABLE_BIN_E2E, 'Set E2E_BIN_TESTS=true to run bin e2e scenarios.');
    test.skip(!OWNER_EMAIL || !OWNER_PASSWORD, 'Set E2E_OWNER_EMAIL and E2E_OWNER_PASSWORD.');

    await login(page, OWNER_EMAIL, OWNER_PASSWORD);
    const binTab = page.getByRole('button', { name: /papelera/i });
    test.skip((await binTab.count()) === 0, 'Bin tab is not available for this user/environment.');
    await binTab.first().click();

    const selectableCards = page.locator('[data-testid^="bin-subject-card-"]');
    test.skip((await selectableCards.count()) === 0, 'No trashed subjects available in this environment.');

    await selectableCards.first().click();
    await expect(page.getByTestId('bin-side-panel')).toBeVisible();
    await expect(page.getByText(/elemento seleccionado/i)).toBeVisible();
  });

  test('bin tab persists after reload', async ({ page }) => {
    test.skip(!ENABLE_BIN_E2E, 'Set E2E_BIN_TESTS=true to run bin e2e scenarios.');
    test.skip(!OWNER_EMAIL || !OWNER_PASSWORD, 'Set E2E_OWNER_EMAIL and E2E_OWNER_PASSWORD.');

    await login(page, OWNER_EMAIL, OWNER_PASSWORD);
    const binTab = page.getByRole('button', { name: /papelera/i });
    test.skip((await binTab.count()) === 0, 'Bin tab is not available for this user/environment.');
    await binTab.first().click();

    const persistedMode = await page.evaluate(() => localStorage.getItem('dlp_last_viewMode'));
    test.skip(!persistedMode, 'Remember organization is disabled for this account/environment.');

    await expect.poll(async () => {
      return page.evaluate(() => localStorage.getItem('dlp_last_viewMode'));
    }).toBe('bin');

    await page.reload();
    await expect.poll(async () => {
      return page.evaluate(() => localStorage.getItem('dlp_last_viewMode'));
    }).toBe('bin');
  });
});
