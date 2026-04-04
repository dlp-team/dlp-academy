// functions/security/transferPromotionDryRunHandler.js
import { HttpsError } from 'firebase-functions/v2/https';
import { assertNonEmptyString, requireAuthUid } from './guards.js';
import {
  buildPlannedEntityId,
  buildTransferPromotionDryRunPayload,
  buildTransferRollbackMetadata,
  toUniqueIds,
  validateTransferPromotionPayload,
} from './transferPromotionPlanUtils.js';

const PREVIEW_LIMIT = 500;

const normalizeInstitutionClaim = (value) => {
  const normalized = String(value || '').trim();
  return normalized.length > 0 ? normalized : null;
};

const normalizeRoleClaim = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'admin' || normalized === 'institutionadmin') {
    return normalized;
  }
  return 'student';
};

const normalizeAcademicYear = (value) => String(value || '').trim();

const normalizeEntityStatus = (value) => String(value || 'active').trim().toLowerCase();

const isActiveEntity = (entity) => normalizeEntityStatus(entity?.status) !== 'trashed';

const normalizeTextKey = (value) => String(value || '').trim().toLowerCase();

const buildCourseMatchKey = (course) => {
  const byName = normalizeTextKey(course?.name);
  if (byName) return byName;
  return normalizeTextKey(course?.identifier || course?.id);
};

const buildClassMatchKey = ({ className, targetCourseId }) => (
  `${normalizeTextKey(className)}::${String(targetCourseId || '').trim()}`
);

const getStudentCourseIds = (student = {}) => (
  toUniqueIds([
    student?.courseId,
    ...(Array.isArray(student?.courseIds) ? student.courseIds : []),
    ...(Array.isArray(student?.enrolledCourseIds) ? student.enrolledCourseIds : []),
  ])
);

const sliceWithWarning = ({ entries, warnings, warningText }) => {
  if (!Array.isArray(entries)) return [];
  if (entries.length <= PREVIEW_LIMIT) return entries;

  warnings.push(warningText);
  return entries.slice(0, PREVIEW_LIMIT);
};

