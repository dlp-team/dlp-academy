// src/pages/Home/components/binViewUtils.js
export const DAYS_UNTIL_AUTO_DELETE = 15;
export const DAY_MS = 24 * 60 * 60 * 1000;

export const toJsDate = (timestampLike) => {
    if (!timestampLike) return null;
    if (typeof timestampLike.toDate === 'function') return timestampLike.toDate();
    if (typeof timestampLike?.seconds === 'number') return new Date(timestampLike.seconds * 1000);
    return null;
};

export const getRemainingMs = (subject, now = new Date()) => {
    const trashedDate = toJsDate(subject?.trashedAt);
    if (!trashedDate) return DAYS_UNTIL_AUTO_DELETE * DAY_MS;
    const expiresAt = trashedDate.getTime() + (DAYS_UNTIL_AUTO_DELETE * DAY_MS);
    return expiresAt - now.getTime();
};

export const getDaysRemaining = (subject) => {
    const remaining = getRemainingMs(subject);
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / DAY_MS);
};

export const getDaysRemainingTextClass = (daysRemaining) => {
    if (daysRemaining <= 1) return 'text-red-700 dark:text-red-400';
    if (daysRemaining <= 3) return 'text-orange-700 dark:text-orange-300';
    if (daysRemaining <= 7) return 'text-amber-700 dark:text-amber-300';
    return 'text-emerald-700 dark:text-emerald-300';
};
