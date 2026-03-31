// src/utils/stringUtils.ts

/**
 * Normalizes text by converting to lowercase, trimming whitespace,
 * and removing diacritics (accents). Useful for search matching.
 */
export const normalizeText = (text: string | null | undefined): string => {
    return (text || '')
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};