import { test, expect } from '@playwright/test';

test.describe('Institution Customization Flow', () => {

  test('Admin can change primary brand color and see live preview', async ({ page }) => {
    // 1. Navigate to the login page and log in (replace with your test credentials)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@testinstitution.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // 2. Wait for navigation to the Home page, then go to the Admin Dashboard
    await page.waitForURL('/home');
    await page.goto('/admin-dashboard');

    // 3. Locate the "Institution Name" input and change it
    const nameInput = page.locator('input[name="institutionDisplayName"]');
    await nameInput.fill('My Custom Academy');

    // 4. Locate the color picker for the Primary color and change it to Red (#ff0000)
    // Note: Adjust the locator based on the actual ID or aria-label in your InstitutionAdminDashboard.jsx
    const primaryColorInput = page.locator('input[name="primaryColor"]'); 
    await primaryColorInput.fill('#ff0000');

    // 5. Assert: Check if the Live Preview container updated its CSS variable
    // We target a mock card or the preview container that should receive the inline style
    const previewContainer = page.locator('.home-page-preview-container'); // Adjust class name to match Claude's layout
    
    // Playwright evaluates the computed style in the browser
    const primaryColorVar = await previewContainer.evaluate((el) => {
        return window.getComputedStyle(el).getPropertyValue('--home-primary').trim();
    });

    // Verify the color was applied!
    expect(primaryColorVar).toBe('#ff0000');

    // 6. (Optional) Click save and verify success toast
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=Cambios guardados correctamente')).toBeVisible();
  });

});
