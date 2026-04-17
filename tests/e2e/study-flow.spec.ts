import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;
const RUN_MUTATING = process.env.E2E_RUN_MUTATIONS === 'true';

test.describe('Study organization flow', () => {
  test.skip(!E2E_EMAIL || !E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD to run study flow tests.');
  test.skip(!RUN_MUTATING, 'Set E2E_RUN_MUTATIONS=true to run mutating flow tests.');

  test('create flow surfaces are available (folder/subject/topic)', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(E2E_EMAIL || '');
    await page.locator('#password').fill(E2E_PASSWORD || '');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/home/);

    await expect(page.locator('.home-page')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /nueva asignatura|nueva carpeta|crear/i }).first()
    ).toBeVisible();

    const subjectId = process.env.E2E_SUBJECT_ID;
    test.skip(!subjectId, 'Set E2E_SUBJECT_ID to verify topic creation surface in subject page.');

    await page.goto(`/home/subject/${subjectId}`);
    await page.waitForURL(new RegExp(`/home/subject/${subjectId}`));
    await expect(page.getByRole('button', { name: /crear nuevo tema/i })).toBeVisible();
  });
});
