// src/utils/pagePersistence.js
const PERSISTENCE_PREFIX = 'dlp:persistence';

const normalizePart = (value: any): string | null => {
    const normalized = String(value || '').trim();
    return normalized.length > 0 ? normalized : null;
};

export const buildPersistenceKey = (...parts: any[]): string => {
    const normalizedParts = parts.map(normalizePart).filter(Boolean);
    return [PERSISTENCE_PREFIX, ...normalizedParts].join(':');
};

export const buildUserScopedPersistenceKey = (scope: string, userOrId: any, key?: string): string => {
    const userId = typeof userOrId === 'string' ? userOrId : userOrId?.uid;
    return buildPersistenceKey(scope, userId || 'anonymous', key);
};

export const buildInstitutionScopedPersistenceKey = (scope: string, institutionId: string | null | undefined, key?: string): string => {
    return buildPersistenceKey(scope, institutionId || 'no-institution', key);
};