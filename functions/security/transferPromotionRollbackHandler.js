// functions/security/transferPromotionRollbackHandler.js
import { HttpsError } from 'firebase-functions/v2/https';
import { assertNonEmptyString, requireAuthUid } from './guards.js';
import { toUniqueIds } from './transferPromotionPlanUtils.js';

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

const applyBatchOperationsInChunks = async ({ dbInstance, operations, chunkSize = BATCH_CHUNK_SIZE }) => {
  for (let index = 0; index < operations.length; index += chunkSize) {
    const batch = dbInstance.batch();
    const chunk = operations.slice(index, index + chunkSize);
    chunk.forEach((operation) => operation(batch));
    await batch.commit();
  }
};

const assertTenantMatch = ({ docData, institutionId, label }) => {
  const docInstitutionId = normalizeInstitutionClaim(docData?.institutionId);
  if (!docInstitutionId || docInstitutionId !== institutionId) {
    throw new HttpsError('permission-denied', `${label} does not belong to this institution.`);
  }
};

const fetchDocMapById = async ({ dbInstance, collectionName, ids = [] }) => {
  const normalizedIds = toUniqueIds(ids);
  const snapshots = await Promise.all(
    normalizedIds.map((id) => dbInstance.collection(collectionName).doc(id).get())
  );

  const byId = new Map();
  snapshots.forEach((snapshot) => {
    if (!snapshot.exists) return;
    byId.set(snapshot.id, snapshot.data() || {});
  });

  return byId;
};

