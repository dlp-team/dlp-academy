// tests/unit/functions/transfer-promotion-roundtrip.test.js
import { describe, expect, it } from 'vitest';
import { createApplyTransferPromotionPlanHandler } from '../../../functions/security/transferPromotionApplyHandler.js';
import { createRollbackTransferPromotionPlanHandler } from '../../../functions/security/transferPromotionRollbackHandler.js';

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
    __store: store,
    __writes: writes,
  };
};

describe('transfer promotion apply/rollback roundtrip', () => {
  it('restores student-course and class-membership constraints after transfer rollback', async () => {
    const dbMock = createDbMock({
      'users/actor-1': {
        institutionId: 'inst-1',
        role: 'institutionadmin',
      },
      'courses/course-source-1': {
        institutionId: 'inst-1',
        academicYear: '2025-2026',
        name: '1 ESO',
      },
      'classes/class-source-1': {
        institutionId: 'inst-1',
        academicYear: '2025-2026',
        name: '1 ESO A',
        courseId: 'course-source-1',
        studentIds: ['student-1'],
      },
      'users/student-1': {
        institutionId: 'inst-1',
        role: 'student',
        courseId: 'course-source-1',
        courseIds: ['course-source-1'],
        enrolledCourseIds: ['course-source-1'],
      },
      'transferPromotionRuns/transfer-promote-1': {
        institutionId: 'inst-1',
        status: 'planned',
      },
    });

    const applyHandler = createApplyTransferPromotionPlanHandler({
      dbInstance: dbMock,
      serverTimestampProvider: () => 'SERVER_TIMESTAMP',
    });

    const applyResponse = await applyHandler({
      auth: { uid: 'actor-1' },
      data: {
        dryRunPayload: {
          requestId: 'transfer-promote-1',
          institutionId: 'inst-1',
          sourceAcademicYear: '2025-2026',
          targetAcademicYear: '2026-2027',
          mode: 'transfer',
          options: {
            copyStudentLinks: true,
            includeClassMemberships: true,
          },
        },
        mappings: {
          courses: [
            {
              sourceCourseId: 'course-source-1',
              targetCourseId: 'course-target-1',
              sourceAcademicYear: '2025-2026',
              targetAcademicYear: '2026-2027',
              action: 'create',
            },
          ],
          classes: [
            {
              sourceClassId: 'class-source-1',
              targetClassId: 'class-target-1',
              sourceCourseId: 'course-source-1',
              targetCourseId: 'course-target-1',
              sourceAcademicYear: '2025-2026',
              targetAcademicYear: '2026-2027',
              action: 'create',
            },
          ],
          studentAssignments: [
            {
              studentId: 'student-1',
              fromCourseIds: ['course-source-1'],
              toCourseIds: ['course-target-1'],
              resultingCourseIds: ['course-target-1'],
              fromClassIds: ['class-source-1'],
              toClassIds: ['class-target-1'],
            },
          ],
        },
        rollbackMetadata: {
          rollbackId: 'rollback-1',
          requestId: 'transfer-promote-1',
          institutionId: 'inst-1',
          sourceAcademicYear: '2025-2026',
          targetAcademicYear: '2026-2027',
          mode: 'transfer',
          summary: {
            plannedCourses: 1,
            plannedClasses: 1,
            plannedStudentAssignments: 1,
          },
        },
      },
    });

    expect(applyResponse.success).toBe(true);

    const rollbackHandler = createRollbackTransferPromotionPlanHandler({
      dbInstance: dbMock,
      serverTimestampProvider: () => 'SERVER_TIMESTAMP',
    });

    const rollbackResponse = await rollbackHandler({
      auth: { uid: 'actor-1' },
      data: {
        rollbackId: 'rollback-1',
        institutionId: 'inst-1',
      },
    });

    expect(rollbackResponse.success).toBe(true);
    expect(rollbackResponse.summary).toMatchObject({
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
      studentIds: ['student-1'],
    });
    expect(dbMock.__store['classes/class-target-1']).toBeUndefined();
    expect(dbMock.__store['courses/course-target-1']).toBeUndefined();
  });
});
