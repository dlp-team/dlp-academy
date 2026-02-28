export const mergeSourceAndShortcutItems = ({
    sourceItems = [],
    shortcutItems = [],
    getSourceKey,
    getShortcutKey
}) => {
    const merged = [];
    const seen = new Set();

    const resolveSourceKey = typeof getSourceKey === 'function'
        ? getSourceKey
        : (item) => `source:${item?.id || ''}`;

    const resolveShortcutKey = typeof getShortcutKey === 'function'
        ? getShortcutKey
        : (item) => `shortcut:${item?.shortcutId || item?.id || ''}`;

    (Array.isArray(sourceItems) ? sourceItems : []).forEach(item => {
        const key = resolveSourceKey(item);
        if (!key || seen.has(key)) return;
        seen.add(key);
        merged.push(item);
    });

    (Array.isArray(shortcutItems) ? shortcutItems : []).forEach(item => {
        const key = resolveShortcutKey(item);
        if (!key || seen.has(key)) return;
        seen.add(key);
        merged.push(item);
    });

    return merged;
};