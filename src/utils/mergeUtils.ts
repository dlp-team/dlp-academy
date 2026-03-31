type MergeableItem = {
    id?: string | number | null;
    shortcutId?: string | number | null;
    [key: string]: any;
};

export const mergeSourceAndShortcutItems = ({
    sourceItems = [],
    shortcutItems = []
}: {
    sourceItems?: MergeableItem[];
    shortcutItems?: MergeableItem[];
} = {}): MergeableItem[] => {
    const merged: MergeableItem[] = [];
    const seen = new Set<string>();

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
