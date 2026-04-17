import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;

test.describe('Auth foundation', () => {
  test('register page renders required fields', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByRole('heading', { name: /crear cuenta/i })).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test('existing credential can login and land on home', async ({ page }) => {
    test.skip(!E2E_EMAIL || !E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD for login assertion.');

    await page.goto('/login');
    await page.locator('#email').fill(E2E_EMAIL || '');
    await page.locator('#password').fill(E2E_PASSWORD || '');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL(/\/home/);
    await expect(page.locator('.home-page')).toBeVisible();
  });

});