export const createRunTransferPromotionDryRunHandler = ({
  dbInstance,
  nowProvider = Date.now,
}) => async (request) => {
  const actorUid = requireAuthUid(request);
  const rawPayload = (request?.data && typeof request.data === 'object') ? request.data : {};

  const institutionId = assertNonEmptyString(rawPayload?.institutionId, 'institutionId');
  const sourceAcademicYear = normalizeAcademicYear(rawPayload?.sourceAcademicYear);
  const targetAcademicYear = normalizeAcademicYear(rawPayload?.targetAcademicYear);
  const mode = String(rawPayload?.mode || 'promote').trim().toLowerCase() === 'transfer'
    ? 'transfer'
    : 'promote';
  const options = {
    copyStudentLinks: rawPayload?.options?.copyStudentLinks !== false,
    includeClassMemberships: rawPayload?.options?.includeClassMemberships !== false,
    preserveVisibility: rawPayload?.options?.preserveVisibility === true,
  };

  const payloadValidation = validateTransferPromotionPayload({
    institutionId,
    sourceAcademicYear,
    targetAcademicYear,
    mode,
  });

  if (!payloadValidation.valid) {
    throw new HttpsError('invalid-argument', payloadValidation.errors.join(' '));
  }

  const actorSnapshot = await dbInstance.collection('users').doc(actorUid).get();
  if (!actorSnapshot.exists) {
    throw new HttpsError('permission-denied', 'No user profile found.');
  }

  const actorData = actorSnapshot.data() || {};
  const actorRole = normalizeRoleClaim(actorData.role);
  const actorInstitutionId = normalizeInstitutionClaim(actorData.institutionId);

  if (actorRole !== 'admin' && actorRole !== 'institutionadmin') {
    throw new HttpsError('permission-denied', 'Only admins can run transfer dry-runs.');
  }

  if (actorRole === 'institutionadmin' && actorInstitutionId !== institutionId) {
    throw new HttpsError('permission-denied', 'Institution admins can only run transfer dry-runs for their own institution.');
  }

  const institutionSnapshot = await dbInstance.collection('institutions').doc(institutionId).get();
  if (!institutionSnapshot.exists) {
    throw new HttpsError('not-found', 'Institution not found.');
  }

  const [coursesSnapshot, classesSnapshot, studentsSnapshot] = await Promise.all([
    dbInstance.collection('courses').where('institutionId', '==', institutionId).get(),
    dbInstance.collection('classes').where('institutionId', '==', institutionId).get(),
    dbInstance.collection('users').where('institutionId', '==', institutionId).where('role', '==', 'student').get(),
  ]);

  const activeCourses = coursesSnapshot.docs
    .map((courseDoc) => ({ id: courseDoc.id, ...courseDoc.data() }))
    .filter(isActiveEntity);

  const activeClasses = classesSnapshot.docs
    .map((classDoc) => ({ id: classDoc.id, ...classDoc.data() }))
    .filter(isActiveEntity);

  const students = studentsSnapshot.docs
    .map((studentDoc) => ({ id: studentDoc.id, ...studentDoc.data() }));

  const sourceCourses = activeCourses.filter((course) => normalizeAcademicYear(course?.academicYear) === sourceAcademicYear);
  const targetCourses = activeCourses.filter((course) => normalizeAcademicYear(course?.academicYear) === targetAcademicYear);

  const targetCoursesByMatchKey = new Map();
  targetCourses.forEach((course) => {
    const key = buildCourseMatchKey(course);
    if (!key) return;
    const previous = targetCoursesByMatchKey.get(key) || [];
    previous.push(course);
    targetCoursesByMatchKey.set(key, previous);
  });

  const plannedCourses = sourceCourses.map((course) => {
    const matchKey = buildCourseMatchKey(course);
    const matchingTargets = targetCoursesByMatchKey.get(matchKey) || [];
    const reusedCourse = matchingTargets[0] || null;

    return {
      sourceCourseId: String(course.id || '').trim(),
      sourceCourseName: String(course?.name || '').trim(),
      targetCourseId: reusedCourse
        ? String(reusedCourse.id || '').trim()
        : buildPlannedEntityId({
          prefix: 'planned-course',
          institutionId,
          sourceId: course.id,
          targetAcademicYear,
        }),
      targetCourseName: String(course?.name || '').trim(),
      sourceAcademicYear,
      targetAcademicYear,
      action: reusedCourse ? 'reuse-existing' : 'create',
    };
  });

  const plannedCoursesBySourceId = new Map();
  plannedCourses.forEach((entry) => {
    plannedCoursesBySourceId.set(String(entry?.sourceCourseId || '').trim(), entry);
  });

  const sourceClasses = activeClasses.filter((cls) => {
    const classCourseId = String(cls?.courseId || '').trim();
    const classAcademicYear = normalizeAcademicYear(cls?.academicYear);
    return classAcademicYear === sourceAcademicYear || plannedCoursesBySourceId.has(classCourseId);
  });

  const targetClassesByMatchKey = new Map();
  activeClasses
    .filter((cls) => normalizeAcademicYear(cls?.academicYear) === targetAcademicYear)
    .forEach((cls) => {
      const key = buildClassMatchKey({
        className: cls?.name,
        targetCourseId: cls?.courseId,
      });
      if (!key) return;
      const previous = targetClassesByMatchKey.get(key) || [];
      previous.push(cls);
      targetClassesByMatchKey.set(key, previous);
    });

  const warnings = [];

  const plannedClasses = sourceClasses
    .map((cls) => {
      const sourceCourseId = String(cls?.courseId || '').trim();
      const plannedCourse = plannedCoursesBySourceId.get(sourceCourseId);
      if (!plannedCourse) {
        return null;
      }

      const classMatchKey = buildClassMatchKey({
        className: cls?.name,
        targetCourseId: plannedCourse.targetCourseId,
      });
      const matchingTargetClasses = targetClassesByMatchKey.get(classMatchKey) || [];
      const reusedClass = matchingTargetClasses[0] || null;

      return {
        sourceClassId: String(cls.id || '').trim(),
        sourceClassName: String(cls?.name || '').trim(),
        sourceCourseId,
        targetClassId: reusedClass
          ? String(reusedClass.id || '').trim()
          : buildPlannedEntityId({
            prefix: 'planned-class',
            institutionId,
            sourceId: cls.id,
            targetAcademicYear,
          }),
        targetClassName: String(cls?.name || '').trim(),
        targetCourseId: plannedCourse.targetCourseId,
        sourceAcademicYear,
        targetAcademicYear,
        action: reusedClass ? 'reuse-existing' : 'create',
      };
    })
    .filter(Boolean);

  const plannedClassesBySourceId = new Map();
  plannedClasses.forEach((entry) => {
    plannedClassesBySourceId.set(String(entry?.sourceClassId || '').trim(), entry);
  });

  const studentIdsBySourceClassId = new Map();
  sourceClasses.forEach((cls) => {
    studentIdsBySourceClassId.set(String(cls?.id || '').trim(), toUniqueIds(cls?.studentIds || []));
  });

  const plannedStudentAssignments = options.copyStudentLinks
    ? students
      .map((student) => {
        const studentId = String(student?.id || '').trim();
        const currentCourseIds = getStudentCourseIds(student);
        const fromCourseIds = currentCourseIds.filter((courseId) => plannedCoursesBySourceId.has(courseId));
        if (fromCourseIds.length === 0) {
          return null;
        }

        const toCourseIds = toUniqueIds(
          fromCourseIds
            .map((sourceCourseId) => plannedCoursesBySourceId.get(sourceCourseId)?.targetCourseId)
            .filter(Boolean)
        );

        const keptCourseIds = mode === 'transfer'
          ? currentCourseIds.filter((courseId) => !plannedCoursesBySourceId.has(courseId))
          : currentCourseIds;

        const resultingCourseIds = toUniqueIds([...keptCourseIds, ...toCourseIds]);

        const fromClassIds = options.includeClassMemberships
          ? Array.from(studentIdsBySourceClassId.entries())
            .filter(([, classStudentIds]) => classStudentIds.includes(studentId))
            .map(([sourceClassId]) => sourceClassId)
          : [];

        const toClassIds = options.includeClassMemberships
          ? toUniqueIds(
            fromClassIds
              .map((sourceClassId) => plannedClassesBySourceId.get(sourceClassId)?.targetClassId)
              .filter(Boolean)
          )
          : [];

        return {
          studentId,
          fromCourseIds,
          toCourseIds,
          resultingCourseIds,
          fromClassIds,
          toClassIds,
        };
      })
      .filter(Boolean)
    : [];

  if (sourceCourses.length === 0) {
    warnings.push(`No active courses were found for sourceAcademicYear ${sourceAcademicYear}.`);
  }

  if (options.preserveVisibility) {
    warnings.push('preserveVisibility was requested, but visibility updates are not applied during dry-run.');
  }

  const nowIso = new Date(nowProvider()).toISOString();
  const dryRunPayload = buildTransferPromotionDryRunPayload({
    institutionId,
    sourceAcademicYear,
    targetAcademicYear,
    mode,
    options,
    initiatedByUid: actorUid,
    createdAtIso: nowIso,
  });

  const previewCourses = sliceWithWarning({
    entries: plannedCourses,
    warnings,
    warningText: `Course mappings were truncated to the first ${PREVIEW_LIMIT} rows.`,
  });
  const previewClasses = sliceWithWarning({
    entries: plannedClasses,
    warnings,
    warningText: `Class mappings were truncated to the first ${PREVIEW_LIMIT} rows.`,
  });
  const previewStudentAssignments = sliceWithWarning({
    entries: plannedStudentAssignments,
    warnings,
    warningText: `Student assignment mappings were truncated to the first ${PREVIEW_LIMIT} rows.`,
  });

  const rollbackMetadata = buildTransferRollbackMetadata({
    dryRunPayload,
    plannedCourses: previewCourses,
    plannedClasses: previewClasses,
    plannedStudentAssignments: previewStudentAssignments,
  });

  return {
    success: true,
    dryRunPayload,
    summary: {
      institutionId,
      mode,
      sourceAcademicYear,
      targetAcademicYear,
      sourceCourses: sourceCourses.length,
      sourceClasses: sourceClasses.length,
      studentsInInstitution: students.length,
      plannedCourseMappings: plannedCourses.length,
      plannedClassMappings: plannedClasses.length,
      plannedStudentAssignments: plannedStudentAssignments.length,
      reusedTargetCourses: plannedCourses.filter((entry) => entry.action === 'reuse-existing').length,
      createdTargetCourses: plannedCourses.filter((entry) => entry.action === 'create').length,
      reusedTargetClasses: plannedClasses.filter((entry) => entry.action === 'reuse-existing').length,
      createdTargetClasses: plannedClasses.filter((entry) => entry.action === 'create').length,
    },
    mappings: {
      courses: previewCourses,
      classes: previewClasses,
      studentAssignments: previewStudentAssignments,
    },
    rollbackMetadata,
    warnings,
  };
};
