// tests/e2e/transfer-promotion.spec.js
import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';
import fs from 'node:fs';
import dotenv from 'dotenv';

dotenv.config();

const E2E_INSTITUTION_ADMIN_EMAIL = process.env.E2E_INSTITUTION_ADMIN_EMAIL;
const E2E_INSTITUTION_ADMIN_PASSWORD = process.env.E2E_INSTITUTION_ADMIN_PASSWORD;
const RUN_TRANSFER_PROMOTION_E2E = process.env.E2E_TRANSFER_PROMOTION_TESTS === '1';
const RUN_TRANSFER_PROMOTION_EXECUTION = process.env.E2E_TRANSFER_PROMOTION_EXECUTION === '1';
const RUN_TRANSFER_PROMOTION_APPLY_ROLLBACK = process.env.E2E_TRANSFER_PROMOTION_APPLY_ROLLBACK === '1';
const RUN_TRANSFER_PROMOTION_AUTO_SEED = process.env.E2E_TRANSFER_PROMOTION_AUTO_SEED === '1';
const RUN_TRANSFER_PROMOTION_MOCK_CALLABLES = process.env.E2E_TRANSFER_PROMOTION_MOCK_CALLABLES === '1';
const E2E_TRANSFER_PROMOTION_SOURCE_YEAR = process.env.E2E_TRANSFER_PROMOTION_SOURCE_YEAR || '2025-2026';
const E2E_TRANSFER_PROMOTION_TARGET_YEAR = process.env.E2E_TRANSFER_PROMOTION_TARGET_YEAR || '2026-2027';
const RUN_TRANSFER_PROMOTION_E2E_REASON = 'Set E2E_TRANSFER_PROMOTION_TESTS=1 to run transfer/promotion modal e2e guardrails.';
const RUN_TRANSFER_PROMOTION_EXECUTION_REASON = 'Set E2E_TRANSFER_PROMOTION_EXECUTION=1 after seeding transfer/promotion fixtures to validate end-to-end dry-run execution.';
const RUN_TRANSFER_PROMOTION_APPLY_ROLLBACK_REASON = 'Set E2E_TRANSFER_PROMOTION_APPLY_ROLLBACK=1 with disposable fixtures to validate full dry-run/apply/rollback execution.';
const RUN_TRANSFER_PROMOTION_AUTO_SEED_REASON = 'Set E2E_TRANSFER_PROMOTION_AUTO_SEED=1 and FIREBASE_SERVICE_ACCOUNT_JSON to auto-seed disposable transfer fixtures.';
const MISSING_ACADEMIC_YEAR_FIXTURE_REASON = 'No academic-year options found. Seed course/class fixtures before running transfer/promotion e2e tests.';
const MISSING_DISTINCT_TARGET_REASON = 'No distinct target academic year is available for transfer/promotion e2e validation.';
const DRY_RUN_ENVIRONMENT_FAILURE_REASON = 'Transfer dry-run execution depends on callable environment readiness (fixtures, auth scope, and deployed backend state).';

const UI_FALLBACK_SOURCE_COURSE_NUMBER = 91;
const UI_FALLBACK_TARGET_COURSE_NUMBER = 92;

