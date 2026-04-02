// src/pages/Home/utils/binViewUtils.js
import {
    TRASH_RETENTION_DAYS,
    getTrashDaysRemaining,
    getTrashRemainingMs,
    toTrashTimestampMs,
} from '../../../utils/trashRetentionUtils';

export const DAYS_UNTIL_AUTO_DELETE = TRASH_RETENTION_DAYS;
export const DAY_MS = 24 * 60 * 60 * 1000;

export const BIN_SORT_MODES = {
    URGENCY_ASC: 'urgency-asc',
    URGENCY_DESC: 'urgency-desc',
    ALPHA_ASC: 'alpha-asc',
    ALPHA_DESC: 'alpha-desc'
} as const;

export const DEFAULT_BIN_SORT_MODE = BIN_SORT_MODES.URGENCY_ASC;

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

const getSortableName = (item: any) => String(item?.name || '').trim().toLocaleLowerCase();

export const compareBinItems = (
    left: any,
    right: any,
    sortMode: any = DEFAULT_BIN_SORT_MODE,
    now = new Date()
) => {
    const leftName = getSortableName(left);
    const rightName = getSortableName(right);
    const leftRemainingMs = getRemainingMs(left, now);
    const rightRemainingMs = getRemainingMs(right, now);

    if (sortMode === BIN_SORT_MODES.ALPHA_ASC) {
        const nameOrder = leftName.localeCompare(rightName, 'es');
        if (nameOrder !== 0) return nameOrder;
        return leftRemainingMs - rightRemainingMs;
    }

    if (sortMode === BIN_SORT_MODES.ALPHA_DESC) {
        const nameOrder = rightName.localeCompare(leftName, 'es');
        if (nameOrder !== 0) return nameOrder;
        return leftRemainingMs - rightRemainingMs;
    }

    if (sortMode === BIN_SORT_MODES.URGENCY_DESC) {
        const urgencyOrder = rightRemainingMs - leftRemainingMs;
        if (urgencyOrder !== 0) return urgencyOrder;
        return leftName.localeCompare(rightName, 'es');
    }

    const urgencyOrder = leftRemainingMs - rightRemainingMs;
    if (urgencyOrder !== 0) return urgencyOrder;
    return leftName.localeCompare(rightName, 'es');
};

export const sortBinItems = (
    items: any[] = [],
    sortMode: any = DEFAULT_BIN_SORT_MODE,
    now = new Date()
) => {
    if (!Array.isArray(items) || items.length <= 1) return Array.isArray(items) ? [...items] : [];
    return [...items].sort((left, right) => compareBinItems(left, right, sortMode, now));
};
