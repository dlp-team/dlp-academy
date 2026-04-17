// tests/unit/utils/subjectPeriodLifecycleUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  buildSubjectPeriodTimeline,
  isSubjectActiveInPeriodLifecycle,
  isSubjectVisibleByPostCoursePolicy,
  normalizePeriodBoundaryDate,
} from '../../../src/utils/subjectPeriodLifecycleUtils';

describe('subjectPeriodLifecycleUtils', () => {
  it('builds period timeline bounds for configured academic calendar windows', () => {
    const timeline = buildSubjectPeriodTimeline({
      academicYear: '2025-2026',
      periodType: 'trimester',
      periodIndex: 2,
      academicCalendar: {
        startDate: '2025-09-01',
        ordinaryEndDate: '2026-06-20',
        extraordinaryEndDate: '2026-07-10',
      },
    });

    expect(timeline).not.toBeNull();
    expect(timeline.periodStartAt < timeline.periodEndAt).toBe(true);
    expect(timeline.periodExtraordinaryEndAt).toBe('2026-07-10');
  });

  it('prioritizes course-level period boundaries when provided', () => {
    const timeline = buildSubjectPeriodTimeline({
      academicYear: '2025-2026',
      periodType: 'trimester',
      periodIndex: 2,
      academicCalendar: {
        startDate: '2025-09-01',
        ordinaryEndDate: '2026-06-20',
        extraordinaryEndDate: '2026-07-10',
      },
      coursePeriodSchedule: {
        periodType: 'trimester',
        extraordinaryEndDate: '2026-03-20',
        periods: [
          { periodIndex: 1, startDate: '2025-09-05', endDate: '2025-12-01' },
          { periodIndex: 2, startDate: '2025-12-02', endDate: '2026-03-15' },
          { periodIndex: 3, startDate: '2026-03-16', endDate: '2026-06-25' },
        ],
      },
    });

    expect(timeline).toEqual({
      periodStartAt: '2025-12-02',
      periodEndAt: '2026-03-15',
      periodExtraordinaryEndAt: '2026-03-20',
    });
  });

  it('falls back to institution timeline when course schedule is missing target period', () => {
    const timeline = buildSubjectPeriodTimeline({
      academicYear: '2025-2026',
      periodType: 'trimester',
      periodIndex: 3,
      academicCalendar: {
        startDate: '2025-09-01',
        ordinaryEndDate: '2026-06-20',
        extraordinaryEndDate: '2026-07-10',
      },
      coursePeriodSchedule: {
        periodType: 'trimester',
        periods: [
          { periodIndex: 1, startDate: '2025-09-05', endDate: '2025-12-01' },
          { periodIndex: 2, startDate: '2025-12-02', endDate: '2026-03-15' },
        ],
      },
    });

    expect(timeline).not.toBeNull();
    expect(timeline.periodStartAt).not.toBe('2025-12-02');
    expect(timeline.periodExtraordinaryEndAt).toBe('2026-07-10');
  });

  it('applies student/teacher extraordinary-window visibility matrix', () => {
    const subjectBase = {
      id: 'subject-1',
      periodEndAt: '2026-05-01',
      periodExtraordinaryEndAt: '2026-05-30',
      academicYear: '2025-2026',
    };

    const duringExtraordinary = new Date('2026-05-10T12:00:00Z');

    const passedStudentVisible = isSubjectActiveInPeriodLifecycle({
      subject: { ...subjectBase, passed: true },
      user: { uid: 'student-1', role: 'student' },
      referenceDate: duringExtraordinary,
    });

    const failedStudentVisible = isSubjectActiveInPeriodLifecycle({
      subject: { ...subjectBase, passed: false },
      user: { uid: 'student-1', role: 'student' },
      referenceDate: duringExtraordinary,
    });

    const unknownStudentVisible = isSubjectActiveInPeriodLifecycle({
      subject: { ...subjectBase },
      user: { uid: 'student-1', role: 'student' },
      referenceDate: duringExtraordinary,
    });

    const teacherVisible = isSubjectActiveInPeriodLifecycle({
      subject: { ...subjectBase, passed: true },
      user: { uid: 'teacher-1', role: 'teacher' },
      referenceDate: duringExtraordinary,
    });

    const afterExtraordinaryVisible = isSubjectActiveInPeriodLifecycle({
      subject: { ...subjectBase, passed: false },
      user: { uid: 'teacher-1', role: 'teacher' },
      referenceDate: new Date('2026-06-10T12:00:00Z'),
    });

    expect(passedStudentVisible).toBe(false);
    expect(failedStudentVisible).toBe(true);
    expect(unknownStudentVisible).toBe(true);
    expect(teacherVisible).toBe(true);
    expect(afterExtraordinaryVisible).toBe(false);
  });

  it('falls back to academic-year lifecycle when period bounds are missing', () => {
    const referenceDate = new Date('2026-10-01T12:00:00Z');

    expect(
      isSubjectActiveInPeriodLifecycle({
        subject: { academicYear: '2026-2027' },
        user: { uid: 'teacher-1', role: 'teacher' },
        referenceDate,
      })
    ).toBe(true);

    expect(
      isSubjectActiveInPeriodLifecycle({
        subject: { academicYear: '2025-2026' },
        user: { uid: 'teacher-1', role: 'teacher' },
        referenceDate,
      })
    ).toBe(false);

    expect(normalizePeriodBoundaryDate('2026-07-05')).toBe('2026-07-05');
    expect(normalizePeriodBoundaryDate('invalid')).toBeNull();
  });

  it('applies post-course policy visibility after extraordinary cutoff', () => {
    const referenceDate = new Date('2026-07-20T12:00:00Z');
    const subjectBase = {
      periodEndAt: '2026-06-20',
      periodExtraordinaryEndAt: '2026-07-10',
    };

    expect(
      isSubjectVisibleByPostCoursePolicy({
        subject: { ...subjectBase, postCoursePolicy: 'delete' },
        user: { uid: 'teacher-1', role: 'teacher' },
        referenceDate,
      })
    ).toBe(false);

    expect(
      isSubjectVisibleByPostCoursePolicy({
        subject: { ...subjectBase, postCoursePolicy: 'retain_teacher_only' },
        user: { uid: 'student-1', role: 'student' },
        referenceDate,
      })
    ).toBe(false);

    expect(
      isSubjectVisibleByPostCoursePolicy({
        subject: { ...subjectBase, postCoursePolicy: 'retain_teacher_only' },
        user: { uid: 'teacher-1', role: 'teacher' },
        referenceDate,
      })
    ).toBe(true);

    expect(
      isSubjectVisibleByPostCoursePolicy({
        subject: { ...subjectBase, postCoursePolicy: 'retain_all_no_join' },
        user: { uid: 'student-1', role: 'student' },
        referenceDate,
      })
    ).toBe(true);
  });

  it('prioritizes backend lifecycle snapshot fields when available', () => {
    expect(
      isSubjectActiveInPeriodLifecycle({
        subject: { lifecyclePhase: 'active' },
        user: { uid: 'student-1', role: 'student' },
        referenceDate: new Date('2030-01-01T12:00:00Z'),
      })
    ).toBe(true);

    expect(
      isSubjectActiveInPeriodLifecycle({
        subject: { lifecyclePhase: 'extraordinary', passed: true },
        user: { uid: 'student-1', role: 'student' },
        referenceDate: new Date('2030-01-01T12:00:00Z'),
      })
    ).toBe(false);

    expect(
      isSubjectActiveInPeriodLifecycle({
        subject: { lifecyclePhase: 'extraordinary', passed: false },
        user: { uid: 'student-1', role: 'student' },
        referenceDate: new Date('2030-01-01T12:00:00Z'),
      })
    ).toBe(true);

    expect(
      isSubjectVisibleByPostCoursePolicy({
        subject: { lifecyclePostCourseVisibility: 'hidden' },
        user: { uid: 'teacher-1', role: 'teacher' },
        referenceDate: new Date('2030-01-01T12:00:00Z'),
      })
    ).toBe(false);

    expect(
      isSubjectVisibleByPostCoursePolicy({
        subject: { lifecyclePostCourseVisibility: 'teacher_only' },
        user: { uid: 'student-1', role: 'student' },
        referenceDate: new Date('2030-01-01T12:00:00Z'),
      })
    ).toBe(false);

    expect(
      isSubjectVisibleByPostCoursePolicy({
        subject: { lifecyclePostCourseVisibility: 'all_no_join' },
        user: { uid: 'student-1', role: 'student' },
        referenceDate: new Date('2030-01-01T12:00:00Z'),
      })
    ).toBe(true);
  });
});
