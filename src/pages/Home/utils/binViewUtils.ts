// src/pages/Home/utils/binViewUtils.js
import {
    TRASH_RETENTION_DAYS,
    getTrashDaysRemaining,
    getTrashRemainingMs,
    toTrashTimestampMs,
} from '../../../utils/trashRetentionUtils';

export const DAYS_UNTIL_AUTO_DELETE = TRASH_RETENTION_DAYS;
export const DAY_MS = 24 * 60 * 60 * 1000;

export const toJsDate = (timestampLike: any) => {
    const asMillis = toTrashTimestampMs(timestampLike);
    if (!asMillis) return null;
    return new Date(asMillis);
};

export const getRemainingMs = (subject, now = new Date()) => {
    const nowMs = now instanceof Date ? now.getTime() : Date.now();
    return getTrashRemainingMs(subject?.trashedAt, nowMs);
};

export const getDaysRemaining = (subject: any) => {
    return getTrashDaysRemaining(subject?.trashedAt, Date.now());
};

export const getDaysRemainingTextClass = (daysRemaining: any) => {
    if (daysRemaining <= 1) return 'text-red-700 dark:text-red-400';
    if (daysRemaining <= 3) return 'text-orange-700 dark:text-orange-300';
    if (daysRemaining <= 7) return 'text-amber-700 dark:text-amber-300';
    return 'text-emerald-700 dark:text-emerald-300';
};
