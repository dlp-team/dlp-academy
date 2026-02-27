export const buildDragPayload = ({
    id,
    type,
    parentId = null,
    shortcutId = null,
    index = null
}) => ({
    id,
    type,
    parentId,
    shortcutId,
    index
});

export const writeDragPayloadToDataTransfer = (dataTransfer, payload) => {
    if (!dataTransfer || !payload?.id || !payload?.type) return;

    dataTransfer.setData('treeItem', JSON.stringify(payload));

    if (payload.type === 'subject') {
        dataTransfer.setData('subjectId', payload.id);
        dataTransfer.setData('subjectParentId', payload.parentId || '');
        dataTransfer.setData('subjectShortcutId', payload.shortcutId || '');
    }

    if (payload.type === 'folder') {
        dataTransfer.setData('folderId', payload.id);
        dataTransfer.setData('folderShortcutId', payload.shortcutId || '');
    }
};

export const readDragPayloadFromDataTransfer = (dataTransfer) => {
    if (!dataTransfer) return null;

    const treeDataString = dataTransfer.getData('treeItem');
    if (treeDataString) {
        try {
            return JSON.parse(treeDataString);
        } catch {
            return null;
        }
    }

    const subjectId = dataTransfer.getData('subjectId');
    const subjectShortcutId = dataTransfer.getData('subjectShortcutId');
    const subjectParentId = dataTransfer.getData('subjectParentId');
    if (subjectId) {
        return buildDragPayload({
            id: subjectId,
            type: 'subject',
            parentId: subjectParentId || null,
            shortcutId: subjectShortcutId || null
        });
    }

    const folderId = dataTransfer.getData('folderId');
    const folderShortcutId = dataTransfer.getData('folderShortcutId');
    if (folderId) {
        return buildDragPayload({
            id: folderId,
            type: 'folder',
            shortcutId: folderShortcutId || null
        });
    }

    return null;
};
