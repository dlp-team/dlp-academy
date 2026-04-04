// tests/unit/utils/coursePeriodScheduleUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  buildDefaultCoursePeriodSchedule,
  normalizeCoursePeriodSchedule,
} from '../../../src/utils/coursePeriodScheduleUtils';

describe('coursePeriodScheduleUtils', () => {
  it('normalizes a valid trimester schedule and preserves chronological periods', () => {
    const normalized = normalizeCoursePeriodSchedule({
      periodMode: 'trimester',
      coursePeriodSchedule: {
        periodType: 'trimester',
        periods: [
          { periodIndex: 1, periodLabel: 'Trimestre 1', periodStartAt: '2025-09-01', periodEndAt: '2025-11-30' },
          { periodIndex: 2, periodLabel: 'Trimestre 2', periodStartAt: '2025-12-01', periodEndAt: '2026-03-15' },
          { periodIndex: 3, periodLabel: 'Trimestre 3', periodStartAt: '2026-03-16', periodEndAt: '2026-06-30' },
        ],
        extraordinaryEndDate: '2026-07-15',
      },
    });

    expect(normalized).toMatchObject({
      periodType: 'trimester',
      extraordinaryEndDate: '2026-07-15',
    });
    expect(normalized.periods).toHaveLength(3);
    expect(normalized.periods[0]).toMatchObject({ periodIndex: 1, periodStartAt: '2025-09-01' });
  });

  it('rejects schedules with overlapping ranges', () => {
    const normalized = normalizeCoursePeriodSchedule({
      periodMode: 'trimester',
      coursePeriodSchedule: {
        periodType: 'trimester',
        periods: [
          { periodIndex: 1, periodStartAt: '2025-09-01', periodEndAt: '2025-11-30' },
          { periodIndex: 2, periodStartAt: '2025-11-15', periodEndAt: '2026-03-15' },
          { periodIndex: 3, periodStartAt: '2026-03-16', periodEndAt: '2026-06-30' },
        ],
      },
    });

    expect(normalized).toBeNull();
  });

  it('builds default schedule rows from academic-year calendar settings', () => {
    const defaults = buildDefaultCoursePeriodSchedule({
      academicYear: '2025-2026',
      periodMode: 'cuatrimester',
      academicCalendar: {
        startDate: '2025-09-01',
        ordinaryEndDate: '2026-06-30',
        extraordinaryEndDate: '2026-07-15',
      },
    });

    expect(defaults.periodType).toBe('cuatrimester');
    expect(defaults.periods).toHaveLength(2);
    expect(defaults.periods[0].periodStartAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(defaults.periods[1].periodEndAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(defaults.extraordinaryEndDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
