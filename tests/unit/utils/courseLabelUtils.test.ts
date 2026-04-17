// tests/unit/utils/courseLabelUtils.test.js
import { describe, expect, it } from 'vitest';
import { getCourseDisplayLabel, getCourseDisplayLabelFromValues } from '../../../src/utils/courseLabelUtils';

describe('courseLabelUtils', () => {
  it('returns a fallback label when name and academic year are missing', () => {
    expect(getCourseDisplayLabelFromValues('', '')).toBe('Curso');
    expect(getCourseDisplayLabelFromValues(null, null)).toBe('Curso');
  });

  it('formats name with academic year when year is valid', () => {
    expect(getCourseDisplayLabelFromValues('1o Bachillerato', '2025-2026')).toBe('1o Bachillerato (2025-2026)');
  });

  it('returns only the name when academic year is invalid or missing', () => {
    expect(getCourseDisplayLabelFromValues('2o ESO', '2025/2026')).toBe('2o ESO');
    expect(getCourseDisplayLabelFromValues('2o ESO', '')).toBe('2o ESO');
  });

  it('formats object input using name and academicYear fields', () => {
    expect(getCourseDisplayLabel({ name: '1o ESO', academicYear: '2024-2025' })).toBe('1o ESO (2024-2025)');
  });

  it('uses academic year fallback label when name is missing but year is valid', () => {
    expect(getCourseDisplayLabelFromValues('   ', '2023-2024')).toBe('Curso (2023-2024)');
  });
});
