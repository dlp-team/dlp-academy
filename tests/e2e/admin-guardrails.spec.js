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

const PRIVILEGED_ROUTES = [
  '/admin-dashboard',
  '/institution-admin-dashboard',
  '/institution-admin-dashboard/teacher/e2e-denied-teacher',
  '/institution-admin-dashboard/student/e2e-denied-student',
];

const loginAs = async (page, email, password) => {
  await page.goto('/login');
  await page.locator('#email').fill(email || '');
  await page.locator('#password').fill(password || '');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL(/\/home/);
};

const assertRedirectedToHome = async (page, route) => {
  await page.goto(route);
  await expect(page).toHaveURL(/\/home/);
};

const loginAsInstitutionAdmin = async (page) => {
  test.skip(
    !E2E_INSTITUTION_ADMIN_EMAIL || !E2E_INSTITUTION_ADMIN_PASSWORD,
    'Set E2E_INSTITUTION_ADMIN_EMAIL and E2E_INSTITUTION_ADMIN_PASSWORD to validate institution-admin mutation paths.'
  );

  await loginAs(page, E2E_INSTITUTION_ADMIN_EMAIL, E2E_INSTITUTION_ADMIN_PASSWORD);
  await page.goto('/institution-admin-dashboard');
  await page.waitForURL(/\/institution-admin-dashboard/);
  await page.getByRole('button', { name: /usuarios/i }).click();
  await page.getByRole('button', { name: /profesores/i }).click();
};

test.describe('Admin guardrails', () => {
  for (const fixture of ROLE_FIXTURES) {
    test(`${fixture.role} cannot access privileged dashboard routes`, async ({ page }) => {
      test.skip(!fixture.email || !fixture.password, `Set ${fixture.role.toUpperCase()} E2E credentials to validate guardrails.`);

      await loginAs(page, fixture.email, fixture.password);

      for (const route of PRIVILEGED_ROUTES) {
        await assertRedirectedToHome(page, route);
      }

      await expect(page.getByRole('button', { name: /autorizar profesor/i })).toHaveCount(0);
      await expect(page.locator('#instCodeInput')).toHaveCount(0);
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

    await assertRedirectedToHome(page, '/admin-dashboard');
  });

  test('institution admin can create and remove teacher invite', async ({ page }) => {
    await loginAsInstitutionAdmin(page);

    const inviteEmail = `e2e.invite.${Date.now()}@example.com`;

    await page.getByRole('button', { name: /autorizar profesor/i }).click();
    await page.getByPlaceholder(/ejemplo@escuela.com/i).fill(inviteEmail);
    await page.getByRole('button', { name: /^autorizar$/i }).click();

    await expect(page.getByText(/profesor invitado correctamente/i)).toBeVisible();

    const inviteRow = page.locator('tr', { hasText: inviteEmail }).first();
    await expect(inviteRow).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await inviteRow.getByTitle(/eliminar invitación/i).click();
    await expect(page.locator('tr', { hasText: inviteEmail })).toHaveCount(0);
  });

  test('institution admin can save access policies', async ({ page }) => {
    await loginAsInstitutionAdmin(page);

    const savePoliciesButton = page.getByRole('button', { name: /guardar políticas/i });
    await expect(savePoliciesButton).toBeVisible();

    await savePoliciesButton.click();
    // Wait for the success message to appear (policyMessage)
    const successMsg = page.locator('text=Políticas de acceso actualizadas correctamente');
    await expect(successMsg).toBeVisible({ timeout: 7000 });
  });

  test('global admin can access admin dashboard tabs', async ({ page }) => {
    test.skip(
      !E2E_ADMIN_EMAIL || !E2E_ADMIN_PASSWORD,
      'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to validate allow-path for global admin.'
    );

    await loginAs(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD);

    await page.goto('/admin-dashboard');
    await page.waitForURL(/\/admin-dashboard/);
    await expect(page).toHaveURL(/\/admin-dashboard/);

    const overviewTab = page.getByRole('button', { name: /resumen/i });
    const institutionsTab = page.getByRole('button', { name: /instituciones/i });
    const usersTab = page.getByRole('button', { name: /usuarios/i });
    const adminBadge = page.getByText(/acceso de admin global/i);

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

  test('global admin can access institution-admin dashboard (inherited role)', async ({ page }) => {
    test.skip(
      !E2E_ADMIN_EMAIL || !E2E_ADMIN_PASSWORD,
      'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to validate inherited-role access on /institution-admin-dashboard.'
    );

    await loginAs(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD);

    await page.goto('/institution-admin-dashboard');
    await page.waitForURL(/\/institution-admin-dashboard/);
    await expect(page).toHaveURL(/\/institution-admin-dashboard/);
    await expect(page.getByRole('heading', { name: /panel de administración/i })).toBeVisible();
  });
});
