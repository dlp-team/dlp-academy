// tests/unit/utils/badgeUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  ACADEMIC_EXCELLENCE_BADGE_KEY,
  buildAcademicExcellenceBadge,
  buildManualBadge,
  getAcademicExcellenceLevel,
  getActiveCourseBadges,
  normalizeBadgesByCourse,
  normalizeCourseKey,
  upsertCourseBadge,
} from '../../../src/utils/badgeUtils';

describe('badgeUtils', () => {
  it('normalizes course keys and badges maps safely', () => {
    expect(normalizeCourseKey('  1A  ')).toBe('1A');
    expect(normalizeCourseKey('')).toBe('general');

    const normalized = normalizeBadgesByCourse({
      ' 2B ': [{ key: 'participacion' }],
      empty: null,
    });

    expect(normalized).toEqual({
      '2B': [{ key: 'participacion' }],
      empty: [],
    });
  });

  it('resolves academic excellence levels from average on 10-point scale', () => {
    expect(getAcademicExcellenceLevel(8.49)).toBeNull();
    expect(getAcademicExcellenceLevel(8.5)).toBe(1);
    expect(getAcademicExcellenceLevel(9.0)).toBe(2);
    expect(getAcademicExcellenceLevel(9.5)).toBe(3);
  });

  it('inserts manual badges once per course and ignores duplicates', () => {
    const manualBadge = buildManualBadge({ badgeKey: 'participacion', awardedBy: 'teacher-1' });

    const firstInsert = upsertCourseBadge({
      badgesByCourse: {},
      courseId: '1A',
      badge: manualBadge,
    });

    expect(firstInsert.changed).toBe(true);
    expect(getActiveCourseBadges(firstInsert.badgesByCourse, '1A')).toHaveLength(1);

    const duplicateInsert = upsertCourseBadge({
      badgesByCourse: firstInsert.badgesByCourse,
      courseId: '1A',
      badge: manualBadge,
    });

    expect(duplicateInsert.changed).toBe(false);
    expect(getActiveCourseBadges(duplicateInsert.badgesByCourse, '1A')).toHaveLength(1);
  });

  it('upgrades academic excellence badge level and average when better result arrives', () => {
    const level1 = buildAcademicExcellenceBadge({
      averageTenScale: 8.5,
      level: 1,
      awardedBy: 'system',
    });

    const initialInsert = upsertCourseBadge({
      badgesByCourse: {},
      courseId: 'general',
      badge: level1,
    });

    const level3 = buildAcademicExcellenceBadge({
      averageTenScale: 9.6,
      level: 3,
      awardedBy: 'system',
    });

    const upgraded = upsertCourseBadge({
      badgesByCourse: initialInsert.badgesByCourse,
      courseId: 'general',
      badge: level3,
    });

    expect(upgraded.changed).toBe(true);
    const [finalBadge] = getActiveCourseBadges(upgraded.badgesByCourse, 'general');

    expect(finalBadge.key).toBe(ACADEMIC_EXCELLENCE_BADGE_KEY);
    expect(finalBadge.level).toBe(3);
    expect(finalBadge.averageTenScale).toBe(9.6);
  });
});
