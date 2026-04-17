// tests/unit/utils/academicYearLifecycleUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  getCurrentAcademicYear,
  isSubjectCurrentAcademicYear,
  isSubjectEndedAcademicYear,
  getEndedSubjectBadge,
  getSubjectPassedState,
} from '../../../src/utils/academicYearLifecycleUtils';

describe('academicYearLifecycleUtils', () => {
  it('resolves current academic year using the Jul-Dec / Jan-Jun rule', () => {
    expect(getCurrentAcademicYear(new Date('2026-08-01T00:00:00Z'))).toBe('2026-2027');
    expect(getCurrentAcademicYear(new Date('2026-02-01T00:00:00Z'))).toBe('2025-2026');
  });

  it('classifies subjects as current/ended by academic year with legacy fallback', () => {
    const referenceDate = new Date('2026-08-01T00:00:00Z');

    expect(isSubjectCurrentAcademicYear('2026-2027', referenceDate)).toBe(true);
    expect(isSubjectEndedAcademicYear('2025-2026', referenceDate)).toBe(true);

    expect(isSubjectCurrentAcademicYear('', referenceDate)).toBe(true);
    expect(isSubjectEndedAcademicYear('', referenceDate)).toBe(false);
  });

  it('builds teacher ended badge with yellow tone', () => {
    const badge = getEndedSubjectBadge({
      user: { role: 'teacher' },
      subject: { academicYear: '2025-2026' },
      referenceDate: new Date('2026-08-01T00:00:00Z'),
    });

    expect(badge).not.toBeNull();
    expect(badge.label).toBe('Finalizada');
    expect(badge.className.includes('amber')).toBe(true);
  });

  it('builds student ended badge with red-green grading scale', () => {
    const referenceDate = new Date('2026-08-01T00:00:00Z');

    const highScoreBadge = getEndedSubjectBadge({
      user: { role: 'student' },
      subject: { academicYear: '2025-2026', finalGrade: 9.2 },
      referenceDate,
    });

    const lowScoreBadge = getEndedSubjectBadge({
      user: { role: 'student' },
      subject: { academicYear: '2025-2026', finalGrade: 2.1 },
      referenceDate,
    });

    expect(highScoreBadge.label).toBe('Finalizada · 92%');
    expect(highScoreBadge.className.includes('emerald')).toBe(true);

    expect(lowScoreBadge.label).toBe('Finalizada · 21%');
    expect(lowScoreBadge.className.includes('rose')).toBe(true);
  });

  it('infers passed state from score when explicit flags are missing', () => {
    expect(getSubjectPassedState({ finalGrade: 5.5 })).toBe(true);
    expect(getSubjectPassedState({ finalGrade: 4.9 })).toBe(false);
  });
});
