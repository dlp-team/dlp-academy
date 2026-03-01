import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;
const E2E_BRANDING_PATH = process.env.E2E_BRANDING_PATH || '/institution-admin-dashboard';

test.describe('Institution Customization Flow', () => {
  test.skip(!E2E_EMAIL || !E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD to run branding E2E tests.');

  test('admin can update branding form fields', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(E2E_EMAIL || '');
    await page.locator('#password').fill(E2E_PASSWORD || '');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL(/\/home/);
    await page.goto(E2E_BRANDING_PATH);

    await page.waitForURL(new RegExp(E2E_BRANDING_PATH.replace('/', '\\/')));

    const nameInput = page.locator('input[name="institutionDisplayName"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('My Custom Academy');

    const primaryColorInput = page.locator('input[name="primaryColor"]');
    await expect(primaryColorInput).toBeVisible();
    await primaryColorInput.fill('#ff0000');

    await expect(nameInput).toHaveValue('My Custom Academy');
    await expect(primaryColorInput).toHaveValue('#ff0000');

    const saveButton = page.getByRole('button', { name: /guardar cambios|save changes/i }).first();
    if (await saveButton.count()) {
      await saveButton.click();
      await expect(page.getByText(/cambios guardados|guardados correctamente|saved/i).first()).toBeVisible();
    }
  });
});