export const createRollbackTransferPromotionPlanHandler = ({
  dbInstance,
  serverTimestampProvider,
}) => async (request) => {
  const actorUid = requireAuthUid(request);
  const rollbackId = assertNonEmptyString(request?.data?.rollbackId, 'rollbackId');
  const requestedInstitutionId = normalizeInstitutionClaim(request?.data?.institutionId);

  const actorSnapshot = await dbInstance.collection('users').doc(actorUid).get();
  if (!actorSnapshot.exists) {
    throw new HttpsError('permission-denied', 'No user profile found.');
  }

  const actorData = actorSnapshot.data() || {};
  const actorRole = normalizeRoleClaim(actorData.role);
  const actorInstitutionId = normalizeInstitutionClaim(actorData.institutionId);

  if (actorRole !== 'admin' && actorRole !== 'institutionadmin') {
    throw new HttpsError('permission-denied', 'Only admins can execute rollback plans.');
  }

  const rollbackRef = dbInstance.collection('transferPromotionRollbacks').doc(rollbackId);
  const rollbackSnapshot = await rollbackRef.get();
  if (!rollbackSnapshot.exists) {
    throw new HttpsError('not-found', 'Rollback metadata not found.');
  }

  const rollbackData = rollbackSnapshot.data() || {};
  const institutionId = normalizeInstitutionClaim(rollbackData.institutionId);
  const requestId = assertNonEmptyString(rollbackData.requestId, 'rollbackData.requestId');

  if (!institutionId) {
    throw new HttpsError('failed-precondition', 'Rollback metadata is missing institutionId.');
  }

  if (requestedInstitutionId && requestedInstitutionId !== institutionId) {
    throw new HttpsError('invalid-argument', 'institutionId mismatch for rollback metadata.');
  }

  if (actorRole === 'institutionadmin' && actorInstitutionId !== institutionId) {
    throw new HttpsError('permission-denied', 'Institution admins can only execute rollback for their own institution.');
  }

  const normalizedStatus = String(rollbackData.status || '').trim().toLowerCase();
  if (normalizedStatus === 'rolled_back') {
    return {
      success: true,
      alreadyRolledBack: true,
      rollbackId,
      requestId,
      summary: rollbackData?.rollbackSummary || null,
    };
  }

  if (normalizedStatus !== 'ready') {
    throw new HttpsError('failed-precondition', 'Rollback metadata is not ready for execution.');
  }

  const executionSnapshot = rollbackData.executionSnapshot && typeof rollbackData.executionSnapshot === 'object'
    ? rollbackData.executionSnapshot
    : null;

  if (!executionSnapshot) {
    throw new HttpsError('failed-precondition', 'Rollback execution snapshot is missing.');
  }

  const createdCourseIds = toUniqueIds(executionSnapshot.createdCourseIds || []);
  const createdClassIds = toUniqueIds(executionSnapshot.createdClassIds || []);
  const studentStates = Array.isArray(executionSnapshot.studentStates) ? executionSnapshot.studentStates : [];
  const classMembershipStates = Array.isArray(executionSnapshot.classMembershipStates)
    ? executionSnapshot.classMembershipStates
    : [];

  const studentIds = toUniqueIds(studentStates.map((entry) => entry?.studentId));
  const classIdsFromSnapshot = toUniqueIds(classMembershipStates.map((entry) => entry?.classId));

  const [studentDocsById, classDocsById, courseDocsById, createdClassDocsById] = await Promise.all([
    fetchDocMapById({ dbInstance, collectionName: 'users', ids: studentIds }),
    fetchDocMapById({ dbInstance, collectionName: 'classes', ids: classIdsFromSnapshot }),
    fetchDocMapById({ dbInstance, collectionName: 'courses', ids: createdCourseIds }),
    fetchDocMapById({ dbInstance, collectionName: 'classes', ids: createdClassIds }),
  ]);

  const operations = [];
  const warnings = [];
  let restoredStudents = 0;
  let restoredClassMemberships = 0;
  let deletedCreatedClasses = 0;
  let deletedCreatedCourses = 0;

  studentStates.forEach((studentState) => {
    const studentId = String(studentState?.studentId || '').trim();
    if (!studentId) return;

    const studentData = studentDocsById.get(studentId);
    if (!studentData) {
      warnings.push(`Student ${studentId} was not found during rollback.`);
      return;
    }

    assertTenantMatch({
      docData: studentData,
      institutionId,
      label: `Student ${studentId}`,
    });

    operations.push((batch) => {
      batch.update(dbInstance.collection('users').doc(studentId), {
        courseId: studentState?.courseId || null,
        courseIds: toUniqueIds(studentState?.courseIds || []),
        enrolledCourseIds: toUniqueIds(studentState?.enrolledCourseIds || []),
        transferPromotionRequestId: requestId,
        updatedAt: serverTimestampProvider(),
      });
    });
    restoredStudents += 1;
  });

  classMembershipStates.forEach((classState) => {
    const classId = String(classState?.classId || '').trim();
    if (!classId) return;

    const classData = classDocsById.get(classId);
    if (!classData) {
      warnings.push(`Class ${classId} was not found during rollback membership restore.`);
      return;
    }

    assertTenantMatch({
      docData: classData,
      institutionId,
      label: `Class ${classId}`,
    });

    operations.push((batch) => {
      batch.update(dbInstance.collection('classes').doc(classId), {
        studentIds: toUniqueIds(classState?.studentIds || []),
        updatedAt: serverTimestampProvider(),
      });
    });
    restoredClassMemberships += 1;
  });

  createdClassIds.forEach((classId) => {
    const classData = createdClassDocsById.get(classId);
    if (classData) {
      assertTenantMatch({
        docData: classData,
        institutionId,
        label: `Created class ${classId}`,
      });
    }

    operations.push((batch) => {
      batch.delete(dbInstance.collection('classes').doc(classId));
    });
    deletedCreatedClasses += 1;
  });

  createdCourseIds.forEach((courseId) => {
    const courseData = courseDocsById.get(courseId);
    if (courseData) {
      assertTenantMatch({
        docData: courseData,
        institutionId,
        label: `Created course ${courseId}`,
      });
    }

    operations.push((batch) => {
      batch.delete(dbInstance.collection('courses').doc(courseId));
    });
    deletedCreatedCourses += 1;
  });

  const runRef = dbInstance.collection('transferPromotionRuns').doc(requestId);
  const rollbackSummary = {
    restoredStudents,
    restoredClassMemberships,
    deletedCreatedClasses,
    deletedCreatedCourses,
  };

  operations.push((batch) => {
    batch.set(rollbackRef, {
      status: 'rolled_back',
      rolledBackByUid: actorUid,
      rolledBackAt: serverTimestampProvider(),
      rollbackSummary,
      updatedAt: serverTimestampProvider(),
    }, { merge: true });
  });

  operations.push((batch) => {
    batch.set(runRef, {
      status: 'rolled_back',
      rolledBackByUid: actorUid,
      rolledBackAt: serverTimestampProvider(),
      rollbackId,
      updatedAt: serverTimestampProvider(),
    }, { merge: true });
  });

  await applyBatchOperationsInChunks({
    dbInstance,
    operations,
  });

  return {
    success: true,
    alreadyRolledBack: false,
    rollbackId,
    requestId,
    summary: rollbackSummary,
    warnings,
  };
};
