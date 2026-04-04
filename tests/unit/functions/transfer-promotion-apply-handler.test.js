// tests/unit/functions/transfer-promotion-apply-handler.test.js
import { describe, expect, it } from 'vitest';
import { createApplyTransferPromotionPlanHandler } from '../../../functions/security/transferPromotionApplyHandler.js';

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

  const writeDoc = (operation) => {
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
        commit: async () => {
          pendingOperations.forEach(writeDoc);
          writes.push(...pendingOperations);
        },
      };
    },
    __writes: writes,
    __store: store,
  };
};

describe('applyTransferPromotionPlan handler', () => {
  it('applies planned writes and returns summary', async () => {
    const dbMock = createDbMock({
      'users/actor-1': {
        institutionId: 'inst-1',
        role: 'institutionadmin',
      },
      'courses/course-source-1': {
        institutionId: 'inst-1',
        name: '1 ESO',
        academicYear: '2025-2026',
      },
      'classes/class-source-1': {
        institutionId: 'inst-1',
        name: '1 ESO A',
        academicYear: '2025-2026',
        courseId: 'course-source-1',
        studentIds: ['student-1'],
      },
      'users/student-1': {
        institutionId: 'inst-1',
        role: 'student',
        courseIds: ['course-source-1'],
      },
    });

    const handler = createApplyTransferPromotionPlanHandler({
      dbInstance: dbMock,
      serverTimestampProvider: () => 'SERVER_TIMESTAMP',
    });

    const response = await handler({
      auth: { uid: 'actor-1' },
      data: {
        dryRunPayload: {
          requestId: 'transfer-promote-inst-1-2025-2026-2026-2027-promote',
          institutionId: 'inst-1',
          sourceAcademicYear: '2025-2026',
          targetAcademicYear: '2026-2027',
          mode: 'promote',
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
              resultingCourseIds: ['course-source-1', 'course-target-1'],
              fromClassIds: ['class-source-1'],
              toClassIds: ['class-target-1'],
            },
          ],
        },
        rollbackMetadata: {
          rollbackId: 'rollback-transfer-promote-inst-1',
          requestId: 'transfer-promote-inst-1-2025-2026-2026-2027-promote',
          institutionId: 'inst-1',
          sourceAcademicYear: '2025-2026',
          targetAcademicYear: '2026-2027',
          mode: 'promote',
          summary: {
            plannedCourses: 1,
            plannedClasses: 1,
            plannedStudentAssignments: 1,
          },
        },
      },
    });

    expect(response.success).toBe(true);
    expect(response.alreadyApplied).toBe(false);
    expect(response.requestId).toBe('transfer-promote-inst-1-2025-2026-2026-2027-promote');
    expect(response.summary).toMatchObject({
      coursesCreated: 1,
      classesCreated: 1,
      studentsUpdated: 1,
      targetClassMembershipUpdates: 1,
      sourceClassMembershipUpdates: 0,
    });

    const writtenPaths = dbMock.__writes.map((write) => write.path);
    expect(writtenPaths).toContain('courses/course-target-1');
    expect(writtenPaths).toContain('classes/class-target-1');
    expect(writtenPaths).toContain('users/student-1');
    expect(writtenPaths).toContain('transferPromotionRollbacks/rollback-transfer-promote-inst-1');
    expect(writtenPaths).toContain('transferPromotionRuns/transfer-promote-inst-1-2025-2026-2026-2027-promote');

    expect(dbMock.__store['transferPromotionRollbacks/rollback-transfer-promote-inst-1']).toMatchObject({
      status: 'ready',
      executionSnapshot: {
        createdCourseIds: ['course-target-1'],
        createdClassIds: ['class-target-1'],
      },
    });
  });

  it('returns alreadyApplied when request run was previously applied', async () => {
    const dbMock = createDbMock({
      'users/actor-1': {
        institutionId: 'inst-1',
        role: 'institutionadmin',
      },
      'transferPromotionRuns/transfer-promote-inst-1-2025-2026-2026-2027-promote': {
        status: 'applied',
        rollbackId: 'rollback-existing',
        summary: {
          coursesCreated: 1,
        },
      },
    });

    const handler = createApplyTransferPromotionPlanHandler({
      dbInstance: dbMock,
      serverTimestampProvider: () => 'SERVER_TIMESTAMP',
    });

    const response = await handler({
      auth: { uid: 'actor-1' },
      data: {
        dryRunPayload: {
          requestId: 'transfer-promote-inst-1-2025-2026-2026-2027-promote',
          institutionId: 'inst-1',
          sourceAcademicYear: '2025-2026',
          targetAcademicYear: '2026-2027',
          mode: 'promote',
        },
        mappings: {
          courses: [],
          classes: [],
          studentAssignments: [],
        },
      },
    });

    expect(response).toEqual({
      success: true,
      alreadyApplied: true,
      requestId: 'transfer-promote-inst-1-2025-2026-2026-2027-promote',
      rollbackId: 'rollback-existing',
      summary: {
        coursesCreated: 1,
      },
    });
    expect(dbMock.__writes).toHaveLength(0);
  });
});
