// tests/unit/utils/notificationRetentionUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  getNotificationCreatedAtMs,
  getNotificationRetentionDays,
  isNotificationExpired,
} from '../../../src/utils/notificationRetentionUtils';

describe('notificationRetentionUtils', () => {
  it('returns type-specific retention days with default fallback', () => {
    expect(getNotificationRetentionDays('assignment_due_soon')).toBe(45);
    expect(getNotificationRetentionDays('shortcut_move_request')).toBe(120);
    expect(getNotificationRetentionDays('unknown_type')).toBe(90);
  });

  it('resolves Firestore timestamp-like values and date strings safely', () => {
    const fakeTimestamp = {
      toMillis: () => 1700000000000,
    };

    expect(getNotificationCreatedAtMs({ createdAt: fakeTimestamp })).toBe(1700000000000);
    expect(getNotificationCreatedAtMs({ createdAt: '2026-01-01T00:00:00.000Z' })).toBeTypeOf('number');
    expect(getNotificationCreatedAtMs({ createdAt: 'invalid-date' })).toBeNull();
  });

  it('detects expiration using notification type retention windows', () => {
    const nowMs = new Date('2026-04-04T00:00:00.000Z').getTime();

    const dueSoonExpired = {
      type: 'assignment_due_soon',
      createdAt: new Date('2026-02-01T00:00:00.000Z').toISOString(),
    };

    const dueSoonActive = {
      type: 'assignment_due_soon',
      createdAt: new Date('2026-03-25T00:00:00.000Z').toISOString(),
    };

    expect(isNotificationExpired(dueSoonExpired, nowMs)).toBe(true);
    expect(isNotificationExpired(dueSoonActive, nowMs)).toBe(false);
  });
});
