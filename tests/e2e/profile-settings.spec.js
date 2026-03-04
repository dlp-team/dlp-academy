import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;

test.describe('Profile and settings coverage', () => {
  test.skip(!E2E_EMAIL || !E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD to run profile/settings tests.');

  const login = async (page) => {
    await page.goto('/login');
    await page.locator('#email').fill(E2E_EMAIL || '');
    await page.locator('#password').fill(E2E_PASSWORD || '');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/home/);
  };

  test('profile route renders user surface and settings theme toggles work', async ({ page }) => {
    await login(page);

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

  test('profile edit modal opens and settings notification/view-mode controls react', async ({ page }) => {
    await login(page);

    await page.goto('/profile');
    await page.waitForURL(/\/profile/);

    await page.locator('//main//h1[1]/following-sibling::button[1]').click();
    await expect(page.getByRole('heading', { name: /editar perfil/i })).toBeVisible();

    const nameInput = page.locator('label:has-text("Nombre Completo") + input');
    const originalName = (await nameInput.inputValue()).trim();
    await nameInput.fill(originalName || 'Usuario E2E');

    const countrySelect = page.locator('label:has-text("País") + select');
    await countrySelect.selectOption({ index: 1 });

    await page.getByRole('button', { name: /cancelar/i }).click();
    await expect(page.getByRole('heading', { name: /editar perfil/i })).not.toBeVisible();

    await page.goto('/settings');
    await page.waitForURL(/\/settings/);

    const notifSection = page.locator('section').filter({ hasText: /notificaciones/i }).first();
    const notifToggles = notifSection.locator('button').filter({ has: page.locator('span') });
    await notifToggles.first().click();
    await expect(page.getByText(/guardado|guardando/i)).toBeVisible();

    const organizationSection = page.locator('section').filter({ hasText: /organización/i }).first();
    const rememberToggle = organizationSection.locator('button').filter({ has: page.locator('span') }).first();
    const viewDefaultLabel = page.getByText(/vista por defecto/i);
    const hasViewDefaultInitially = await viewDefaultLabel.first().isVisible().catch(() => false);
    if (!hasViewDefaultInitially) {
      await rememberToggle.click();
      await expect(viewDefaultLabel).toBeVisible();
    }

    const viewModeButtons = page.locator('//p[contains(normalize-space(),"Vista por defecto")]/ancestor::div[contains(@class,"p-4")][1]//button');
    await expect(viewModeButtons).toHaveCount(2);
    await viewModeButtons.nth(1).click();
    await expect(page.getByText(/guardado|guardando/i)).toBeVisible();
    await viewModeButtons.nth(0).click();
    await expect(page.getByText(/guardado|guardando/i)).toBeVisible();
  });
});
