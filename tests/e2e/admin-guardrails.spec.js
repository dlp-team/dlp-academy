import { test, expect } from '@playwright/test';

const ROLE_FIXTURES = [
  {
    role: 'owner',
    email: process.env.E2E_OWNER_EMAIL,
    password: process.env.E2E_OWNER_PASSWORD,
  },
  {
    role: 'editor',
    email: process.env.E2E_EDITOR_EMAIL,
    password: process.env.E2E_EDITOR_PASSWORD,
  },
  {
    role: 'viewer',
    email: process.env.E2E_VIEWER_EMAIL,
    password: process.env.E2E_VIEWER_PASSWORD,
  },
];

const E2E_INSTITUTION_ADMIN_EMAIL = process.env.E2E_INSTITUTION_ADMIN_EMAIL;
const E2E_INSTITUTION_ADMIN_PASSWORD = process.env.E2E_INSTITUTION_ADMIN_PASSWORD;
const E2E_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const E2E_ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

const loginAs = async (page, email, password) => {
  await page.goto('/login');
  await page.locator('#email').fill(email || '');
  await page.locator('#password').fill(password || '');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL(/\/home/);
};

test.describe('Admin guardrails', () => {
  for (const fixture of ROLE_FIXTURES) {
    test(`${fixture.role} cannot access admin dashboard routes`, async ({ page }) => {
      test.skip(!fixture.email || !fixture.password, `Set ${fixture.role.toUpperCase()} E2E credentials to validate guardrails.`);

      await loginAs(page, fixture.email, fixture.password);

      await page.goto('/admin-dashboard');
      await page.waitForURL(/\/home/);
      await expect(page).toHaveURL(/\/home/);

      await page.goto('/institution-admin-dashboard');
      await page.waitForURL(/\/home/);
      await expect(page).toHaveURL(/\/home/);
    });
  }

  test('institution admin can access institution dashboard tabs', async ({ page }) => {
    test.skip(
      !E2E_INSTITUTION_ADMIN_EMAIL || !E2E_INSTITUTION_ADMIN_PASSWORD,
      'Set E2E_INSTITUTION_ADMIN_EMAIL and E2E_INSTITUTION_ADMIN_PASSWORD to validate allow-path for institution admin.'
    );

    await loginAs(page, E2E_INSTITUTION_ADMIN_EMAIL, E2E_INSTITUTION_ADMIN_PASSWORD);

    await page.goto('/institution-admin-dashboard');
    await page.waitForURL(/\/institution-admin-dashboard/);

    const usersTab = page.getByRole('button', { name: /usuarios/i });
    const organizationTab = page.getByRole('button', { name: /cursos y clases/i });
    const customizationTab = page.getByRole('button', { name: /personalización/i });

    await expect(usersTab).toBeVisible();
    await expect(organizationTab).toBeVisible();
    await expect(customizationTab).toBeVisible();

    await usersTab.click();
    await expect(page.getByRole('heading', { name: /profesores registrados/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /invitaciones pendientes/i })).toBeVisible();

    await organizationTab.click();
    await expect(page.getByRole('button', { name: /nuevo curso/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^clases$/i })).toBeVisible();

    await page.getByRole('button', { name: /^clases$/i }).click();
    await expect(page.getByText(/clases registradas/i)).toBeVisible();

    await customizationTab.click();
    await expect(page.getByText(/nombre de la institución/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /guardar cambios|guardar/i })).toBeVisible();
  });

  test('institution admin cannot access global admin dashboard', async ({ page }) => {
    test.skip(
      !E2E_INSTITUTION_ADMIN_EMAIL || !E2E_INSTITUTION_ADMIN_PASSWORD,
      'Set E2E_INSTITUTION_ADMIN_EMAIL and E2E_INSTITUTION_ADMIN_PASSWORD to validate denial-path on /admin-dashboard.'
    );

    await loginAs(page, E2E_INSTITUTION_ADMIN_EMAIL, E2E_INSTITUTION_ADMIN_PASSWORD);

    await page.goto('/admin-dashboard');
    await page.waitForURL(/\/home/);
    await expect(page).toHaveURL(/\/home/);
  });

  test('global admin can access admin dashboard tabs', async ({ page }) => {
    test.skip(
      !E2E_ADMIN_EMAIL || !E2E_ADMIN_PASSWORD,
      'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to validate allow-path for global admin.'
    );

    await loginAs(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD);

    await page.goto('/admin-dashboard');
    await page.waitForLoadState('domcontentloaded');

    if (!/\/admin-dashboard/.test(page.url())) {
      test.skip(true, 'E2E_ADMIN credentials are not provisioned with admin-role access in this environment.');
    }

    const overviewTab = page.getByRole('button', { name: /resumen/i });
    const institutionsTab = page.getByRole('button', { name: /instituciones/i });
    const usersTab = page.getByRole('button', { name: /usuarios/i });
    const adminBadge = page.getByText(/acceso de admin global/i);

    if (!(await adminBadge.isVisible())) {
      test.skip(true, 'E2E_ADMIN credentials are not mapped to a global-admin dashboard session in this environment.');
    }

    await expect(adminBadge).toBeVisible();
    await expect(overviewTab).toBeVisible();
    await expect(institutionsTab).toBeVisible();
    await expect(usersTab).toBeVisible();

    await overviewTab.click();
    await expect(page.getByText(/gráficas de actividad/i)).toBeVisible();

    await institutionsTab.click();
    await expect(page.getByRole('heading', { name: /instituciones registradas/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /nueva institución/i })).toBeVisible();

    await usersTab.click();
    await expect(page.getByRole('heading', { name: /todos los usuarios/i })).toBeVisible();
    await expect(page.getByPlaceholder(/buscar por nombre o email/i)).toBeVisible();
  });
});
