// tests/unit/utils/trashRetentionUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  TRASH_RETENTION_DAYS,
  TRASH_RETENTION_MS,
  toTrashTimestampMs,
  getTrashRemainingMs,
  getTrashDaysRemaining,
  isTrashRetentionExpired,
} from '../../../src/utils/trashRetentionUtils';

describe('trashRetentionUtils', () => {
  it('normalizes common timestamp shapes to milliseconds', () => {
    const baseDate = new Date('2026-04-01T00:00:00.000Z');
    const secondsBased = { seconds: Math.floor(baseDate.getTime() / 1000) };
    const toDateBased = { toDate: () => baseDate };

    expect(toTrashTimestampMs(baseDate)).toBe(baseDate.getTime());
    expect(toTrashTimestampMs(secondsBased)).toBe(secondsBased.seconds * 1000);
    expect(toTrashTimestampMs(toDateBased)).toBe(baseDate.getTime());
    expect(toTrashTimestampMs('2026-04-01T00:00:00.000Z')).toBe(baseDate.getTime());
    expect(toTrashTimestampMs('invalid-date')).toBeNull();
  });

  it('computes remaining ms and day buckets with retention defaults', () => {
    const nowMs = new Date('2026-04-16T00:00:00.000Z').getTime();
    const trashedAtMs = new Date('2026-04-10T00:00:00.000Z').getTime();

    expect(getTrashRemainingMs({ seconds: trashedAtMs / 1000 }, nowMs)).toBe(9 * 24 * 60 * 60 * 1000);
    expect(getTrashDaysRemaining({ seconds: trashedAtMs / 1000 }, nowMs)).toBe(9);
    expect(getTrashRemainingMs(null, nowMs)).toBe(TRASH_RETENTION_MS);
    expect(TRASH_RETENTION_DAYS).toBe(15);
  });

  it('detects expiration after retention window', () => {
    const nowMs = new Date('2026-04-20T00:00:00.000Z').getTime();
    const expiredAt = new Date('2026-04-01T00:00:00.000Z').getTime();
    const activeAt = new Date('2026-04-12T00:00:00.000Z').getTime();

    expect(isTrashRetentionExpired({ seconds: expiredAt / 1000 }, nowMs)).toBe(true);
    expect(isTrashRetentionExpired({ seconds: activeAt / 1000 }, nowMs)).toBe(false);
  });
});
