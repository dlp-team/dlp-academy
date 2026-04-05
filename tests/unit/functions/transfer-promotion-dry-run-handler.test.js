// tests/unit/functions/transfer-promotion-dry-run-handler.test.js
import { describe, expect, it } from 'vitest';
import { HttpsError } from 'firebase-functions/v2/https';
import { createRunTransferPromotionDryRunHandler } from '../../../functions/security/transferPromotionDryRunHandler.js';

const buildSnapshot = (entry) => ({
  exists: Boolean(entry),
  data: () => (entry ? { ...entry } : null),
});

const createDbMock = ({ actorData, institutions = [], courses = [], classes = [], students = [] }) => {
  const applyFilters = (items, filters = []) => filters.reduce((current, filter) => (
    current.filter((entry) => {
      if (filter.operator !== '==') return true;
      return String(entry?.[filter.field] || '') === String(filter.value || '');
    })
  ), items);

  const buildQueryApi = (collectionName, filters = []) => ({
    where: (field, operator, value) => buildQueryApi(collectionName, [...filters, { field, operator, value }]),
    get: async () => {
      let sourceEntries = [];

      if (collectionName === 'courses') {
        sourceEntries = courses;
      } else if (collectionName === 'classes') {
        sourceEntries = classes;
      } else if (collectionName === 'users') {
        sourceEntries = students;
      } else if (collectionName === 'institutions') {
        sourceEntries = institutions;
      }

      const filteredEntries = applyFilters(sourceEntries, filters);
      return {
        docs: filteredEntries.map((entry) => ({
          id: entry.id,
          data: () => ({ ...entry }),
        })),
      };
    },
  });

  return {
    collection: (collectionName) => ({
      doc: (docId) => ({
        get: async () => {
          if (collectionName === 'users') {
            if (actorData && String(docId) === String(actorData.id)) {
              return buildSnapshot(actorData);
            }

            const studentMatch = students.find((student) => String(student.id) === String(docId));
            return buildSnapshot(studentMatch || null);
          }

          if (collectionName === 'institutions') {
            const institutionMatch = institutions.find((institution) => String(institution.id) === String(docId));
            return buildSnapshot(institutionMatch || null);
          }

          return buildSnapshot(null);
        },
      }),
      where: (field, operator, value) => buildQueryApi(collectionName).where(field, operator, value),
      get: async () => buildQueryApi(collectionName).get(),
    }),
  };
};

