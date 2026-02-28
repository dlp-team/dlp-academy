export const buildDragPayload = ({
    id,
    type,
    parentId = null,
    shortcutId = null,
    index = null,
    position = null
}) => ({
    id,
    type,
    parentId,
    shortcutId,
    index,
    position
});

export const writeDragPayloadToDataTransfer = (dataTransfer, payload) => {
    if (!dataTransfer || !payload?.id || !payload?.type) return;

    dataTransfer.setData('treeItem', JSON.stringify(payload));
    dataTransfer.setData('type', payload.type);

    if (payload.position !== null && payload.position !== undefined) {
        dataTransfer.setData('position', String(payload.position));
    }

    if (payload.type === 'subject') {
        dataTransfer.setData('subjectId', payload.id);
        dataTransfer.setData('subjectType', 'subject');
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

    const positionRaw = dataTransfer.getData('position');
    const hasPosition = positionRaw !== '';
    const parsedPosition = hasPosition ? Number.parseInt(positionRaw, 10) : null;
    const position = Number.isNaN(parsedPosition) ? null : parsedPosition;

    const treeDataString = dataTransfer.getData('treeItem');
    if (treeDataString) {
        try {
            const parsed = JSON.parse(treeDataString);
            return {
                ...parsed,
                position: parsed?.position ?? position
            };
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
            shortcutId: subjectShortcutId || null,
            position
        });
    }

    const folderId = dataTransfer.getData('folderId');
    const folderShortcutId = dataTransfer.getData('folderShortcutId');
    if (folderId) {
        return buildDragPayload({
            id: folderId,
            type: 'folder',
            shortcutId: folderShortcutId || null,
            position
        });
    }

    return null;
};
