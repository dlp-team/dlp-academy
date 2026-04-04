// src/services/transferPromotionService.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

const RUN_TRANSFER_PROMOTION_DRY_RUN_CALLABLE = 'runTransferPromotionDryRun';
const APPLY_TRANSFER_PROMOTION_PLAN_CALLABLE = 'applyTransferPromotionPlan';
const ROLLBACK_TRANSFER_PROMOTION_PLAN_CALLABLE = 'rollbackTransferPromotionPlan';

const isTransferPromotionE2EMockEnabled = () => {
  if (import.meta.env.VITE_E2E_TRANSFER_PROMOTION_MOCK === '1') {
    return true;
  }

  if (typeof window !== 'undefined') {
    return Boolean((window as any).__E2E_TRANSFER_PROMOTION_MOCK__);
  }

  return false;
};

const buildMockRequestId = () => `e2e-transfer-mock-${Date.now()}`;

const buildMockDryRunResponse = (payload: any) => {
  const institutionId = String(payload?.institutionId || 'mock-institution').trim() || 'mock-institution';
  const sourceAcademicYear = String(payload?.sourceAcademicYear || '2025-2026').trim() || '2025-2026';
  const targetAcademicYear = String(payload?.targetAcademicYear || '2026-2027').trim() || '2026-2027';
  const mode = String(payload?.mode || 'promote').trim().toLowerCase() === 'transfer' ? 'transfer' : 'promote';
  const requestId = String(payload?.requestId || '').trim() || buildMockRequestId();
  const rollbackId = `e2e-transfer-mock-rollback-${requestId}`;
  const options = {
    copyStudentLinks: payload?.options?.copyStudentLinks !== false,
    includeClassMemberships: payload?.options?.includeClassMemberships !== false,
    preserveVisibility: payload?.options?.preserveVisibility === true,
  };

  const dryRunPayload = {
    institutionId,
    sourceAcademicYear,
    targetAcademicYear,
    mode,
    options,
    requestId,
    initiatedByUid: 'e2e-transfer-mock',
    createdAtIso: new Date().toISOString(),
  };

  const mappings = {
    courses: [
      {
        sourceCourseId: 'mock-course-source-1',
        sourceCourseName: '1 ESO',
        targetCourseId: 'mock-course-target-1',
        targetCourseName: '1 ESO',
        sourceAcademicYear,
        targetAcademicYear,
        action: 'create',
      },
    ],
    classes: [
      {
        sourceClassId: 'mock-class-source-1',
        sourceClassName: '1 ESO A',
        sourceCourseId: 'mock-course-source-1',
        targetClassId: 'mock-class-target-1',
        targetClassName: '1 ESO A',
        targetCourseId: 'mock-course-target-1',
        sourceAcademicYear,
        targetAcademicYear,
        action: 'create',
      },
    ],
    studentAssignments: [
      {
        studentId: 'mock-student-1',
        fromCourseIds: ['mock-course-source-1'],
        toCourseIds: ['mock-course-target-1'],
        resultingCourseIds: ['mock-course-target-1'],
        fromClassIds: ['mock-class-source-1'],
        toClassIds: ['mock-class-target-1'],
      },
    ],
  };

  const rollbackMetadata = {
    rollbackId,
    requestId,
    institutionId,
    mode,
    summary: {
      plannedCourses: mappings.courses.length,
      plannedClasses: mappings.classes.length,
      plannedStudentAssignments: mappings.studentAssignments.length,
    },
  };

  return {
    success: true,
    dryRunPayload,
    summary: {
      institutionId,
      mode,
      sourceAcademicYear,
      targetAcademicYear,
      sourceCourses: 1,
      sourceClasses: 1,
      studentsInInstitution: 1,
      plannedCourseMappings: mappings.courses.length,
      plannedClassMappings: mappings.classes.length,
      plannedStudentAssignments: mappings.studentAssignments.length,
      reusedTargetCourses: 0,
      createdTargetCourses: 1,
      reusedTargetClasses: 0,
      createdTargetClasses: 1,
    },
    mappings,
    rollbackMetadata,
    warnings: ['E2E callable mock mode enabled.'],
  };
};

export const runTransferPromotionDryRun = async (payload: any) => {
  if (isTransferPromotionE2EMockEnabled()) {
    return buildMockDryRunResponse(payload);
  }

  const callable = httpsCallable(functions, RUN_TRANSFER_PROMOTION_DRY_RUN_CALLABLE);
  const response: any = await callable(payload);

  return response?.data || {
    success: false,
    dryRunPayload: null,
    summary: null,
    mappings: {
      courses: [],
      classes: [],
      studentAssignments: [],
    },
    rollbackMetadata: null,
    warnings: [],
  };
};

export const applyTransferPromotionPlan = async ({
  dryRunPayload,
  mappings,
  rollbackMetadata,
}: any) => {
  if (isTransferPromotionE2EMockEnabled()) {
    const requestId = String(dryRunPayload?.requestId || '').trim() || buildMockRequestId();
    const rollbackId = String(rollbackMetadata?.rollbackId || '').trim() || `e2e-transfer-mock-rollback-${requestId}`;
    return {
      success: true,
      alreadyApplied: false,
      requestId,
      rollbackId,
      summary: {
        appliedCourseMappings: Array.isArray(mappings?.courses) ? mappings.courses.length : 0,
        appliedClassMappings: Array.isArray(mappings?.classes) ? mappings.classes.length : 0,
        appliedStudentAssignments: Array.isArray(mappings?.studentAssignments) ? mappings.studentAssignments.length : 0,
      },
      warnings: ['E2E callable mock mode enabled.'],
    };
  }

  const callable = httpsCallable(functions, APPLY_TRANSFER_PROMOTION_PLAN_CALLABLE);
  const response: any = await callable({
    dryRunPayload,
    mappings,
    rollbackMetadata,
  });

  return response?.data || {
    success: false,
    alreadyApplied: false,
    requestId: dryRunPayload?.requestId || null,
    rollbackId: rollbackMetadata?.rollbackId || null,
    summary: null,
    warnings: [],
  };
};

export const rollbackTransferPromotionPlan = async ({
  rollbackId,
  institutionId,
}: any) => {
  if (isTransferPromotionE2EMockEnabled()) {
    return {
      success: true,
      alreadyRolledBack: false,
      rollbackId: rollbackId || null,
      requestId: null,
      summary: {
        restoredStudents: 1,
        restoredClassMemberships: 1,
        deletedCreatedClasses: 1,
        deletedCreatedCourses: 1,
      },
      warnings: ['E2E callable mock mode enabled.'],
    };
  }

  const callable = httpsCallable(functions, ROLLBACK_TRANSFER_PROMOTION_PLAN_CALLABLE);
  const response: any = await callable({
    rollbackId,
    institutionId,
  });

  return response?.data || {
    success: false,
    alreadyRolledBack: false,
    rollbackId: rollbackId || null,
    requestId: null,
    summary: null,
    warnings: [],
  };
};
