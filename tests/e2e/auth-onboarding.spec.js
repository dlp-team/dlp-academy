import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;
const E2E_ONBOARDING_EMAIL = process.env.E2E_ONBOARDING_EMAIL;
const E2E_ONBOARDING_PASSWORD = process.env.E2E_ONBOARDING_PASSWORD;

test.describe('Auth + Onboarding foundation', () => {
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

  test('onboarding wizard can be completed for incomplete profile user', async ({ page }) => {
    test.skip(
      !E2E_ONBOARDING_EMAIL || !E2E_ONBOARDING_PASSWORD,
      'Set E2E_ONBOARDING_EMAIL and E2E_ONBOARDING_PASSWORD to run onboarding completion flow.'
    );

    await page.goto('/login');
    await page.locator('#email').fill(E2E_ONBOARDING_EMAIL || '');
    await page.locator('#password').fill(E2E_ONBOARDING_PASSWORD || '');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL(/\/home/);
    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible();
    await expect(page.getByRole('heading', { name: /¿cuál es tu rol\?/i })).toBeVisible();

    await page.getByRole('button', { name: /estudiante|docente/i }).first().click();

    await expect(page.getByRole('heading', { name: /¿de dónde eres\?/i })).toBeVisible();
    await page.locator('select').selectOption('es');

    await expect(page.getByRole('heading', { name: /¿cómo te llamas\?/i })).toBeVisible();
    await page.locator('input[name="fname"]').fill('E2E');
    await page.locator('input[name="lname"]').fill('Onboarding');
    await page.getByRole('button', { name: /continuar/i }).click();

    await expect(page.locator('.fixed.inset-0.z-50')).toBeHidden();
  });
});
