// src/pages/Home/utils/homeBatchConfirmationUtils.ts
const DEFAULT_MAX_PREVIEW_NAMES = 5;

const FALLBACK_NAME_BY_TYPE: Record<string, string> = {
    subject: 'Asignatura sin nombre',
    folder: 'Carpeta sin nombre'
};

const getEntryType = (entry: any) => {
    const type = String(entry?.type || '').toLowerCase();
    return type === 'folder' ? 'folder' : 'subject';
};

export const getBatchEntryDisplayName = (entry: any) => {
    const directName = String(entry?.item?.name || '').trim();
    if (directName) return directName;

    const type = getEntryType(entry);
    return FALLBACK_NAME_BY_TYPE[type] || 'Elemento sin nombre';
};

export const buildBatchConfirmationPreview = (entries: any[] = [], maxNames = DEFAULT_MAX_PREVIEW_NAMES) => {
    const normalizedMaxNames = Number.isFinite(maxNames)
        ? Math.max(1, Math.floor(maxNames))
        : DEFAULT_MAX_PREVIEW_NAMES;

    const normalizedEntries = Array.isArray(entries) ? entries : [];
    const previewNames = normalizedEntries
        .map(getBatchEntryDisplayName)
        .filter((name: string) => Boolean(String(name || '').trim()));

    const totalCount = previewNames.length;

    return {
        totalCount,
        previewNames: previewNames.slice(0, normalizedMaxNames),
        overflowCount: Math.max(0, totalCount - normalizedMaxNames)
    };
};
