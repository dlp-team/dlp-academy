import { describe, it, expect } from 'vitest';
import {
  DAYS_UNTIL_AUTO_DELETE,
  DAY_MS,
  toJsDate,
  getRemainingMs,
  getDaysRemaining,
  getDaysRemainingTextClass,
} from '../../../../src/pages/Home/components/binViewUtils';

describe('binViewUtils', () => {
  it('toJsDate converts firestore timestamp-like objects', () => {
    const date = new Date('2026-03-01T00:00:00.000Z');
    const withToDate = { toDate: () => date };
    const withSeconds = { seconds: 1767225600 };

    expect(toJsDate(withToDate)).toEqual(date);
    expect(toJsDate(withSeconds)).toBeInstanceOf(Date);
    expect(toJsDate(null)).toBeNull();
  });

  it('getRemainingMs computes expiration window using 15 days', () => {
    const now = new Date('2026-03-06T00:00:00.000Z');
    const trashedAt = new Date(now.getTime() - (3 * DAY_MS));
    const subject = { trashedAt: { toDate: () => trashedAt } };

    const remainingMs = getRemainingMs(subject, now);
    expect(remainingMs).toBe((DAYS_UNTIL_AUTO_DELETE - 3) * DAY_MS);
  });

  it('getDaysRemaining rounds up and clamps to zero', () => {
    const now = Date.now();
    const almostOneDayLeft = new Date(now - ((DAYS_UNTIL_AUTO_DELETE - 1) * DAY_MS) - (23 * 60 * 60 * 1000));
    const expired = new Date(now - ((DAYS_UNTIL_AUTO_DELETE + 1) * DAY_MS));

    expect(getDaysRemaining({ trashedAt: { toDate: () => almostOneDayLeft } })).toBeGreaterThanOrEqual(1);
    expect(getDaysRemaining({ trashedAt: { toDate: () => expired } })).toBe(0);
  });

  it('getDaysRemainingTextClass returns urgency classes', () => {
    expect(getDaysRemainingTextClass(1)).toContain('text-red-700');
    expect(getDaysRemainingTextClass(3)).toContain('text-orange-700');
    expect(getDaysRemainingTextClass(7)).toContain('text-amber-700');
    expect(getDaysRemainingTextClass(10)).toContain('text-emerald-700');
  });
});
