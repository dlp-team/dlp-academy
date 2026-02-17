// src/utils/stringUtils.js

/**
 * Checks if targetId is a descendant of possibleParentId in the folder tree.
 * Prevents circular dependencies.
 */
export const normalizeText = (text) => {
    return (text || '')
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};