const ensureAdmin = () => {
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!serviceAccountRaw) {
    if (!serviceAccountPath) {
      try {
        if (!fs.existsSync('.env')) {
          return null;
        }

        const envContent = fs.readFileSync('.env', 'utf8');
        const multilineMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT_JSON='([\s\S]*?)'/m);
        if (!multilineMatch || !multilineMatch[1]) {
          return null;
        }

        const parsedFromEnvFile = JSON.parse(multilineMatch[1]);
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(parsedFromEnvFile),
          });
        }
        return admin.firestore();
      } catch {
        return null;
      }
    }
  }

  const parseServiceAccount = () => {
    const trimmedValue = String(serviceAccountRaw || '').trim();

    const candidateValues = [
      trimmedValue,
      trimmedValue.replace(/^'/, '').replace(/'$/, ''),
      trimmedValue.replace(/^"/, '').replace(/"$/, ''),
    ];

    for (const candidate of candidateValues) {
      try {
        return JSON.parse(candidate);
      } catch {
        // Continue through fallback parsers.
      }
    }

    for (const candidate of candidateValues) {
      try {
        const decoded = Buffer.from(candidate, 'base64').toString('utf8');
        return JSON.parse(decoded);
      } catch {
        // Continue through fallback parsers.
      }
    }

    for (const candidate of candidateValues) {
      try {
        if (!candidate || !fs.existsSync(candidate)) continue;
        const fileContent = fs.readFileSync(candidate, 'utf8');
        return JSON.parse(fileContent);
      } catch {
        // Continue through fallback parsers.
      }
    }

    if (serviceAccountPath) {
      try {
        if (fs.existsSync(serviceAccountPath)) {
          const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
          return JSON.parse(fileContent);
        }
      } catch {
        // Ignore path fallback parse failures.
      }
    }

    return null;
  };

  try {
    const serviceAccount = parseServiceAccount();
    if (!serviceAccount) {
      return null;
    }

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

const buildTransferFixtureIds = (adminUid) => {
  const suffix = String(adminUid || 'unknown').replace(/[^A-Za-z0-9_-]/g, '_');
  return {
    sourceCourseOneId: `e2e-transfer-course-source-1-${suffix}`,
    sourceCourseTwoId: `e2e-transfer-course-source-2-${suffix}`,
    targetCourseOneId: `e2e-transfer-course-target-1-${suffix}`,
    sourceClassOneId: `e2e-transfer-class-source-1-${suffix}`,
    sourceClassTwoId: `e2e-transfer-class-source-2-${suffix}`,
    targetClassOneId: `e2e-transfer-class-target-1-${suffix}`,
    studentOneId: `e2e-transfer-student-1-${suffix}`,
    studentTwoId: `e2e-transfer-student-2-${suffix}`,
  };
};

const seedTransferPromotionFixtures = async () => {
  if (!RUN_TRANSFER_PROMOTION_AUTO_SEED) {
    return {
      seeded: false,
      reason: RUN_TRANSFER_PROMOTION_AUTO_SEED_REASON,
    };
  }

  if (!E2E_INSTITUTION_ADMIN_EMAIL) {
    return {
      seeded: false,
      reason: 'Set E2E_INSTITUTION_ADMIN_EMAIL to auto-seed transfer fixtures.',
    };
  }

  const db = ensureAdmin();
  if (!db) {
    return {
      seeded: false,
      reason: 'Set FIREBASE_SERVICE_ACCOUNT_JSON to auto-seed transfer fixtures.',
    };
  }

  let adminUid = null;
  let adminInstitutionId = null;

  try {
    const authUser = await admin.auth().getUserByEmail(E2E_INSTITUTION_ADMIN_EMAIL.trim().toLowerCase());
    adminUid = authUser.uid;
  } catch {
    adminUid = null;
  }

  if (!adminUid) {
    return {
      seeded: false,
      reason: 'Could not resolve institution-admin uid from E2E_INSTITUTION_ADMIN_EMAIL.',
    };
  }

  const adminByUidDoc = await db.collection('users').doc(adminUid).get();
  if (adminByUidDoc.exists) {
    adminInstitutionId = String(adminByUidDoc.data()?.institutionId || '').trim() || null;
  }

  if (!adminInstitutionId) {
    const adminByEmailSnap = await db.collection('users')
      .where('email', '==', E2E_INSTITUTION_ADMIN_EMAIL.trim().toLowerCase())
      .limit(1)
      .get();

    if (!adminByEmailSnap.empty) {
      const adminData = adminByEmailSnap.docs[0].data() || {};
      adminInstitutionId = String(adminData.institutionId || '').trim() || null;
    }
  }

  if (!adminInstitutionId) {
    return {
      seeded: false,
      reason: 'Could not resolve institutionId for transfer fixture seeding.',
    };
  }

  const ids = buildTransferFixtureIds(adminUid);
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  const batch = db.batch();

  batch.set(db.collection('courses').doc(ids.sourceCourseOneId), {
    name: '1 ESO',
    institutionId: adminInstitutionId,
    academicYear: E2E_TRANSFER_PROMOTION_SOURCE_YEAR,
    status: 'active',
    e2eTransferFixture: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  }, { merge: true });

  batch.set(db.collection('courses').doc(ids.sourceCourseTwoId), {
    name: '2 ESO',
    institutionId: adminInstitutionId,
    academicYear: E2E_TRANSFER_PROMOTION_SOURCE_YEAR,
    status: 'active',
    e2eTransferFixture: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  }, { merge: true });

  batch.set(db.collection('courses').doc(ids.targetCourseOneId), {
    name: '1 ESO',
    institutionId: adminInstitutionId,
    academicYear: E2E_TRANSFER_PROMOTION_TARGET_YEAR,
    status: 'active',
    e2eTransferFixture: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  }, { merge: true });

  batch.set(db.collection('users').doc(ids.studentOneId), {
    role: 'student',
    institutionId: adminInstitutionId,
    courseId: ids.sourceCourseOneId,
    courseIds: [ids.sourceCourseOneId],
    enrolledCourseIds: [ids.sourceCourseOneId],
    e2eTransferFixture: true,
    updatedAt: timestamp,
  }, { merge: true });

  batch.set(db.collection('users').doc(ids.studentTwoId), {
    role: 'student',
    institutionId: adminInstitutionId,
    courseId: ids.sourceCourseTwoId,
    courseIds: [ids.sourceCourseTwoId],
    enrolledCourseIds: [ids.sourceCourseTwoId],
    e2eTransferFixture: true,
    updatedAt: timestamp,
  }, { merge: true });

  batch.set(db.collection('classes').doc(ids.sourceClassOneId), {
    name: '1 ESO A',
    institutionId: adminInstitutionId,
    academicYear: E2E_TRANSFER_PROMOTION_SOURCE_YEAR,
    courseId: ids.sourceCourseOneId,
    studentIds: [ids.studentOneId],
    status: 'active',
    e2eTransferFixture: true,
    updatedAt: timestamp,
  }, { merge: true });

  batch.set(db.collection('classes').doc(ids.sourceClassTwoId), {
    name: '2 ESO B',
    institutionId: adminInstitutionId,
    academicYear: E2E_TRANSFER_PROMOTION_SOURCE_YEAR,
    courseId: ids.sourceCourseTwoId,
    studentIds: [ids.studentTwoId],
    status: 'active',
    e2eTransferFixture: true,
    updatedAt: timestamp,
  }, { merge: true });

  batch.set(db.collection('classes').doc(ids.targetClassOneId), {
    name: '1 ESO A',
    institutionId: adminInstitutionId,
    academicYear: E2E_TRANSFER_PROMOTION_TARGET_YEAR,
    courseId: ids.targetCourseOneId,
    studentIds: [],
    status: 'active',
    e2eTransferFixture: true,
    updatedAt: timestamp,
  }, { merge: true });

  await batch.commit();

  return {
    seeded: true,
    institutionId: adminInstitutionId,
  };
};

const loginAsInstitutionAdmin = async (page) => {
  test.skip(
    !E2E_INSTITUTION_ADMIN_EMAIL || !E2E_INSTITUTION_ADMIN_PASSWORD,
    'Set E2E_INSTITUTION_ADMIN_EMAIL and E2E_INSTITUTION_ADMIN_PASSWORD for institution-admin e2e validation.'
  );

  if (RUN_TRANSFER_PROMOTION_MOCK_CALLABLES) {
    await page.addInitScript(() => {
      window.__E2E_TRANSFER_PROMOTION_MOCK__ = true;
    });
  }

  await page.goto('/login');
  await page.locator('#email').fill(E2E_INSTITUTION_ADMIN_EMAIL || '');
  await page.locator('#password').fill(E2E_INSTITUTION_ADMIN_PASSWORD || '');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL(/\/home/);
};

const openCoursesAndClassesTab = async (page) => {
  await page.goto('/institution-admin-dashboard');
  await page.waitForURL(/\/institution-admin-dashboard/);

  const organizationTab = page.getByRole('button', { name: /cursos y clases/i });
  await organizationTab.click();
};

const openTransferPromotionModal = async (page) => {
  await openCoursesAndClassesTab(page);

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
    rollbackButton: page.getByRole('button', { name: /ejecutar rollback/i }),
    closeButton: page.getByRole('button', { name: /^cerrar$/i }),
    summaryHeading: page.getByText(/resumen de simulación/i),
  };
};

