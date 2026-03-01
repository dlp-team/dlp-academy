import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;

test.describe('User journey smoke', () => {
  test.skip(!E2E_EMAIL || !E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD to run user journey tests.');

  test('home -> subject -> profile -> settings theme works', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(E2E_EMAIL || '');
    await page.locator('#password').fill(E2E_PASSWORD || '');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL(/\/home/);
    await expect(page.locator('.home-page')).toBeVisible();

    const subjectId = process.env.E2E_SUBJECT_ID;
    if (subjectId) {
      await page.goto(`/home/subject/${subjectId}`);
      await page.waitForURL(new RegExp(`/home/subject/${subjectId}`));
      await expect(page.getByRole('button', { name: /crear nuevo tema/i })).toBeVisible();
    }

    await page.goto('/profile');
    await page.waitForURL(/\/profile/);
    await expect(page.locator('main')).toBeVisible();

    await page.goto('/settings');
    await page.waitForURL(/\/settings/);
    await page.getByRole('button', { name: /oscuro/i }).click();

    await expect
      .poll(async () => page.evaluate(() => document.documentElement.classList.contains('dark')))
      .toBe(true);
  });
});
