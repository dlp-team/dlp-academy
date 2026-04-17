// tests/unit/functions/transfer-promotion-rollback-handler.test.js
import { describe, expect, it } from 'vitest';
import { createRollbackTransferPromotionPlanHandler } from '../../../functions/security/transferPromotionRollbackHandler.js';
import { buildExecutionSnapshotChecksum } from '../../../functions/security/transferPromotionSnapshotUtils.js';

const buildDocPath = (collectionName, docId) => `${collectionName}/${docId}`;

const createSnapshot = (docId, value) => ({
  id: docId,
  exists: Boolean(value),
  data: () => (value ? { ...value } : null),
});

const createDbMock = (initialDocs = {}) => {
  const store = { ...initialDocs };
  const writes = [];

  const readDoc = (collectionName, docId) => store[buildDocPath(collectionName, docId)] || null;

  const applyOperation = (operation) => {
    const previousValue = store[operation.path] || {};

    if (operation.type === 'set') {
      const shouldMerge = operation.options?.merge === true;
      store[operation.path] = shouldMerge
        ? { ...previousValue, ...operation.data }
        : { ...operation.data };
      return;
    }

    if (operation.type === 'update') {
      store[operation.path] = { ...previousValue, ...operation.data };
      return;
    }

    if (operation.type === 'delete') {
      delete store[operation.path];
    }
  };

  return {
    collection: (collectionName) => ({
      doc: (docId) => ({
        id: docId,
        path: buildDocPath(collectionName, docId),
        get: async () => createSnapshot(docId, readDoc(collectionName, docId)),
      }),
    }),
    batch: () => {
      const pendingOperations = [];
      return {
        set: (docRef, data, options) => {
          pendingOperations.push({
            type: 'set',
            path: docRef.path,
            data,
            options,
          });
        },
        update: (docRef, data) => {
          pendingOperations.push({
            type: 'update',
            path: docRef.path,
            data,
          });
        },
        delete: (docRef) => {
          pendingOperations.push({
            type: 'delete',
            path: docRef.path,
          });
        },
        commit: async () => {
          pendingOperations.forEach(applyOperation);
          writes.push(...pendingOperations);
        },
      };
    },
    __writes: writes,
    __store: store,
  };
};

