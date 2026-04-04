// src/pages/InstitutionAdminDashboard/utils/transferPromotionPlanUtils.ts
const ACADEMIC_YEAR_PATTERN = /^(\d{4})-(\d{4})$/;

const normalizeAcademicYear = (value: any) => String(value || '').trim();

const isConsecutiveAcademicYear = (academicYear: any) => {
  const normalized = normalizeAcademicYear(academicYear);
  const match = normalized.match(ACADEMIC_YEAR_PATTERN);
  if (!match) return false;
  return Number(match[2]) - Number(match[1]) === 1;
};

const createDeterministicId = (prefix: any, valueSeed: any) => {
  const safeSeed = String(valueSeed || 'seed')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  return `${prefix}-${safeSeed || 'seed'}`;
};

export const validateTransferPromotionPayload = (payload: any) => {
  const normalizedPayload = payload && typeof payload === 'object' ? payload : {};
  const errors: string[] = [];

  if (!String(normalizedPayload.institutionId || '').trim()) {
    errors.push('institutionId es obligatorio.');
  }

  const sourceAcademicYear = normalizeAcademicYear(normalizedPayload.sourceAcademicYear);
  const targetAcademicYear = normalizeAcademicYear(normalizedPayload.targetAcademicYear);

  if (!isConsecutiveAcademicYear(sourceAcademicYear)) {
    errors.push('sourceAcademicYear debe tener formato YYYY-YYYY con años consecutivos.');
  }

  if (!isConsecutiveAcademicYear(targetAcademicYear)) {
    errors.push('targetAcademicYear debe tener formato YYYY-YYYY con años consecutivos.');
  }

  if (sourceAcademicYear && targetAcademicYear && sourceAcademicYear === targetAcademicYear) {
    errors.push('sourceAcademicYear y targetAcademicYear deben ser distintos.');
  }

  const mode = String(normalizedPayload.mode || '').trim().toLowerCase();
  if (mode !== 'promote' && mode !== 'transfer') {
    errors.push('mode debe ser "promote" o "transfer".');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const buildTransferPromotionDryRunPayload = (input: any) => {
  const sourceAcademicYear = normalizeAcademicYear(input?.sourceAcademicYear);
  const targetAcademicYear = normalizeAcademicYear(input?.targetAcademicYear);
  const mode = String(input?.mode || 'promote').trim().toLowerCase() === 'transfer' ? 'transfer' : 'promote';

  const payload = {
    requestId: createDeterministicId(
      'transfer-promote',
      `${input?.institutionId || 'institution'}-${sourceAcademicYear}-${targetAcademicYear}-${mode}`
    ),
    institutionId: String(input?.institutionId || '').trim(),
    sourceAcademicYear,
    targetAcademicYear,
    mode,
    options: {
      copyStudentLinks: input?.options?.copyStudentLinks !== false,
      includeClassMemberships: input?.options?.includeClassMemberships !== false,
      preserveVisibility: input?.options?.preserveVisibility === true,
    },
    metadata: {
      dryRun: true,
      initiatedByUid: String(input?.initiatedByUid || '').trim() || null,
      createdAtIso: String(input?.createdAtIso || new Date().toISOString()),
      rollbackStrategy: 'snapshot-and-reverse-map',
    },
  };

  return payload;
};

export const buildTransferRollbackMetadata = ({
  dryRunPayload,
  plannedCourses = [],
  plannedClasses = [],
  plannedStudentAssignments = [],
}: any) => {
  const requestId = String(dryRunPayload?.requestId || '').trim();
  const rollbackId = createDeterministicId('rollback', requestId || 'transfer-promote');

  const normalizedCourses = Array.isArray(plannedCourses)
    ? plannedCourses.map((course: any) => ({
      sourceCourseId: String(course?.sourceCourseId || '').trim(),
      targetCourseId: String(course?.targetCourseId || '').trim(),
      sourceAcademicYear: normalizeAcademicYear(course?.sourceAcademicYear),
      targetAcademicYear: normalizeAcademicYear(course?.targetAcademicYear),
    }))
    : [];

  const normalizedClasses = Array.isArray(plannedClasses)
    ? plannedClasses.map((cls: any) => ({
      sourceClassId: String(cls?.sourceClassId || '').trim(),
      targetClassId: String(cls?.targetClassId || '').trim(),
      sourceCourseId: String(cls?.sourceCourseId || '').trim(),
      targetCourseId: String(cls?.targetCourseId || '').trim(),
    }))
    : [];

  const normalizedStudentAssignments = Array.isArray(plannedStudentAssignments)
    ? plannedStudentAssignments.map((entry: any) => ({
      studentId: String(entry?.studentId || '').trim(),
      fromCourseIds: Array.isArray(entry?.fromCourseIds) ? entry.fromCourseIds.map((value: any) => String(value || '').trim()).filter(Boolean) : [],
      toCourseIds: Array.isArray(entry?.toCourseIds) ? entry.toCourseIds.map((value: any) => String(value || '').trim()).filter(Boolean) : [],
    }))
    : [];

  return {
    rollbackId,
    requestId,
    institutionId: String(dryRunPayload?.institutionId || '').trim(),
    createdAtIso: new Date().toISOString(),
    sourceAcademicYear: normalizeAcademicYear(dryRunPayload?.sourceAcademicYear),
    targetAcademicYear: normalizeAcademicYear(dryRunPayload?.targetAcademicYear),
    mode: String(dryRunPayload?.mode || 'promote').trim().toLowerCase(),
    summary: {
      plannedCourses: normalizedCourses.length,
      plannedClasses: normalizedClasses.length,
      plannedStudentAssignments: normalizedStudentAssignments.length,
    },
    mappings: {
      courses: normalizedCourses,
      classes: normalizedClasses,
      studentAssignments: normalizedStudentAssignments,
    },
  };
};
