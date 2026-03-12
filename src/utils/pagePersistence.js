// src/utils/pagePersistence.js
const PERSISTENCE_PREFIX = 'dlp:persistence';

const normalizePart = (value) => {
    const normalized = String(value || '').trim();
    return normalized.length > 0 ? normalized : null;
};

export const buildPersistenceKey = (...parts) => {
    const normalizedParts = parts.map(normalizePart).filter(Boolean);
    return [PERSISTENCE_PREFIX, ...normalizedParts].join(':');
};

export const buildUserScopedPersistenceKey = (scope, userOrId, key) => {
    const userId = typeof userOrId === 'string' ? userOrId : userOrId?.uid;
    return buildPersistenceKey(scope, userId || 'anonymous', key);
};

export const buildInstitutionScopedPersistenceKey = (scope, institutionId, key) => {
    return buildPersistenceKey(scope, institutionId || 'no-institution', key);
};