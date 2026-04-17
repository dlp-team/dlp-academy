// tests/unit/pages/institution-admin/academicYearUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  buildAcademicYearRange,
  getAcademicYearStartYear,
  getDefaultAcademicYear,
  isValidAcademicYear,
  normalizeAcademicYear,
} from '../../../../src/pages/InstitutionAdminDashboard/components/classes-courses/academicYearUtils';

describe('academicYearUtils', () => {
  it('resolves default academic year using July as cutoff month', () => {
    expect(getDefaultAcademicYear(new Date(2026, 5, 30))).toBe('2025-2026');
    expect(getDefaultAcademicYear(new Date(2026, 6, 1))).toBe('2026-2027');
  });

  it('validates consecutive YYYY-YYYY values only', () => {
    expect(isValidAcademicYear('2025-2026')).toBe(true);
    expect(isValidAcademicYear('2025-2027')).toBe(false);
    expect(isValidAcademicYear('25-2026')).toBe(false);
    expect(isValidAcademicYear('')).toBe(false);
  });

  it('normalizes and parses valid values', () => {
    expect(normalizeAcademicYear(' 2024-2025 ')).toBe('2024-2025');
    expect(normalizeAcademicYear('2024-2026')).toBe('');
    expect(getAcademicYearStartYear('2029-2030')).toBe(2029);
    expect(getAcademicYearStartYear('2030-2032')).toBeNull();
  });

  it('builds a -20/+10 selectable range around current academic year', () => {
    const range = buildAcademicYearRange({
      referenceDate: new Date(2026, 7, 10),
      minOffset: -20,
      maxOffset: 10,
    });

    expect(range).toHaveLength(31);
    expect(range[0]).toBe('2036-2037');
    expect(range[10]).toBe('2026-2027');
    expect(range[30]).toBe('2006-2007');
  });
});
