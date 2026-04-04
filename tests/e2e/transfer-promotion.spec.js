// tests/e2e/transfer-promotion.spec.js
import { test, expect } from '@playwright/test';

const E2E_INSTITUTION_ADMIN_EMAIL = process.env.E2E_INSTITUTION_ADMIN_EMAIL;
const E2E_INSTITUTION_ADMIN_PASSWORD = process.env.E2E_INSTITUTION_ADMIN_PASSWORD;
const RUN_TRANSFER_PROMOTION_E2E = process.env.E2E_TRANSFER_PROMOTION_TESTS === '1';
const RUN_TRANSFER_PROMOTION_EXECUTION = process.env.E2E_TRANSFER_PROMOTION_EXECUTION === '1';
const RUN_TRANSFER_PROMOTION_E2E_REASON = 'Set E2E_TRANSFER_PROMOTION_TESTS=1 to run transfer/promotion modal e2e guardrails.';
const MISSING_ACADEMIC_YEAR_FIXTURE_REASON = 'No academic-year options found. Seed course/class fixtures before running transfer/promotion e2e tests.';
const MISSING_DISTINCT_TARGET_REASON = 'No distinct target academic year is available for transfer/promotion e2e validation.';

const loginAsInstitutionAdmin = async (page) => {
  test.skip(
    !E2E_INSTITUTION_ADMIN_EMAIL || !E2E_INSTITUTION_ADMIN_PASSWORD,
    'Set E2E_INSTITUTION_ADMIN_EMAIL and E2E_INSTITUTION_ADMIN_PASSWORD for institution-admin e2e validation.'
  );

  await page.goto('/login');
  await page.locator('#email').fill(E2E_INSTITUTION_ADMIN_EMAIL || '');
  await page.locator('#password').fill(E2E_INSTITUTION_ADMIN_PASSWORD || '');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL(/\/home/);
};

const openTransferPromotionModal = async (page) => {
  await page.goto('/institution-admin-dashboard');
  await page.waitForURL(/\/institution-admin-dashboard/);

  const organizationTab = page.getByRole('button', { name: /cursos y clases/i });
  await organizationTab.click();

  const openModalButton = page.getByRole('button', { name: /simular traslado\/promoción/i });
  await expect(openModalButton).toBeVisible();
  await openModalButton.click();

  const modalHeading = page.getByRole('heading', { name: /simulación de traslado\/promoción/i });
  await expect(modalHeading).toBeVisible();

  return {
    sourceAcademicYearSelect: page.getByLabel(/año académico origen/i),
    targetAcademicYearSelect: page.getByLabel(/año académico destino/i),
    executeButton: page.getByRole('button', { name: /ejecutar simulación/i }),
    applyButton: page.getByRole('button', { name: /aplicar cambios planificados/i }),
    summaryHeading: page.getByText(/resumen de simulación/i),
  };
};

const getSelectValues = async (selectLocator) => {
  const values = await selectLocator.locator('option').evaluateAll((options) => (
    options
      .map((option) => String(option.value || '').trim())
      .filter((value) => value.length > 0)
  ));

  return Array.from(new Set(values));
};

const ensureTransferPromotionSuiteEnabled = () => {
  test.skip(!RUN_TRANSFER_PROMOTION_E2E, RUN_TRANSFER_PROMOTION_E2E_REASON);
};

const ensureAcademicYearOptionsExist = (values) => {
  test.skip(values.length === 0, MISSING_ACADEMIC_YEAR_FIXTURE_REASON);
};

const resolveDistinctTargetAcademicYear = ({ sourceAcademicYear, targetValues }) => {
  const targetAcademicYear = targetValues.find((value) => value !== sourceAcademicYear);
  test.skip(!targetAcademicYear, MISSING_DISTINCT_TARGET_REASON);
  return targetAcademicYear;
};

const ensureDistinctAcademicYears = async ({ sourceAcademicYearSelect, targetAcademicYearSelect }) => {
  const sourceValues = await getSelectValues(sourceAcademicYearSelect);
  ensureAcademicYearOptionsExist(sourceValues);

  const sourceAcademicYear = sourceValues[0];
  await sourceAcademicYearSelect.selectOption(sourceAcademicYear);

  const targetValues = await getSelectValues(targetAcademicYearSelect);
  const targetAcademicYear = resolveDistinctTargetAcademicYear({
    sourceAcademicYear,
    targetValues,
  });

  await targetAcademicYearSelect.selectOption(targetAcademicYear);

  return {
    sourceAcademicYear,
    targetAcademicYear,
  };
};

test.describe('Transfer/Promotion modal guardrails', () => {
  test('enforces distinct source and target academic years before execution', async ({ page }) => {
    ensureTransferPromotionSuiteEnabled();

    await loginAsInstitutionAdmin(page);

    const {
      sourceAcademicYearSelect,
      targetAcademicYearSelect,
      executeButton,
    } = await openTransferPromotionModal(page);

    const sourceValues = await getSelectValues(sourceAcademicYearSelect);
    ensureAcademicYearOptionsExist(sourceValues);

    const sourceAcademicYear = sourceValues[0];
    await sourceAcademicYearSelect.selectOption(sourceAcademicYear);
    await targetAcademicYearSelect.selectOption(sourceAcademicYear);

    await expect(executeButton).toBeDisabled();

    const targetValues = await getSelectValues(targetAcademicYearSelect);
    const distinctTargetAcademicYear = resolveDistinctTargetAcademicYear({
      sourceAcademicYear,
      targetValues,
    });

    await targetAcademicYearSelect.selectOption(distinctTargetAcademicYear);

    await expect(executeButton).toBeEnabled();
  });

  test('runs dry-run and renders summary when execution fixtures are available', async ({ page }) => {
    ensureTransferPromotionSuiteEnabled();

    test.skip(
      !RUN_TRANSFER_PROMOTION_EXECUTION,
      'Set E2E_TRANSFER_PROMOTION_EXECUTION=1 after seeding transfer/promotion fixtures to validate end-to-end dry-run execution.'
    );

    await loginAsInstitutionAdmin(page);

    const {
      sourceAcademicYearSelect,
      targetAcademicYearSelect,
      executeButton,
      applyButton,
      summaryHeading,
    } = await openTransferPromotionModal(page);

    await ensureDistinctAcademicYears({
      sourceAcademicYearSelect,
      targetAcademicYearSelect,
    });

    await expect(applyButton).toBeDisabled();

    await executeButton.click();

    await expect(summaryHeading).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/cursos origen analizados:/i)).toBeVisible();
    await expect(page.getByText(/mapeos de cursos planificados:/i)).toBeVisible();
    await expect(applyButton).toBeEnabled();
  });
});