describe('runTransferPromotionDryRun handler', () => {
  it('denies dry-run when transfer promotion automation is disabled for institution', async () => {
    const handler = createRunTransferPromotionDryRunHandler({
      dbInstance: createDbMock({
        actorData: {
          id: 'actor-admin',
          role: 'institutionadmin',
          institutionId: 'inst-1',
        },
        institutions: [
          {
            id: 'inst-1',
            automationSettings: {
              transferPromotionEnabled: false,
            },
          },
        ],
      }),
    });

    await expect(handler({
      auth: { uid: 'actor-admin' },
      data: {
        institutionId: 'inst-1',
        sourceAcademicYear: '2025-2026',
        targetAcademicYear: '2026-2027',
        mode: 'promote',
      },
    })).rejects.toThrow(HttpsError);

    await expect(handler({
      auth: { uid: 'actor-admin' },
      data: {
        institutionId: 'inst-1',
        sourceAcademicYear: '2025-2026',
        targetAcademicYear: '2026-2027',
        mode: 'promote',
      },
    })).rejects.toThrow('Transfer promotion tool is disabled for institution inst-1.');
  });

  it('denies institution admins trying to run dry-run for another institution', async () => {
    const handler = createRunTransferPromotionDryRunHandler({
      dbInstance: createDbMock({
        actorData: {
          id: 'actor-1',
          role: 'institutionadmin',
          institutionId: 'inst-1',
        },
        institutions: [{ id: 'inst-2' }],
      }),
    });

    await expect(handler({
      auth: { uid: 'actor-1' },
      data: {
        institutionId: 'inst-2',
        sourceAcademicYear: '2025-2026',
        targetAcademicYear: '2026-2027',
        mode: 'promote',
      },
    })).rejects.toThrow(HttpsError);

    await expect(handler({
      auth: { uid: 'actor-1' },
      data: {
        institutionId: 'inst-2',
        sourceAcademicYear: '2025-2026',
        targetAcademicYear: '2026-2027',
        mode: 'promote',
      },
    })).rejects.toThrow('Institution admins can only run transfer dry-runs for their own institution.');
  });

  it('returns dry-run mappings and rollback metadata for a valid promote request', async () => {
    const handler = createRunTransferPromotionDryRunHandler({
      dbInstance: createDbMock({
        actorData: {
          id: 'actor-admin',
          role: 'institutionadmin',
          institutionId: 'inst-1',
        },
        institutions: [{
          id: 'inst-1',
          courseLifecycle: {
            coursePromotionOrder: ['3 ESO', '2 ESO', '1 ESO'],
          },
        }],
        courses: [
          { id: 'course-source-1', institutionId: 'inst-1', academicYear: '2025-2026', name: '1 ESO', status: 'active' },
          { id: 'course-source-2', institutionId: 'inst-1', academicYear: '2025-2026', name: '2 ESO', status: 'active' },
          { id: 'course-target-1', institutionId: 'inst-1', academicYear: '2026-2027', name: '2 ESO', status: 'active' },
          { id: 'course-order-3', institutionId: 'inst-1', academicYear: '2024-2025', name: '3 ESO', status: 'active' },
        ],
        classes: [
          {
            id: 'class-source-1',
            institutionId: 'inst-1',
            academicYear: '2025-2026',
            name: '1 ESO A',
            courseId: 'course-source-1',
            studentIds: ['student-1'],
            status: 'active',
          },
          {
            id: 'class-source-2',
            institutionId: 'inst-1',
            academicYear: '2025-2026',
            name: '2 ESO B',
            courseId: 'course-source-2',
            studentIds: ['student-2'],
            status: 'active',
          },
          {
            id: 'class-target-1',
            institutionId: 'inst-1',
            academicYear: '2026-2027',
            name: '1 ESO A',
            courseId: 'course-target-1',
            studentIds: [],
            status: 'active',
          },
        ],
        students: [
          {
            id: 'student-1',
            institutionId: 'inst-1',
            role: 'student',
            courseIds: ['course-source-1'],
          },
          {
            id: 'student-2',
            institutionId: 'inst-1',
            role: 'student',
            enrolledCourseIds: ['course-source-2'],
          },
        ],
      }),
      nowProvider: () => 1712500000000,
    });

    const response = await handler({
      auth: { uid: 'actor-admin' },
      data: {
        institutionId: 'inst-1',
        sourceAcademicYear: '2025-2026',
        targetAcademicYear: '2026-2027',
        mode: 'promote',
        options: {
          copyStudentLinks: true,
          includeClassMemberships: true,
          preserveVisibility: false,
        },
      },
    });

    expect(response.success).toBe(true);
    expect(response.summary).toMatchObject({
      sourceCourses: 2,
      sourceClasses: 2,
      plannedCourseMappings: 2,
      plannedClassMappings: 2,
      plannedStudentAssignments: 2,
      reusedTargetCourses: 1,
      createdTargetCourses: 1,
    });

    const mappedCourseBySourceId = new Map(
      response.mappings.courses.map((entry) => [entry.sourceCourseId, entry])
    );

    expect(mappedCourseBySourceId.get('course-source-1')).toMatchObject({
      targetCourseName: '2 ESO',
      action: 'reuse-existing',
    });
    expect(mappedCourseBySourceId.get('course-source-2')).toMatchObject({
      targetCourseName: '3 ESO',
      action: 'create',
    });

    expect(response.rollbackMetadata).toBeTruthy();
    expect(response.rollbackMetadata.requestId).toBe(response.dryRunPayload.requestId);
    expect(response.rollbackMetadata.summary.plannedCourses).toBe(2);

    const studentAssignments = response.mappings.studentAssignments;
    expect(studentAssignments).toHaveLength(2);
    expect(studentAssignments[0].studentId).toBeTruthy();
    expect(Array.isArray(studentAssignments[0].toCourseIds)).toBe(true);
  });
});
