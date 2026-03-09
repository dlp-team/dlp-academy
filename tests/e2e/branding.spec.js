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

    const customizationTab = page.getByRole('button', { name: /personalización/i });
    const canCustomize = (await customizationTab.count()) > 0;
    test.skip(!canCustomize, 'Branding customization UI not available for current E2E account/role.');
    await customizationTab.click();

    const nameInput = page.locator('input[placeholder="Mi Institución"]').first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill('My Custom Academy');

    const primaryColorInput = page
      .locator('div:has-text("Color Primario") input[type="text"]')
      .first();
    await expect(primaryColorInput).toBeVisible({ timeout: 10000 });
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
