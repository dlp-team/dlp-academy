// functions/security/transferPromotionApplyHandler.js
import { HttpsError } from 'firebase-functions/v2/https';
import { assertNonEmptyString, requireAuthUid } from './guards.js';
import {
  buildTransferRollbackMetadata,
  toUniqueIds,
  validateTransferPromotionPayload,
} from './transferPromotionPlanUtils.js';
import {
  buildSnapshotPersistencePlan,
  TRANSFER_SNAPSHOT_CHUNK_SIZE,
  TRANSFER_SNAPSHOT_INLINE_ENTRY_LIMIT,
} from './transferPromotionSnapshotUtils.js';

const BATCH_CHUNK_SIZE = 350;

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

const normalizeMappingAction = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'reuse-existing' ? 'reuse-existing' : 'create';
};

const getStudentCourseIds = (student = {}) => (
  toUniqueIds([
    student?.courseId,
    ...(Array.isArray(student?.courseIds) ? student.courseIds : []),
    ...(Array.isArray(student?.enrolledCourseIds) ? student.enrolledCourseIds : []),
  ])
);

const applyBatchOperationsInChunks = async ({
  dbInstance,
  operations,
  chunkSize = BATCH_CHUNK_SIZE,
  onBeforeChunk,
  onAfterChunk,
}) => {
  for (let index = 0; index < operations.length; index += chunkSize) {
    const batch = dbInstance.batch();
    const chunk = operations.slice(index, index + chunkSize);
    const chunkIndex = Math.floor(index / chunkSize);
    const chunkCount = Math.ceil(operations.length / chunkSize);

    if (onBeforeChunk) {
      await onBeforeChunk({
        chunk,
        chunkIndex,
        chunkCount,
      });
    }

    chunk.forEach((operation) => operation(batch));
    await batch.commit();

    if (onAfterChunk) {
      await onAfterChunk({
        chunk,
        chunkIndex,
        chunkCount,
      });
    }
  }
};

const writeMergeDocument = async ({ dbInstance, docRef, data }) => {
  const batch = dbInstance.batch();
  batch.set(docRef, data, { merge: true });
  await batch.commit();
};

const toChunkCheckpointId = (chunkIndex) => String(chunkIndex).padStart(4, '0');

const fetchDocMapById = async ({ dbInstance, collectionName, ids = [] }) => {
  const normalizedIds = toUniqueIds(ids);
  const docSnapshots = await Promise.all(
    normalizedIds.map((id) => dbInstance.collection(collectionName).doc(id).get())
  );

  const byId = new Map();
  docSnapshots.forEach((snapshot) => {
    if (!snapshot.exists) return;
    byId.set(snapshot.id, snapshot.data() || {});
  });

  return byId;
};

const assertTenantMatch = ({ docData, institutionId, label }) => {
  const docInstitutionId = normalizeInstitutionClaim(docData?.institutionId);
  if (!docInstitutionId || docInstitutionId !== institutionId) {
    throw new HttpsError('permission-denied', `${label} does not belong to this institution.`);
  }
};

