export const mergeSourceAndShortcutItems = ({ sourceItems = [], shortcutItems = [] } = {}) => {
    const merged = [];
    const seen = new Set();

    sourceItems.forEach(item => {
        const key = `source:${item?.id}`;
        if (!seen.has(key)) {
            seen.add(key);
            merged.push(item);
        }
    });

    shortcutItems.forEach(item => {
        const key = `shortcut:${item?.shortcutId || item?.id}`;
        if (!seen.has(key)) {
            seen.add(key);
            merged.push(item);
        }
    });

    return merged;
};
