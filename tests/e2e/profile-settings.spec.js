import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;

test.describe('Profile and settings coverage', () => {
  test.skip(!E2E_EMAIL || !E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD to run profile/settings tests.');

  test('profile route renders user surface and settings theme toggles work', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(E2E_EMAIL || '');
    await page.locator('#password').fill(E2E_PASSWORD || '');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL(/\/home/);

    await page.goto('/profile');
    await page.waitForURL(/\/profile/);

    await expect(page.getByRole('button', { name: /cerrar sesión/i })).toBeVisible();
    await expect(page.getByText(/plan gratuito/i)).toBeVisible();

    await page.goto('/settings');
    await page.waitForURL(/\/settings/);

    await expect(page.getByRole('heading', { name: /configuración/i })).toBeVisible();
    await expect(page.getByText(/apariencia/i)).toBeVisible();

    await page.getByRole('button', { name: /oscuro/i }).click();
    await expect
      .poll(async () => page.evaluate(() => document.documentElement.classList.contains('dark')))
      .toBe(true);

    await page.getByRole('button', { name: /claro/i }).click();
    await expect
      .poll(async () => page.evaluate(() => document.documentElement.classList.contains('dark')))
      .toBe(false);

    const languageSelect = page.locator('select').first();
    await languageSelect.selectOption('en');
    await expect(languageSelect).toHaveValue('en');

    await expect(page.getByText(/guardado/i)).toBeVisible();
  });
});
