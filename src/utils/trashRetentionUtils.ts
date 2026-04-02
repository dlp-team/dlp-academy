// src/utils/trashRetentionUtils.ts

export const TRASH_RETENTION_DAYS = 15;
export const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export const toTrashTimestampMs = (value: any) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.getTime();
  }

  if (typeof value?.toDate === 'function') {
    const asDate = value.toDate();
    return asDate instanceof Date && !Number.isNaN(asDate.getTime()) ? asDate.getTime() : null;
  }

  if (typeof value?.seconds === 'number') {
    return value.seconds * 1000;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

export const getTrashRemainingMs = (trashedAt: any, nowMs = Date.now()) => {
  const trashedAtMs = toTrashTimestampMs(trashedAt);
  if (!trashedAtMs) return TRASH_RETENTION_MS;

  const expiresAtMs = trashedAtMs + TRASH_RETENTION_MS;
  return expiresAtMs - nowMs;
};

export const getTrashDaysRemaining = (trashedAt: any, nowMs = Date.now()) => {
  const remainingMs = getTrashRemainingMs(trashedAt, nowMs);
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
};

export const isTrashRetentionExpired = (trashedAt: any, nowMs = Date.now()) => {
  const trashedAtMs = toTrashTimestampMs(trashedAt);
  if (!trashedAtMs) return false;
  return nowMs - trashedAtMs >= TRASH_RETENTION_MS;
};
