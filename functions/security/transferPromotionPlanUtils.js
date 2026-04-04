// functions/security/transferPromotionPlanUtils.js
const ACADEMIC_YEAR_PATTERN = /^(\d{4})-(\d{4})$/;

const normalizeAcademicYear = (value) => String(value || '').trim();

const isConsecutiveAcademicYear = (academicYear) => {
  const normalized = normalizeAcademicYear(academicYear);
  const match = normalized.match(ACADEMIC_YEAR_PATTERN);
  if (!match) return false;
  return Number(match[2]) - Number(match[1]) === 1;
};

const createDeterministicId = (prefix, valueSeed) => {
  const safeSeed = String(valueSeed || 'seed')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  return `${prefix}-${safeSeed || 'seed'}`;
};

export const validateTransferPromotionPayload = (payload) => {
  const normalizedPayload = payload && typeof payload === 'object' ? payload : {};
  const errors = [];

  if (!String(normalizedPayload.institutionId || '').trim()) {
    errors.push('institutionId is required.');
  }

  const sourceAcademicYear = normalizeAcademicYear(normalizedPayload.sourceAcademicYear);
  const targetAcademicYear = normalizeAcademicYear(normalizedPayload.targetAcademicYear);

  if (!isConsecutiveAcademicYear(sourceAcademicYear)) {
    errors.push('sourceAcademicYear must follow YYYY-YYYY format with consecutive years.');
  }

  if (!isConsecutiveAcademicYear(targetAcademicYear)) {
    errors.push('targetAcademicYear must follow YYYY-YYYY format with consecutive years.');
  }

  if (sourceAcademicYear && targetAcademicYear && sourceAcademicYear === targetAcademicYear) {
    errors.push('sourceAcademicYear and targetAcademicYear must be different.');
  }

  const mode = String(normalizedPayload.mode || '').trim().toLowerCase();
  if (mode !== 'promote' && mode !== 'transfer') {
    errors.push('mode must be "promote" or "transfer".');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const buildTransferPromotionDryRunPayload = (input) => {
  const sourceAcademicYear = normalizeAcademicYear(input?.sourceAcademicYear);
  const targetAcademicYear = normalizeAcademicYear(input?.targetAcademicYear);
  const mode = String(input?.mode || 'promote').trim().toLowerCase() === 'transfer' ? 'transfer' : 'promote';

  return {
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
};

export const buildTransferRollbackMetadata = ({
  dryRunPayload,
  plannedCourses = [],
  plannedClasses = [],
  plannedStudentAssignments = [],
}) => {
  const requestId = String(dryRunPayload?.requestId || '').trim();
  const rollbackId = createDeterministicId('rollback', requestId || 'transfer-promote');

  const normalizedCourses = Array.isArray(plannedCourses)
    ? plannedCourses.map((course) => ({
      sourceCourseId: String(course?.sourceCourseId || '').trim(),
      targetCourseId: String(course?.targetCourseId || '').trim(),
      sourceAcademicYear: normalizeAcademicYear(course?.sourceAcademicYear),
      targetAcademicYear: normalizeAcademicYear(course?.targetAcademicYear),
    }))
    : [];

  const normalizedClasses = Array.isArray(plannedClasses)
    ? plannedClasses.map((cls) => ({
      sourceClassId: String(cls?.sourceClassId || '').trim(),
      targetClassId: String(cls?.targetClassId || '').trim(),
      sourceCourseId: String(cls?.sourceCourseId || '').trim(),
      targetCourseId: String(cls?.targetCourseId || '').trim(),
    }))
    : [];

  const normalizedStudentAssignments = Array.isArray(plannedStudentAssignments)
    ? plannedStudentAssignments.map((entry) => ({
      studentId: String(entry?.studentId || '').trim(),
      fromCourseIds: Array.isArray(entry?.fromCourseIds)
        ? entry.fromCourseIds.map((value) => String(value || '').trim()).filter(Boolean)
        : [],
      toCourseIds: Array.isArray(entry?.toCourseIds)
        ? entry.toCourseIds.map((value) => String(value || '').trim()).filter(Boolean)
        : [],
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

export const toUniqueIds = (values = []) => (
  Array.from(new Set(values.map((value) => String(value || '').trim()).filter(Boolean)))
);

export const buildPlannedEntityId = ({ prefix, institutionId, sourceId, targetAcademicYear }) => (
  createDeterministicId(
    prefix,
    `${institutionId || 'institution'}-${sourceId || 'entity'}-${targetAcademicYear || 'academic-year'}`
  )
);
