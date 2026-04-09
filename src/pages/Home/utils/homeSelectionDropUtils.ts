// src/pages/Home/utils/homeSelectionDropUtils.ts

type DropSelectionArgs = {
    subjectId?: any;
    subjectShortcutId?: any;
    folderId?: any;
    folderShortcutId?: any;
};

export const getDraggedSelectionKeyFromDropArgs = ({
    subjectId,
    subjectShortcutId,
    folderId,
    folderShortcutId,
}: DropSelectionArgs = {}) => {
    const normalizedSubjectId = String(subjectId || '').trim();
    if (normalizedSubjectId) {
        const normalizedShortcutId = String(subjectShortcutId || '').trim();
        return `subject:${normalizedShortcutId || normalizedSubjectId}`;
    }

    const normalizedFolderId = String(folderId || '').trim();
    if (normalizedFolderId) {
        const normalizedShortcutId = String(folderShortcutId || '').trim();
        return `folder:${normalizedShortcutId || normalizedFolderId}`;
    }

    return null;
};

export const getDraggedSelectionKeyFromDropEvent = (event: any) => {
    const dataTransfer = event?.dataTransfer;
    if (!dataTransfer || typeof dataTransfer.getData !== 'function') {
        return null;
    }

    return getDraggedSelectionKeyFromDropArgs({
        subjectId: dataTransfer.getData('subjectId'),
        subjectShortcutId: dataTransfer.getData('subjectShortcutId'),
        folderId: dataTransfer.getData('folderId'),
        folderShortcutId: dataTransfer.getData('folderShortcutId'),
    });
};

export const shouldHandleSelectionDrop = ({
    selectMode,
    selectedItemKeys,
    draggedSelectionKey,
}: {
    selectMode: any;
    selectedItemKeys: any;
    draggedSelectionKey: any;
}) => (
    Boolean(
        selectMode === true
        && selectedItemKeys instanceof Set
        && typeof draggedSelectionKey === 'string'
        && selectedItemKeys.has(draggedSelectionKey)
    )
);
