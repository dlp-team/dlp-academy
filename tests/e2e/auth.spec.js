import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;

test.describe('Auth smoke', () => {
  test.skip(!E2E_EMAIL || !E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD to run auth E2E tests.');

  test('user can login and reach home', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(E2E_EMAIL || '');
    await page.locator('#password').fill(E2E_PASSWORD || '');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL(/\/home/);
    await expect(page.locator('.home-page')).toBeVisible();
  });
});
