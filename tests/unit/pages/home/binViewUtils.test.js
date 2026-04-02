import { describe, it, expect } from 'vitest';
import {
  BIN_SORT_MODES,
  DEFAULT_BIN_SORT_MODE,
  DAYS_UNTIL_AUTO_DELETE,
  DAY_MS,
  toJsDate,
  getRemainingMs,
  getDaysRemaining,
  getDaysRemainingTextClass,
  sortBinItems,
} from '../../../../src/pages/Home/utils/binViewUtils';

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

  it('sortBinItems defaults to urgency ascending', () => {
    const now = new Date('2026-03-10T00:00:00.000Z');
    const items = [
      { id: 'a', name: 'Historia', trashedAt: { toDate: () => new Date(now.getTime() - (1 * DAY_MS)) } },
      { id: 'b', name: 'Algebra', trashedAt: { toDate: () => new Date(now.getTime() - (12 * DAY_MS)) } },
      { id: 'c', name: 'Biologia', trashedAt: { toDate: () => new Date(now.getTime() - (6 * DAY_MS)) } },
    ];

    const sorted = sortBinItems(items, DEFAULT_BIN_SORT_MODE, now);
    expect(sorted.map(item => item.id)).toEqual(['b', 'c', 'a']);
  });

  it('sortBinItems supports urgency descending', () => {
    const now = new Date('2026-03-10T00:00:00.000Z');
    const items = [
      { id: 'a', name: 'Historia', trashedAt: { toDate: () => new Date(now.getTime() - (1 * DAY_MS)) } },
      { id: 'b', name: 'Algebra', trashedAt: { toDate: () => new Date(now.getTime() - (12 * DAY_MS)) } },
      { id: 'c', name: 'Biologia', trashedAt: { toDate: () => new Date(now.getTime() - (6 * DAY_MS)) } },
    ];

    const sorted = sortBinItems(items, BIN_SORT_MODES.URGENCY_DESC, now);
    expect(sorted.map(item => item.id)).toEqual(['a', 'c', 'b']);
  });

  it('sortBinItems supports alphabetical sort modes', () => {
    const items = [
      { id: 'a', name: 'Historia', trashedAt: { toDate: () => new Date('2026-03-09T00:00:00.000Z') } },
      { id: 'b', name: 'Algebra', trashedAt: { toDate: () => new Date('2026-03-02T00:00:00.000Z') } },
      { id: 'c', name: 'Biologia', trashedAt: { toDate: () => new Date('2026-03-08T00:00:00.000Z') } },
    ];

    const asc = sortBinItems(items, BIN_SORT_MODES.ALPHA_ASC);
    const desc = sortBinItems(items, BIN_SORT_MODES.ALPHA_DESC);

    expect(asc.map(item => item.id)).toEqual(['b', 'c', 'a']);
    expect(desc.map(item => item.id)).toEqual(['a', 'c', 'b']);
  });
});
