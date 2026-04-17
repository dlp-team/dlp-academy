// tests/e2e/notifications.spec.js
import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;

const login = async (page) => {
  await page.goto('/login');
  await page.locator('#email').fill(E2E_EMAIL || '');
  await page.locator('#password').fill(E2E_PASSWORD || '');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL(/\/home/);
};

test.describe('Notifications route navigation', () => {
  test.skip(!E2E_EMAIL || !E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD to run notifications e2e tests.');

  test('opens notifications history route from panel full-history action', async ({ page }) => {
    await login(page);

    const mailboxButton = page.getByTitle(/mailbox/i);
    await expect(mailboxButton).toBeVisible();
    await mailboxButton.click();

    const openAllButton = page.getByRole('button', { name: /ver todas/i });
    await expect(openAllButton).toBeVisible();
    await openAllButton.click();

    await page.waitForURL(/\/notifications/);
    await expect(page.getByRole('heading', { name: /historial de notificaciones/i })).toBeVisible();
  });
});
