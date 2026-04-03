// tests/unit/utils/subjectAccessUtils.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

const firestoreMocks = vi.hoisted(() => ({
  mockDoc: vi.fn((_db, collectionName, docId) => ({ collectionName, docId })),
  mockGetDoc: vi.fn(),
}));

vi.mock('../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    doc: firestoreMocks.mockDoc,
    getDoc: firestoreMocks.mockGetDoc,
  };
});

import {
  normalizeSubjectAccessPayload,
  canUserAccessSubject,
} from '../../../src/utils/subjectAccessUtils';

describe('subjectAccessUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes payload fields and trims shared access data', () => {
    const normalized = normalizeSubjectAccessPayload({
      course: '  4to B  ',
      courseId: ' course-4b ',
      academicYear: ' 2026-2027 ',
      periodType: ' trimester ',
      periodLabel: ' Trimestre 2 ',
      periodIndex: '2',
      periodStartAt: ' 2026-01-15 ',
      periodEndAt: '2026-03-30',
      periodExtraordinaryEndAt: ' 2026-07-05 ',
      classId: ' class-main ',
      classIds: ['class-aux', 'class-main', '  class-aux  ', ''],
      enrolledStudentUids: [' student-1 ', 'student-2', 'student-1', null],
      inviteCode: '  CODE-01  ',
    });

    expect(normalized.course).toBe('4to B');
    expect(normalized.courseId).toBe('course-4b');
    expect(normalized.academicYear).toBe('2026-2027');
    expect(normalized.periodType).toBe('trimester');
    expect(normalized.periodLabel).toBe('Trimestre 2');
    expect(normalized.periodIndex).toBe(2);
    expect(normalized.periodStartAt).toBe('2026-01-15');
    expect(normalized.periodEndAt).toBe('2026-03-30');
    expect(normalized.periodExtraordinaryEndAt).toBe('2026-07-05');
    expect(normalized.classId).toBe('class-main');
    expect(normalized.classIds).toEqual(['class-main', 'class-aux']);
    expect(normalized.enrolledStudentUids).toEqual(['student-1', 'student-2']);
    expect(normalized.inviteCode).toBe('CODE-01');
  });

  it('stores optional courseId and academicYear as null when empty', () => {
    const normalized = normalizeSubjectAccessPayload({
      course: 'Curso base',
      courseId: '   ',
      academicYear: '',
      periodType: '',
      periodLabel: '  ',
      periodIndex: '',
      periodStartAt: '',
      periodEndAt: 'invalid-date',
      periodExtraordinaryEndAt: '2026/07/05',
    });

    expect(normalized.courseId).toBeNull();
    expect(normalized.academicYear).toBeNull();
    expect(normalized.periodType).toBeNull();
    expect(normalized.periodLabel).toBeNull();
    expect(normalized.periodIndex).toBeNull();
    expect(normalized.periodStartAt).toBeNull();
    expect(normalized.periodEndAt).toBeNull();
    expect(normalized.periodExtraordinaryEndAt).toBeNull();
  });

  it('rejects missing course when required', () => {
    expect(() => normalizeSubjectAccessPayload({ course: '   ' })).toThrow(
      'El curso es obligatorio para crear la asignatura.'
    );
  });

  it('allows legacy subjects with no class/enrollment gate', async () => {
    const canAccess = await canUserAccessSubject({
      subject: {
        id: 'subject-legacy',
        ownerId: 'owner-1',
        institutionId: 'inst-1',
      },
      user: {
        uid: 'student-1',
        role: 'student',
        institutionId: 'inst-1',
      },
    });

    expect(canAccess).toBe(true);
  });

  it('denies cross-institution access for non-admin users', async () => {
    const canAccess = await canUserAccessSubject({
      subject: {
        id: 'subject-1',
        institutionId: 'inst-2',
      },
      user: {
        uid: 'teacher-1',
        role: 'teacher',
        institutionId: 'inst-1',
      },
    });

    expect(canAccess).toBe(false);
  });

  it('allows admin users across institutions', async () => {
    const canAccess = await canUserAccessSubject({
      subject: {
        id: 'subject-1',
        institutionId: 'inst-2',
        classId: 'class-admin-bypass',
      },
      user: {
        uid: 'admin-1',
        role: 'admin',
        institutionId: 'inst-1',
      },
    });

    expect(canAccess).toBe(true);
  });

  it('allows teachers assigned to the class', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'class-teacher-1',
      data: () => ({ teacherId: 'teacher-1', coTeacherIds: ['teacher-2'] }),
    });

    const canAccess = await canUserAccessSubject({
      subject: {
        id: 'subject-2',
        classId: 'class-teacher-1',
        institutionId: 'inst-1',
      },
      user: {
        uid: 'teacher-1',
        role: 'teacher',
        institutionId: 'inst-1',
      },
    });

    expect(canAccess).toBe(true);
    expect(firestoreMocks.mockDoc).toHaveBeenCalledWith(expect.any(Object), 'classes', 'class-teacher-1');
  });

  it('allows students listed in subject enrolledStudentUids without class read', async () => {
    const canAccess = await canUserAccessSubject({
      subject: {
        id: 'subject-3',
        classId: 'class-student-direct',
        institutionId: 'inst-1',
        enrolledStudentUids: ['student-9', 'student-10'],
      },
      user: {
        uid: 'student-10',
        role: 'student',
        institutionId: 'inst-1',
      },
    });

    expect(canAccess).toBe(true);
    expect(firestoreMocks.mockGetDoc).not.toHaveBeenCalled();
  });

  it('allows students included in class studentIds', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'class-students-1',
      data: () => ({ studentIds: ['student-3', 'student-4'] }),
    });

    const canAccess = await canUserAccessSubject({
      subject: {
        id: 'subject-4',
        classId: 'class-students-1',
        institutionId: 'inst-1',
      },
      user: {
        uid: 'student-4',
        role: 'student',
        institutionId: 'inst-1',
      },
    });

    expect(canAccess).toBe(true);
  });

  it('allows explicitly shared users by email', async () => {
    const canAccess = await canUserAccessSubject({
      subject: {
        id: 'subject-5',
        institutionId: 'inst-1',
        sharedWith: [{ email: 'viewer@test.com' }],
      },
      user: {
        uid: 'viewer-1',
        email: 'viewer@test.com',
        role: 'teacher',
        institutionId: 'inst-1',
      },
    });

    expect(canAccess).toBe(true);
  });

  it('denies access when user context is missing', async () => {
    const canAccess = await canUserAccessSubject({
      subject: { id: 'subject-6' },
      user: null,
    });

    expect(canAccess).toBe(false);
  });
});