describe('rollbackTransferPromotionPlan handler', () => {
  it('rolls back applied transfer artifacts using execution snapshot metadata', async () => {
    const dbMock = createDbMock({
      'users/actor-1': {
        institutionId: 'inst-1',
        role: 'institutionadmin',
      },
      'users/student-1': {
        institutionId: 'inst-1',
        role: 'student',
        courseId: 'course-target-1',
        courseIds: ['course-target-1'],
        enrolledCourseIds: ['course-target-1'],
      },
      'classes/class-source-1': {
        institutionId: 'inst-1',
        studentIds: ['student-x'],
      },
      'classes/class-target-1': {
        institutionId: 'inst-1',
        studentIds: ['student-1'],
      },
      'courses/course-target-1': {
        institutionId: 'inst-1',
        academicYear: '2026-2027',
      },
      'transferPromotionRuns/transfer-promote-1': {
        institutionId: 'inst-1',
        status: 'applied',
      },
      'transferPromotionRollbacks/rollback-1': {
        institutionId: 'inst-1',
        requestId: 'transfer-promote-1',
        status: 'ready',
        executionSnapshot: {
          createdCourseIds: ['course-target-1'],
          createdClassIds: ['class-target-1'],
          studentStates: [
            {
              studentId: 'student-1',
              courseId: 'course-source-1',
              courseIds: ['course-source-1'],
              enrolledCourseIds: ['course-source-1'],
            },
          ],
          classMembershipStates: [
            {
              classId: 'class-source-1',
              studentIds: ['student-1', 'student-x'],
            },
          ],
        },
      },
    });

    const handler = createRollbackTransferPromotionPlanHandler({
      dbInstance: dbMock,
      serverTimestampProvider: () => 'SERVER_TIMESTAMP',
    });

    const response = await handler({
      auth: { uid: 'actor-1' },
      data: {
        rollbackId: 'rollback-1',
        institutionId: 'inst-1',
      },
    });

    expect(response.success).toBe(true);
    expect(response.alreadyRolledBack).toBe(false);
    expect(response.rollbackId).toBe('rollback-1');
    expect(response.requestId).toBe('transfer-promote-1');
    expect(response.summary).toMatchObject({
      restoredStudents: 1,
      restoredClassMemberships: 1,
      deletedCreatedClasses: 1,
      deletedCreatedCourses: 1,
    });

    expect(dbMock.__store['users/student-1']).toMatchObject({
      courseId: 'course-source-1',
      courseIds: ['course-source-1'],
      enrolledCourseIds: ['course-source-1'],
    });
    expect(dbMock.__store['classes/class-source-1']).toMatchObject({
      studentIds: ['student-1', 'student-x'],
    });
    expect(dbMock.__store['classes/class-target-1']).toBeUndefined();
    expect(dbMock.__store['courses/course-target-1']).toBeUndefined();
    expect(dbMock.__store['transferPromotionRollbacks/rollback-1']).toMatchObject({
      status: 'rolled_back',
    });
    expect(dbMock.__store['transferPromotionRuns/transfer-promote-1']).toMatchObject({
      status: 'rolled_back',
    });
  });

  it('returns alreadyRolledBack when rollback status was already finalized', async () => {
    const dbMock = createDbMock({
      'users/actor-1': {
        institutionId: 'inst-1',
        role: 'institutionadmin',
      },
      'transferPromotionRollbacks/rollback-1': {
        institutionId: 'inst-1',
        requestId: 'transfer-promote-1',
        status: 'rolled_back',
        rollbackSummary: {
          restoredStudents: 2,
        },
      },
    });

    const handler = createRollbackTransferPromotionPlanHandler({
      dbInstance: dbMock,
      serverTimestampProvider: () => 'SERVER_TIMESTAMP',
    });

    const response = await handler({
      auth: { uid: 'actor-1' },
      data: {
        rollbackId: 'rollback-1',
      },
    });

    expect(response).toEqual({
      success: true,
      alreadyRolledBack: true,
      rollbackId: 'rollback-1',
      requestId: 'transfer-promote-1',
      summary: {
        restoredStudents: 2,
      },
    });
    expect(dbMock.__writes).toHaveLength(0);
  });

  it('reassembles and executes chunked rollback snapshot metadata', async () => {
    const executionSnapshot = {
      mode: 'transfer',
      institutionId: 'inst-1',
      requestId: 'transfer-promote-1',
      createdCourseIds: ['course-target-1'],
      createdClassIds: ['class-target-1'],
      studentStates: [
        {
          studentId: 'student-1',
          courseId: 'course-source-1',
          courseIds: ['course-source-1'],
          enrolledCourseIds: ['course-source-1'],
        },
      ],
      classMembershipStates: [
        {
          classId: 'class-source-1',
          studentIds: ['student-1', 'student-x'],
        },
      ],
    };

    const dbMock = createDbMock({
      'users/actor-1': {
        institutionId: 'inst-1',
        role: 'institutionadmin',
      },
      'users/student-1': {
        institutionId: 'inst-1',
        role: 'student',
        courseId: 'course-target-1',
        courseIds: ['course-target-1'],
        enrolledCourseIds: ['course-target-1'],
      },
      'classes/class-source-1': {
        institutionId: 'inst-1',
        studentIds: ['student-x'],
      },
      'classes/class-target-1': {
        institutionId: 'inst-1',
        studentIds: ['student-1'],
      },
      'courses/course-target-1': {
        institutionId: 'inst-1',
        academicYear: '2026-2027',
      },
      'transferPromotionRuns/transfer-promote-1': {
        institutionId: 'inst-1',
        status: 'applied',
      },
      'transferPromotionRollbacks/rollback-1': {
        institutionId: 'inst-1',
        requestId: 'transfer-promote-1',
        mode: 'transfer',
        status: 'ready',
        snapshotStorageMode: 'chunked',
        snapshotChunkIds: [
          '0000-createdCourseIds',
          '0001-createdClassIds',
          '0002-studentStates',
          '0003-classMembershipStates',
        ],
        snapshotChecksum: buildExecutionSnapshotChecksum(executionSnapshot),
      },
      'transferPromotionRollbacks/rollback-1/snapshotChunks/0000-createdCourseIds': {
        chunkIndex: 0,
        key: 'createdCourseIds',
        values: ['course-target-1'],
      },
      'transferPromotionRollbacks/rollback-1/snapshotChunks/0001-createdClassIds': {
        chunkIndex: 1,
        key: 'createdClassIds',
        values: ['class-target-1'],
      },
      'transferPromotionRollbacks/rollback-1/snapshotChunks/0002-studentStates': {
        chunkIndex: 2,
        key: 'studentStates',
        values: executionSnapshot.studentStates,
      },
      'transferPromotionRollbacks/rollback-1/snapshotChunks/0003-classMembershipStates': {
        chunkIndex: 3,
        key: 'classMembershipStates',
        values: executionSnapshot.classMembershipStates,
      },
    });

    const handler = createRollbackTransferPromotionPlanHandler({
      dbInstance: dbMock,
      serverTimestampProvider: () => 'SERVER_TIMESTAMP',
    });

    const response = await handler({
      auth: { uid: 'actor-1' },
      data: {
        rollbackId: 'rollback-1',
        institutionId: 'inst-1',
      },
    });

    expect(response.success).toBe(true);
    expect(response.alreadyRolledBack).toBe(false);
    expect(response.summary).toMatchObject({
      restoredStudents: 1,
      restoredClassMemberships: 1,
      deletedCreatedClasses: 1,
      deletedCreatedCourses: 1,
    });
    expect(dbMock.__store['classes/class-target-1']).toBeUndefined();
    expect(dbMock.__store['courses/course-target-1']).toBeUndefined();
  });
});