export const createApplyTransferPromotionPlanHandler = ({
  dbInstance,
  serverTimestampProvider,
  snapshotInlineEntryLimit = TRANSFER_SNAPSHOT_INLINE_ENTRY_LIMIT,
  snapshotChunkSize = TRANSFER_SNAPSHOT_CHUNK_SIZE,
}) => async (request) => {
  const actorUid = requireAuthUid(request);
  const requestData = request?.data && typeof request.data === 'object' ? request.data : {};

  const dryRunPayload = requestData?.dryRunPayload && typeof requestData.dryRunPayload === 'object'
    ? requestData.dryRunPayload
    : {};

  const mappings = requestData?.mappings && typeof requestData.mappings === 'object'
    ? requestData.mappings
    : {};

  const institutionId = assertNonEmptyString(dryRunPayload?.institutionId, 'dryRunPayload.institutionId');
  const requestId = assertNonEmptyString(dryRunPayload?.requestId, 'dryRunPayload.requestId');

  const payloadValidation = validateTransferPromotionPayload({
    institutionId,
    sourceAcademicYear: dryRunPayload?.sourceAcademicYear,
    targetAcademicYear: dryRunPayload?.targetAcademicYear,
    mode: dryRunPayload?.mode,
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
    throw new HttpsError('permission-denied', 'Only admins can apply transfer plans.');
  }

  if (actorRole === 'institutionadmin' && actorInstitutionId !== institutionId) {
    throw new HttpsError('permission-denied', 'Institution admins can only apply transfer plans for their own institution.');
  }

  const runRef = dbInstance.collection('transferPromotionRuns').doc(requestId);
  const existingRunSnapshot = await runRef.get();
  if (existingRunSnapshot.exists && String(existingRunSnapshot.data()?.status || '').trim().toLowerCase() === 'applied') {
    const existingRunData = existingRunSnapshot.data() || {};
    return {
      success: true,
      alreadyApplied: true,
      requestId,
      rollbackId: existingRunData?.rollbackId || null,
      summary: existingRunData?.summary || null,
    };
  }

  const plannedCourses = Array.isArray(mappings?.courses) ? mappings.courses : [];
  const plannedClasses = Array.isArray(mappings?.classes) ? mappings.classes : [];
  const plannedStudentAssignments = Array.isArray(mappings?.studentAssignments) ? mappings.studentAssignments : [];

  if (plannedCourses.length === 0 && plannedClasses.length === 0 && plannedStudentAssignments.length === 0) {
    throw new HttpsError('failed-precondition', 'The transfer plan has no mappings to apply.');
  }

  const normalizedRollbackMetadata = requestData?.rollbackMetadata && typeof requestData.rollbackMetadata === 'object'
    ? requestData.rollbackMetadata
    : null;

  const rollbackMetadata = normalizedRollbackMetadata?.rollbackId
    ? normalizedRollbackMetadata
    : buildTransferRollbackMetadata({
      dryRunPayload,
      plannedCourses,
      plannedClasses,
      plannedStudentAssignments,
    });

  if (String(rollbackMetadata?.requestId || '').trim() !== requestId) {
    throw new HttpsError('invalid-argument', 'rollbackMetadata.requestId must match dryRunPayload.requestId.');
  }

  const options = {
    copyStudentLinks: dryRunPayload?.options?.copyStudentLinks !== false,
    includeClassMemberships: dryRunPayload?.options?.includeClassMemberships !== false,
  };

  const mode = String(dryRunPayload?.mode || 'promote').trim().toLowerCase() === 'transfer'
    ? 'transfer'
    : 'promote';

  const warnings = [];

  const sourceCourseIdsForCreate = toUniqueIds(
    plannedCourses
      .filter((course) => normalizeMappingAction(course?.action) === 'create')
      .map((course) => course?.sourceCourseId)
  );

  const sourceClassIdsForCreate = toUniqueIds(
    plannedClasses
      .filter((cls) => normalizeMappingAction(cls?.action) === 'create')
      .map((cls) => cls?.sourceClassId)
  );

  const targetClassIdsReferenced = toUniqueIds(plannedClasses.map((cls) => cls?.targetClassId));
  const sourceClassIdsReferenced = toUniqueIds(plannedClasses.map((cls) => cls?.sourceClassId));

  const studentIdsToUpdate = options.copyStudentLinks
    ? toUniqueIds(plannedStudentAssignments.map((entry) => entry?.studentId))
    : [];

  const [sourceCoursesById, sourceClassesById, studentsById, referencedClassesById] = await Promise.all([
    fetchDocMapById({
      dbInstance,
      collectionName: 'courses',
      ids: sourceCourseIdsForCreate,
    }),
    fetchDocMapById({
      dbInstance,
      collectionName: 'classes',
      ids: sourceClassIdsForCreate,
    }),
    fetchDocMapById({
      dbInstance,
      collectionName: 'users',
      ids: studentIdsToUpdate,
    }),
    fetchDocMapById({
      dbInstance,
      collectionName: 'classes',
      ids: toUniqueIds([...targetClassIdsReferenced, ...sourceClassIdsReferenced]),
    }),
  ]);

  const targetClassAdditions = new Map();
  const sourceClassRemovals = new Map();

  if (options.copyStudentLinks && options.includeClassMemberships) {
    plannedStudentAssignments.forEach((entry) => {
      const studentId = String(entry?.studentId || '').trim();
      if (!studentId) return;

      const toClassIds = toUniqueIds(entry?.toClassIds || []);
      toClassIds.forEach((targetClassId) => {
        const existingSet = targetClassAdditions.get(targetClassId) || new Set();
        existingSet.add(studentId);
        targetClassAdditions.set(targetClassId, existingSet);
      });

      if (mode === 'transfer') {
        const fromClassIds = toUniqueIds(entry?.fromClassIds || []);
        fromClassIds.forEach((sourceClassId) => {
          const existingSet = sourceClassRemovals.get(sourceClassId) || new Set();
          existingSet.add(studentId);
          sourceClassRemovals.set(sourceClassId, existingSet);
        });
      }
    });
  }

  const operations = [];
  let coursesCreated = 0;
  let classesCreated = 0;
  let studentsUpdated = 0;
  let targetClassMembershipUpdates = 0;
  let sourceClassMembershipUpdates = 0;
  const createdCourseIds = [];
  const createdClassIds = [];
  const studentStateSnapshotsById = new Map();
  const classMembershipSnapshotsById = new Map();

  const addClassMembershipSnapshot = ({ classId, classData }) => {
    if (!classId || classMembershipSnapshotsById.has(classId)) return;

    classMembershipSnapshotsById.set(classId, {
      classId,
      studentIds: toUniqueIds(classData?.studentIds || []),
    });
  };

  plannedCourses.forEach((courseMapping) => {
    const action = normalizeMappingAction(courseMapping?.action);
    if (action !== 'create') {
      return;
    }

    const sourceCourseId = String(courseMapping?.sourceCourseId || '').trim();
    const targetCourseId = String(courseMapping?.targetCourseId || '').trim();
    if (!sourceCourseId || !targetCourseId) {
      warnings.push('Skipped one course create mapping due to missing ids.');
      return;
    }

    const sourceCourseData = sourceCoursesById.get(sourceCourseId);
    if (!sourceCourseData) {
      warnings.push(`Source course ${sourceCourseId} was not found.`);
      return;
    }

    assertTenantMatch({
      docData: sourceCourseData,
      institutionId,
      label: `Source course ${sourceCourseId}`,
    });

    const targetCourseRef = dbInstance.collection('courses').doc(targetCourseId);
    const copiedCourseData = {
      ...sourceCourseData,
      academicYear: normalizeAcademicYear(courseMapping?.targetAcademicYear) || normalizeAcademicYear(dryRunPayload?.targetAcademicYear),
      institutionId,
      status: 'active',
      transferredFromCourseId: sourceCourseId,
      transferPromotionRequestId: requestId,
      transferPromotionMode: mode,
      transferPromotionAppliedAt: serverTimestampProvider(),
      createdAt: serverTimestampProvider(),
      updatedAt: serverTimestampProvider(),
    };

    operations.push((batch) => {
      batch.set(targetCourseRef, copiedCourseData, { merge: true });
    });
    createdCourseIds.push(targetCourseId);
    coursesCreated += 1;
  });

  plannedClasses.forEach((classMapping) => {
    const action = normalizeMappingAction(classMapping?.action);
    if (action !== 'create') {
      return;
    }

    const sourceClassId = String(classMapping?.sourceClassId || '').trim();
    const targetClassId = String(classMapping?.targetClassId || '').trim();
    const targetCourseId = String(classMapping?.targetCourseId || '').trim();

    if (!sourceClassId || !targetClassId || !targetCourseId) {
      warnings.push('Skipped one class create mapping due to missing ids.');
      return;
    }

    const sourceClassData = sourceClassesById.get(sourceClassId);
    if (!sourceClassData) {
      warnings.push(`Source class ${sourceClassId} was not found.`);
      return;
    }

    assertTenantMatch({
      docData: sourceClassData,
      institutionId,
      label: `Source class ${sourceClassId}`,
    });

    const seededStudentIds = options.copyStudentLinks && options.includeClassMemberships
      ? Array.from(targetClassAdditions.get(targetClassId) || new Set())
      : [];

    const targetClassRef = dbInstance.collection('classes').doc(targetClassId);
    const copiedClassData = {
      ...sourceClassData,
      courseId: targetCourseId,
      academicYear: normalizeAcademicYear(classMapping?.targetAcademicYear) || normalizeAcademicYear(dryRunPayload?.targetAcademicYear),
      institutionId,
      status: 'active',
      studentIds: seededStudentIds,
      transferredFromClassId: sourceClassId,
      transferPromotionRequestId: requestId,
      transferPromotionMode: mode,
      transferPromotionAppliedAt: serverTimestampProvider(),
      createdAt: serverTimestampProvider(),
      updatedAt: serverTimestampProvider(),
    };

    operations.push((batch) => {
      batch.set(targetClassRef, copiedClassData, { merge: true });
    });
    createdClassIds.push(targetClassId);

    if (seededStudentIds.length > 0) {
      targetClassAdditions.delete(targetClassId);
      targetClassMembershipUpdates += 1;
    }

    classesCreated += 1;
  });

  if (options.copyStudentLinks) {
    plannedStudentAssignments.forEach((assignment) => {
      const studentId = String(assignment?.studentId || '').trim();
      if (!studentId) return;

      const studentData = studentsById.get(studentId);
      if (!studentData) {
        warnings.push(`Student ${studentId} was not found.`);
        return;
      }

      assertTenantMatch({
        docData: studentData,
        institutionId,
        label: `Student ${studentId}`,
      });

      const fromCourseIds = toUniqueIds(assignment?.fromCourseIds || []);
      const toCourseIds = toUniqueIds(assignment?.toCourseIds || []);
      const existingCourseIds = getStudentCourseIds(studentData);

      if (!studentStateSnapshotsById.has(studentId)) {
        studentStateSnapshotsById.set(studentId, {
          studentId,
          courseId: studentData?.courseId || null,
          courseIds: toUniqueIds(studentData?.courseIds || []),
          enrolledCourseIds: toUniqueIds(studentData?.enrolledCourseIds || []),
        });
      }

      const resultingCourseIds = Array.isArray(assignment?.resultingCourseIds) && assignment.resultingCourseIds.length > 0
        ? toUniqueIds(assignment.resultingCourseIds)
        : (
          mode === 'transfer'
            ? toUniqueIds([
              ...existingCourseIds.filter((courseId) => !fromCourseIds.includes(courseId)),
              ...toCourseIds,
            ])
            : toUniqueIds([...existingCourseIds, ...toCourseIds])
        );

      operations.push((batch) => {
        batch.update(dbInstance.collection('users').doc(studentId), {
          courseId: resultingCourseIds[0] || null,
          courseIds: resultingCourseIds,
          enrolledCourseIds: resultingCourseIds,
          transferPromotionRequestId: requestId,
          updatedAt: serverTimestampProvider(),
        });
      });
      studentsUpdated += 1;
    });
  }

  if (options.copyStudentLinks && options.includeClassMemberships) {
    const createdClassIdSet = new Set(createdClassIds);

    targetClassAdditions.forEach((studentIdSet, targetClassId) => {
      const classData = referencedClassesById.get(targetClassId);
      if (!classData) {
        warnings.push(`Target class ${targetClassId} was not found for membership update.`);
        return;
      }

      assertTenantMatch({
        docData: classData,
        institutionId,
        label: `Target class ${targetClassId}`,
      });

      if (!createdClassIdSet.has(targetClassId)) {
        addClassMembershipSnapshot({
          classId: targetClassId,
          classData,
        });
      }

      const nextStudentIds = toUniqueIds([
        ...(Array.isArray(classData?.studentIds) ? classData.studentIds : []),
        ...Array.from(studentIdSet),
      ]);

      operations.push((batch) => {
        batch.update(dbInstance.collection('classes').doc(targetClassId), {
          studentIds: nextStudentIds,
          updatedAt: serverTimestampProvider(),
        });
      });
      targetClassMembershipUpdates += 1;
    });

    sourceClassRemovals.forEach((studentIdSet, sourceClassId) => {
      const classData = referencedClassesById.get(sourceClassId);
      if (!classData) {
        warnings.push(`Source class ${sourceClassId} was not found for membership update.`);
        return;
      }

      assertTenantMatch({
        docData: classData,
        institutionId,
        label: `Source class ${sourceClassId}`,
      });

      addClassMembershipSnapshot({
        classId: sourceClassId,
        classData,
      });

      const currentStudentIds = toUniqueIds(classData?.studentIds || []);
      const nextStudentIds = currentStudentIds.filter((studentId) => !studentIdSet.has(studentId));

      operations.push((batch) => {
        batch.update(dbInstance.collection('classes').doc(sourceClassId), {
          studentIds: nextStudentIds,
          updatedAt: serverTimestampProvider(),
        });
      });
      sourceClassMembershipUpdates += 1;
    });
  }

  const rollbackId = assertNonEmptyString(rollbackMetadata?.rollbackId, 'rollbackMetadata.rollbackId');
  const rollbackRef = dbInstance.collection('transferPromotionRollbacks').doc(rollbackId);
  const runCheckpointCollectionName = `transferPromotionRuns/${requestId}/checkpoints`;

  const executionSnapshot = {
    mode,
    institutionId,
    requestId,
    createdCourseIds: toUniqueIds(createdCourseIds),
    createdClassIds: toUniqueIds(createdClassIds),
    studentStates: Array.from(studentStateSnapshotsById.values()),
    classMembershipStates: Array.from(classMembershipSnapshotsById.values()),
  };

  const snapshotPlan = buildSnapshotPersistencePlan({
    executionSnapshot,
    inlineEntryLimit: snapshotInlineEntryLimit,
    chunkSize: snapshotChunkSize,
  });

  const summary = {
    mode,
    sourceAcademicYear: normalizeAcademicYear(dryRunPayload?.sourceAcademicYear),
    targetAcademicYear: normalizeAcademicYear(dryRunPayload?.targetAcademicYear),
    coursesCreated,
    classesCreated,
    studentsUpdated,
    targetClassMembershipUpdates,
    sourceClassMembershipUpdates,
  };

  await writeMergeDocument({
    dbInstance,
    docRef: runRef,
    data: {
      requestId,
      institutionId,
      rollbackId,
      status: 'pending',
      dryRunPayload,
      initiatedByUid: actorUid,
      totalOperationChunks: Math.ceil(operations.length / BATCH_CHUNK_SIZE),
      updatedAt: serverTimestampProvider(),
    },
  });

  await writeMergeDocument({
    dbInstance,
    docRef: rollbackRef,
    data: {
      ...rollbackMetadata,
      institutionId,
      requestId,
      executionSnapshot: snapshotPlan.executionSnapshot,
      snapshotStorageMode: snapshotPlan.snapshotStorageMode,
      snapshotSchemaVersion: snapshotPlan.snapshotSchemaVersion,
      snapshotChecksum: snapshotPlan.snapshotChecksum,
      snapshotEntryCount: snapshotPlan.snapshotEntryCount,
      snapshotChunkCount: snapshotPlan.snapshotChunkCount,
      snapshotChunkIds: snapshotPlan.snapshotChunkIds,
      appliedByUid: actorUid,
      appliedAt: serverTimestampProvider(),
      status: 'ready',
      updatedAt: serverTimestampProvider(),
    },
  });

  if (snapshotPlan.snapshotChunks.length > 0) {
    const snapshotChunkCollectionName = `transferPromotionRollbacks/${rollbackId}/snapshotChunks`;
    const snapshotChunkOperations = snapshotPlan.snapshotChunks.map((snapshotChunk) => (
      (batch) => {
        const chunkRef = dbInstance.collection(snapshotChunkCollectionName).doc(snapshotChunk.chunkId);
        batch.set(chunkRef, {
          ...snapshotChunk,
          rollbackId,
          requestId,
          institutionId,
          snapshotSchemaVersion: snapshotPlan.snapshotSchemaVersion,
          createdAt: serverTimestampProvider(),
          updatedAt: serverTimestampProvider(),
        }, { merge: true });
      }
    ));

    await applyBatchOperationsInChunks({
      dbInstance,
      operations: snapshotChunkOperations,
    });
  }

  await writeMergeDocument({
    dbInstance,
    docRef: runRef,
    data: {
      status: 'applying',
      applyStartedAt: serverTimestampProvider(),
      lastCompletedChunkIndex: -1,
      failureCode: null,
      failureMessage: null,
      updatedAt: serverTimestampProvider(),
    },
  });

  let lastCompletedChunkIndex = -1;

  try {
    await applyBatchOperationsInChunks({
      dbInstance,
      operations,
      onBeforeChunk: async ({ chunk, chunkIndex, chunkCount }) => {
        const checkpointRef = dbInstance.collection(runCheckpointCollectionName).doc(toChunkCheckpointId(chunkIndex));
        await writeMergeDocument({
          dbInstance,
          docRef: checkpointRef,
          data: {
            requestId,
            institutionId,
            rollbackId,
            chunkIndex,
            chunkCount,
            operationCount: chunk.length,
            status: 'applying',
            updatedAt: serverTimestampProvider(),
          },
        });
      },
      onAfterChunk: async ({ chunk, chunkIndex, chunkCount }) => {
        lastCompletedChunkIndex = chunkIndex;
        const checkpointRef = dbInstance.collection(runCheckpointCollectionName).doc(toChunkCheckpointId(chunkIndex));

        await writeMergeDocument({
          dbInstance,
          docRef: checkpointRef,
          data: {
            requestId,
            institutionId,
            rollbackId,
            chunkIndex,
            chunkCount,
            operationCount: chunk.length,
            status: 'completed',
            completedAt: serverTimestampProvider(),
            updatedAt: serverTimestampProvider(),
          },
        });

        await writeMergeDocument({
          dbInstance,
          docRef: runRef,
          data: {
            status: 'applying',
            lastCompletedChunkIndex: chunkIndex,
            updatedAt: serverTimestampProvider(),
          },
        });
      },
    });
  } catch (error) {
    await writeMergeDocument({
      dbInstance,
      docRef: runRef,
      data: {
        status: 'failed',
        rollbackId,
        failureCode: 'APPLY_EXECUTION_FAILED',
        failureMessage: String(error?.message || 'Apply execution failed.').slice(0, 500),
        failedAt: serverTimestampProvider(),
        lastCompletedChunkIndex,
        updatedAt: serverTimestampProvider(),
      },
    });

    throw error;
  }

  await writeMergeDocument({
    dbInstance,
    docRef: runRef,
    data: {
      requestId,
      institutionId,
      status: 'applied',
      rollbackId,
      summary,
      dryRunPayload,
      appliedByUid: actorUid,
      appliedAt: serverTimestampProvider(),
      lastCompletedChunkIndex,
      failureCode: null,
      failureMessage: null,
      updatedAt: serverTimestampProvider(),
    },
  });

  return {
    success: true,
    alreadyApplied: false,
    requestId,
    rollbackId,
    summary,
    warnings,
  };
};
