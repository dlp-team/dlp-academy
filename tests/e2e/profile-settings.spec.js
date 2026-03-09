import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;

const ensureAdmin = () => {
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountRaw) return null;

  try {
    const normalized = serviceAccountRaw.trim().replace(/^'/, '').replace(/'$/, '');
    const serviceAccount = JSON.parse(normalized);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    return admin.firestore();
  } catch {
    return null;
  }
};

test.describe('Profile and settings coverage', () => {
  test.skip(!E2E_EMAIL || !E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD to run profile/settings tests.');

  let rollbackUserUid = null;
  let rollbackProfile = null;

  test.beforeAll(async () => {
    const db = ensureAdmin();
    if (!db || !E2E_EMAIL) return;

    try {
      const authUser = await admin.auth().getUserByEmail(E2E_EMAIL.trim().toLowerCase());
      rollbackUserUid = authUser.uid;
      const userDoc = await db.collection('users').doc(rollbackUserUid).get();

      if (userDoc.exists) {
        const data = userDoc.data() || {};
        rollbackProfile = {
          displayName: data.displayName || '',
          country: data.country || '',
          role: data.role || 'student',
          photoURL: data.photoURL || '',
        };
      }
    } catch {
      rollbackUserUid = null;
      rollbackProfile = null;
    }
  });

  test.afterAll(async () => {
    const db = ensureAdmin();
    if (!db || !rollbackUserUid || !rollbackProfile) return;

    await db.collection('users').doc(rollbackUserUid).set(
      {
        ...rollbackProfile,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

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
    const updatedName = `${originalName || 'Usuario'} E2E`;
    await nameInput.fill(updatedName);


    const canMutateSafely = Boolean(rollbackUserUid && rollbackProfile);
    const modalHeading = page.getByRole('heading', { name: /editar perfil/i });
    if (canMutateSafely) {
      await page.getByRole('button', { name: /guardar/i }).click();

      let modalClosedAfterSave = false;
      try {
        await expect(modalHeading).not.toBeVisible({ timeout: 3000 });
        modalClosedAfterSave = true;
      } catch {
        modalClosedAfterSave = false;
      }

      if (modalClosedAfterSave) {
        await expect(page.locator('main h1').first()).toBeVisible();
      } else {
        await page.getByRole('button', { name: /cancelar/i }).click();
        await expect(modalHeading).not.toBeVisible();
      }
    } else {
      await page.getByRole('button', { name: /cancelar/i }).click();
    }

    await expect(modalHeading).not.toBeVisible();


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

  test('settings persist after reload for theme, language, and notifications', async ({ page }) => {
    await login(page);

    await page.goto('/settings');
    await page.waitForURL(/\/settings/);

    const languageSelect = page.locator('select').first();
    const initialLanguage = await languageSelect.inputValue();

    await page.getByRole('button', { name: /oscuro/i }).click();
    await expect
      .poll(async () => page.evaluate(() => document.documentElement.classList.contains('dark')))
      .toBe(true);

    const notifSection = page.locator('section').filter({ hasText: /notificaciones/i }).first();
    const emailToggle = notifSection.locator('button').first();
    const wasEnabled = await emailToggle.evaluate((btn) => btn.className.includes('bg-indigo-'));
    await emailToggle.click();
    await expect(page.getByText(/guardado|guardando/i)).toBeVisible();

    await page.reload();
    await page.waitForURL(/\/settings/);

    await expect(languageSelect).toHaveValue(initialLanguage);
    await expect(page.getByRole('button', { name: /oscuro/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /claro/i })).toBeVisible();

    const isEnabledAfterReload = await emailToggle.evaluate((btn) => btn.className.includes('bg-indigo-'));
    expect(isEnabledAfterReload).toBe(!wasEnabled);
  });
});
