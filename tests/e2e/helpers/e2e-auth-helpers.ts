// tests/e2e/helpers/e2e-auth-helpers.ts
import { expect, type Page } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;
const E2E_OWNER_EMAIL = process.env.E2E_OWNER_EMAIL;
const E2E_OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD;
const E2E_EDITOR_EMAIL = process.env.E2E_EDITOR_EMAIL;
const E2E_EDITOR_PASSWORD = process.env.E2E_EDITOR_PASSWORD;
const E2E_VIEWER_EMAIL = process.env.E2E_VIEWER_EMAIL;
const E2E_VIEWER_PASSWORD = process.env.E2E_VIEWER_PASSWORD;

const requireCredential = (value: string | undefined, variableName: string): string => {
  if (!value) {
    throw new Error(`Missing required E2E credential: ${variableName}`);
  }
  return value;
};

export const login = async (page: Page, email: string, password: string) => {
  await page.goto('/login');
  await page.locator('#email').fill(email || '');
  await page.locator('#password').fill(password || '');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL(/\/home/, { timeout: 45000 });
  await expect(page.locator('.home-page')).toBeVisible({ timeout: 30000 });
};

export const loginAsDefault = async (page: Page) => {
  await login(page, requireCredential(E2E_EMAIL, 'E2E_EMAIL'), requireCredential(E2E_PASSWORD, 'E2E_PASSWORD'));
};

export const loginAsOwner = async (page: Page) => {
  await login(page, requireCredential(E2E_OWNER_EMAIL, 'E2E_OWNER_EMAIL'), requireCredential(E2E_OWNER_PASSWORD, 'E2E_OWNER_PASSWORD'));
};

export const loginAsEditor = async (page: Page) => {
  await login(page, requireCredential(E2E_EDITOR_EMAIL, 'E2E_EDITOR_EMAIL'), requireCredential(E2E_EDITOR_PASSWORD, 'E2E_EDITOR_PASSWORD'));
};

export const loginAsViewer = async (page: Page) => {
  await login(page, requireCredential(E2E_VIEWER_EMAIL, 'E2E_VIEWER_EMAIL'), requireCredential(E2E_VIEWER_PASSWORD, 'E2E_VIEWER_PASSWORD'));
};

export const logout = async (page: Page) => {
  await page.locator('[data-testid="user-menu"], .user-avatar, [aria-label="Menú de usuario"]').first().click();
  await page.getByRole('menuitem', { name: /cerrar sesión|salir/i }).click();
  await page.waitForURL(/\/login/, { timeout: 10000 });
};

export const navigateToHome = async (page: Page) => {
  await page.goto('/home');
  await expect(page.locator('.home-page')).toBeVisible({ timeout: 10000 });
};

/**
 * Find the outermost card container (with `group` class) for a subject or folder.
 * Hovers the card to reveal action buttons, then returns { card, menuBtn } locators.
 */
export const hoverCardAndGetMenu = async (page: Page, textContent: string) => {
  const card = page.locator('[data-selection-key]').filter({ hasText: textContent }).first();
  await card.hover();
  const menuBtn = card.locator('button').filter({ has: page.locator('svg') }).last();
  return { card, menuBtn };
};

export const navigateToBin = async (page: Page) => {
  await page.goto('/home?view=bin');
  await page.waitForLoadState('networkidle');
};

export const hasCredentials = (role: string = 'default'): boolean => {
  switch (role) {
    case 'owner': return !!(E2E_OWNER_EMAIL && E2E_OWNER_PASSWORD);
    case 'editor': return !!(E2E_EDITOR_EMAIL && E2E_EDITOR_PASSWORD);
    case 'viewer': return !!(E2E_VIEWER_EMAIL && E2E_VIEWER_PASSWORD);
    default: return !!(E2E_EMAIL && E2E_PASSWORD);
  }
};

export const isMutationEnabled = (): boolean => process.env.E2E_RUN_MUTATIONS === 'true';
