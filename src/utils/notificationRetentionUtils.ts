// src/utils/notificationRetentionUtils.ts
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RETENTION_DAYS = 90;

export const NOTIFICATION_RETENTION_DAYS_BY_TYPE: Record<string, number> = {
  assignment_new: 90,
  assignment_due_soon: 45,
  shortcut_move_request: 120,
  shortcut_move_request_approved: 120,
  shortcut_move_request_rejected: 120,
};

const normalizeType = (value: any) => String(value || '').trim().toLowerCase();

export const getNotificationRetentionDays = (type: any) => {
  const normalizedType = normalizeType(type);
  return NOTIFICATION_RETENTION_DAYS_BY_TYPE[normalizedType] || DEFAULT_RETENTION_DAYS;
};

export const getNotificationCreatedAtMs = (notification: any) => {
  const createdAt = notification?.createdAt;
  if (!createdAt) return null;

  if (typeof createdAt?.toMillis === 'function') {
    return createdAt.toMillis();
  }

  if (typeof createdAt?.toDate === 'function') {
    const dateValue = createdAt.toDate();
    return Number.isNaN(dateValue?.getTime?.()) ? null : dateValue.getTime();
  }

  const dateValue = new Date(createdAt);
  return Number.isNaN(dateValue.getTime()) ? null : dateValue.getTime();
};

export const isNotificationExpired = (notification: any, nowMs = Date.now()) => {
  const createdAtMs = getNotificationCreatedAtMs(notification);
  if (createdAtMs === null) return false;

  const retentionDays = getNotificationRetentionDays(notification?.type);
  const retentionMs = retentionDays * DAY_MS;
  return (nowMs - createdAtMs) > retentionMs;
};