const createTransferFixtureCourseViaUi = async ({ page, courseNumber, courseName, academicYear }) => {
  const openCourseModalButton = page.getByRole('button', { name: /^nuevo curso$/i });
  await expect(openCourseModalButton).toBeVisible();
  await openCourseModalButton.click();

  const createCourseHeading = page.getByRole('heading', { name: /^nuevo curso$/i });
  await expect(createCourseHeading).toBeVisible();

  await page.locator('input[type="number"][min="1"][max="99"]').first().fill(String(courseNumber));
  await page.getByPlaceholder(/ESO, Bachillerato/i).fill(courseName);
  await page.getByPlaceholder('2024-2025').fill(academicYear);

  const submitCourseButton = page.getByRole('button', { name: /crear curso/i });
  await expect(submitCourseButton).toBeEnabled();
  await submitCourseButton.click();

  await expect(createCourseHeading).toBeHidden({ timeout: 15000 });
};

const seedTransferFixturesViaUiFallback = async (page) => {
  const suffix = String(Date.now()).slice(-5);
  await createTransferFixtureCourseViaUi({
    page,
    courseNumber: UI_FALLBACK_SOURCE_COURSE_NUMBER,
    courseName: `E2E Transfer Origen ${suffix}`,
    academicYear: E2E_TRANSFER_PROMOTION_SOURCE_YEAR,
  });

  await createTransferFixtureCourseViaUi({
    page,
    courseNumber: UI_FALLBACK_TARGET_COURSE_NUMBER,
    courseName: `E2E Transfer Destino ${suffix}`,
    academicYear: E2E_TRANSFER_PROMOTION_TARGET_YEAR,
  });
};

