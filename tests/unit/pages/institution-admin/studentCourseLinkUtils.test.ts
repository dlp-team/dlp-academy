// tests/unit/pages/institution-admin/studentCourseLinkUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  getStudentLinkedCourseIds,
  resolveEligibleStudentsForCourse,
} from '../../../../src/pages/InstitutionAdminDashboard/components/classes-courses/studentCourseLinkUtils';

describe('studentCourseLinkUtils', () => {
  it('combines profile links and class-derived links for a student', () => {
    const student = {
      id: 'student-1',
      courseId: 'course-a',
      courseIds: ['course-b'],
      enrolledCourseIds: ['course-c'],
    };

    const classes = [
      { id: 'class-1', courseId: 'course-d', studentIds: ['student-1'] },
      { id: 'class-2', courseId: 'course-e', studentIds: ['student-2'] },
    ];

    expect(getStudentLinkedCourseIds({ student, classes })).toEqual([
      'course-a',
      'course-b',
      'course-c',
      'course-d',
    ]);
  });

  it('filters students to the selected course when links exist', () => {
    const students = [
      { id: 'student-1', displayName: 'Uno', courseId: 'course-a' },
      { id: 'student-2', displayName: 'Dos', courseId: 'course-b' },
      { id: 'student-3', displayName: 'Tres' },
    ];

    const result = resolveEligibleStudentsForCourse({
      students,
      selectedCourseId: 'course-a',
      classes: [],
    });

    expect(result.isLegacyFallback).toBe(false);
    expect(result.eligibleStudents.map((student) => student.id)).toEqual(['student-1']);
  });

  it('uses legacy fallback when no student has course links yet', () => {
    const students = [
      { id: 'student-1', displayName: 'Uno' },
      { id: 'student-2', displayName: 'Dos' },
    ];

    const result = resolveEligibleStudentsForCourse({
      students,
      selectedCourseId: 'course-a',
      classes: [],
    });

    expect(result.isLegacyFallback).toBe(true);
    expect(result.eligibleStudents.map((student) => student.id)).toEqual(['student-1', 'student-2']);
  });

  it('resolves links through class membership when profile fields are missing', () => {
    const students = [
      { id: 'student-1', displayName: 'Uno' },
      { id: 'student-2', displayName: 'Dos' },
    ];

    const classes = [
      { id: 'class-1', courseId: 'course-z', studentIds: ['student-1'] },
    ];

    const result = resolveEligibleStudentsForCourse({
      students,
      selectedCourseId: 'course-z',
      classes,
    });

    expect(result.isLegacyFallback).toBe(false);
    expect(result.eligibleStudents.map((student) => student.id)).toEqual(['student-1']);
  });
});