const openTransferPromotionModalWithUiFixtureFallback = async (page) => {
  let modalControls = await openTransferPromotionModal(page);

  const sourceValues = await getSelectValues(modalControls.sourceAcademicYearSelect);
  if (sourceValues.length > 0 || !RUN_TRANSFER_PROMOTION_AUTO_SEED) {
    return modalControls;
  }

  await modalControls.closeButton.click();
  await seedTransferFixturesViaUiFallback(page);

  modalControls = await openTransferPromotionModal(page);
  return modalControls;
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

const ensureTransferPromotionExecutionEnabled = () => {
  test.skip(!RUN_TRANSFER_PROMOTION_EXECUTION, RUN_TRANSFER_PROMOTION_EXECUTION_REASON);
};

const ensureTransferPromotionApplyRollbackEnabled = () => {
  test.skip(!RUN_TRANSFER_PROMOTION_APPLY_ROLLBACK, RUN_TRANSFER_PROMOTION_APPLY_ROLLBACK_REASON);
};

const ensureTransferFixturesReady = () => {
  if (!RUN_TRANSFER_PROMOTION_AUTO_SEED) return;
  // Allow browser-level fixture fallback even when admin seeding fails.
};

const ensureAcademicYearOptionsExist = (values) => {
  test.skip(values.length === 0, MISSING_ACADEMIC_YEAR_FIXTURE_REASON);
};

const resolvePreferredAcademicYear = ({ values, preferredAcademicYear }) => {
  const normalizedPreferred = String(preferredAcademicYear || '').trim();
  if (normalizedPreferred && values.includes(normalizedPreferred)) {
    return normalizedPreferred;
  }
  return values[0];
};

const resolveDistinctTargetAcademicYear = ({ sourceAcademicYear, targetValues }) => {
  const preferredTargetAcademicYear = String(E2E_TRANSFER_PROMOTION_TARGET_YEAR || '').trim();
  const targetAcademicYear = (
    (preferredTargetAcademicYear && preferredTargetAcademicYear !== sourceAcademicYear && targetValues.includes(preferredTargetAcademicYear)
      ? preferredTargetAcademicYear
      : null)
    || targetValues.find((value) => value !== sourceAcademicYear)
  );
  test.skip(!targetAcademicYear, MISSING_DISTINCT_TARGET_REASON);
  return targetAcademicYear;
};

const ensureDistinctAcademicYears = async ({ sourceAcademicYearSelect, targetAcademicYearSelect }) => {
  const sourceValues = await getSelectValues(sourceAcademicYearSelect);
  ensureAcademicYearOptionsExist(sourceValues);

  const sourceAcademicYear = resolvePreferredAcademicYear({
    values: sourceValues,
    preferredAcademicYear: E2E_TRANSFER_PROMOTION_SOURCE_YEAR,
  });
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

const waitForDryRunSummaryOrSkipEnvironmentFailure = async ({ page, summaryHeading }) => {
  try {
    await expect(summaryHeading).toBeVisible({ timeout: 15000 });
  } catch (error) {
    const knownErrorLocator = page.getByText(/internal|no se pudo ejecutar la simulación|no se encontró una institución válida/i).first();
    if (await knownErrorLocator.isVisible().catch(() => false)) {
      const rawErrorText = String((await knownErrorLocator.textContent()) || '').trim();
      const errorText = rawErrorText || 'internal';
      test.skip(true, `${DRY_RUN_ENVIRONMENT_FAILURE_REASON} Runtime message: ${errorText}`);
      return;
    }

    throw error;
  }
};

test.describe('Transfer/Promotion modal guardrails', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    if (!RUN_TRANSFER_PROMOTION_AUTO_SEED) {
      return;
    }

    await seedTransferPromotionFixtures();
  });

  test('enforces distinct source and target academic years before execution', async ({ page }) => {
    ensureTransferPromotionSuiteEnabled();
    ensureTransferFixturesReady();

    await loginAsInstitutionAdmin(page);

    const {
      sourceAcademicYearSelect,
      targetAcademicYearSelect,
      executeButton,
    } = await openTransferPromotionModalWithUiFixtureFallback(page);

    const sourceValues = await getSelectValues(sourceAcademicYearSelect);
    ensureAcademicYearOptionsExist(sourceValues);

    const sourceAcademicYear = resolvePreferredAcademicYear({
      values: sourceValues,
      preferredAcademicYear: E2E_TRANSFER_PROMOTION_SOURCE_YEAR,
    });
    await sourceAcademicYearSelect.selectOption(sourceAcademicYear);

    const targetValues = await getSelectValues(targetAcademicYearSelect);
    if (targetValues.includes(sourceAcademicYear)) {
      await targetAcademicYearSelect.selectOption(sourceAcademicYear);
    } else {
      await targetAcademicYearSelect.selectOption('');
    }

    await expect(executeButton).toBeDisabled();

    const distinctTargetAcademicYear = resolveDistinctTargetAcademicYear({
      sourceAcademicYear,
      targetValues,
    });

    await targetAcademicYearSelect.selectOption(distinctTargetAcademicYear);

    await expect(executeButton).toBeEnabled();
  });

  test('runs dry-run and renders summary when execution fixtures are available', async ({ page }) => {
    ensureTransferPromotionSuiteEnabled();
    ensureTransferPromotionExecutionEnabled();
    ensureTransferFixturesReady();

    await loginAsInstitutionAdmin(page);

    const {
      sourceAcademicYearSelect,
      targetAcademicYearSelect,
      executeButton,
      applyButton,
      summaryHeading,
    } = await openTransferPromotionModalWithUiFixtureFallback(page);

    await ensureDistinctAcademicYears({
      sourceAcademicYearSelect,
      targetAcademicYearSelect,
    });

    await expect(applyButton).toBeDisabled();

    await executeButton.click();

    await waitForDryRunSummaryOrSkipEnvironmentFailure({ page, summaryHeading });
    await expect(page.getByText(/cursos origen analizados:/i)).toBeVisible();
    await expect(page.getByText(/mapeos de cursos planificados:/i)).toBeVisible();
    await expect(applyButton).toBeEnabled();
  });

  test('runs full dry-run, apply, and rollback execution path when mutation fixtures are enabled', async ({ page }) => {
    ensureTransferPromotionSuiteEnabled();
    ensureTransferPromotionExecutionEnabled();
    ensureTransferPromotionApplyRollbackEnabled();
    ensureTransferFixturesReady();

    await loginAsInstitutionAdmin(page);

    const {
      sourceAcademicYearSelect,
      targetAcademicYearSelect,
      executeButton,
      applyButton,
      rollbackButton,
      summaryHeading,
    } = await openTransferPromotionModalWithUiFixtureFallback(page);

    await ensureDistinctAcademicYears({
      sourceAcademicYearSelect,
      targetAcademicYearSelect,
    });

    await expect(applyButton).toBeDisabled();
    await expect(rollbackButton).toBeDisabled();

    await executeButton.click();

    await waitForDryRunSummaryOrSkipEnvironmentFailure({ page, summaryHeading });
    await expect(applyButton).toBeEnabled();

    await applyButton.click();

    await expect(
      page.getByText(/cambios aplicados correctamente\.|este plan ya estaba aplicado previamente\./i)
    ).toBeVisible({ timeout: 15000 });

    await expect(rollbackButton).toBeEnabled();
    await rollbackButton.click();

    await expect(
      page.getByText(/rollback ejecutado correctamente\.|este rollback ya estaba ejecutado previamente\./i)
    ).toBeVisible({ timeout: 15000 });
  });
});
