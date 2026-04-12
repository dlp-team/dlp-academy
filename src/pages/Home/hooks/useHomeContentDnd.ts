// src/pages/Home/hooks/useHomeContentDnd.ts
import { useState } from 'react';

const useHomeContentDnd = ({
    currentFolder,
    draggedItem,
    draggedItemType,
    handlePromoteSubject,
    handlePromoteFolder,
    handleDropOnFolder,
    handleMoveSubjectWithSource,
    handleNestFolder,
    handleMoveFolderWithSource,
    handleDropReorderSubject,
    handleDragEnd,
    selectMode = false,
    selectedItemKeys = new Set(),
    onDropSelectedItems = null
}: any) => {
    const [isPromoteZoneHovered, setIsPromoteZoneHovered] = useState(false);
    const [isRootZoneHovered, setIsRootZoneHovered] = useState(false);

    const parseDraggedDropMeta = (subjectId, typeOrSourceFolderId, sourceFolderIdMaybe, shortcutIdMaybe) => {
        const isKnownType = typeOrSourceFolderId === 'subject' || typeOrSourceFolderId === 'folder';
        const draggedType = isKnownType ? typeOrSourceFolderId : 'subject';
        const draggedShortcutId = isKnownType ? shortcutIdMaybe : sourceFolderIdMaybe;

        return {
            draggedType,
            draggedKey: `${draggedType}:${draggedShortcutId || subjectId}`
        };
    };

    const handleSelectedEntriesDrop = (
        targetFolderId,
        subjectId,
        typeOrSourceFolderId,
        sourceFolderIdMaybe,
        shortcutIdMaybe
    ) => {
        if (!selectMode || !(selectedItemKeys instanceof Set) || selectedItemKeys.size === 0) {
            return false;
        }

        if (typeof onDropSelectedItems !== 'function') {
            return false;
        }

        const { draggedKey } = parseDraggedDropMeta(
            subjectId,
            typeOrSourceFolderId,
            sourceFolderIdMaybe,
            shortcutIdMaybe
        );

        if (!selectedItemKeys.has(draggedKey)) {
            return false;
        }

        onDropSelectedItems(targetFolderId || null);
        return true;
    };

    const handlePromoteZoneDragOver = (e: any) => {
        if (currentFolder && (draggedItemType === 'subject' || draggedItemType === 'folder')) {
            e.preventDefault();
            e.stopPropagation();
            setIsPromoteZoneHovered(true);
        }
    };

    const handlePromoteZoneDragLeave = (e: any) => {
        e.preventDefault();
        setIsPromoteZoneHovered(false);
    };

    const handlePromoteZoneDrop = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPromoteZoneHovered(false);

        if (!currentFolder || !draggedItem) return;
        if (draggedItemType === 'subject') {
            handlePromoteSubject(draggedItem.id, draggedItem.shortcutId || null);
        } else if (draggedItemType === 'folder') {
            handlePromoteFolder(draggedItem.id, draggedItem.shortcutId || null);
        }
    };

    const handleRootZoneDrop = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setIsRootZoneHovered(false);

        const treeDataString = e.dataTransfer.getData('treeItem');
        let draggedData;

        if (treeDataString) draggedData = JSON.parse(treeDataString);
        else {
            const subjectId = e.dataTransfer.getData('subjectId');
            const subjectShortcutId = e.dataTransfer.getData('subjectShortcutId');
            const subjectParentId = e.dataTransfer.getData('subjectParentId');
            const folderId = e.dataTransfer.getData('folderId');
            const folderShortcutId = e.dataTransfer.getData('folderShortcutId');
            if (subjectId) {
                draggedData = {
                    id: subjectId,
                    type: 'subject',
                    parentId: subjectParentId || undefined,
                    shortcutId: subjectShortcutId || undefined
                };
            }
            else if (folderId) draggedData = { id: folderId, type: 'folder', parentId: undefined, shortcutId: folderShortcutId || undefined };
        }
        if (!draggedData) return;

        const targetId = currentFolder ? currentFolder.id : null;
        if (draggedData.parentId === targetId) return;

        if (draggedData.type === 'subject') {
            const selectionHandled = handleSelectedEntriesDrop(
                targetId,
                draggedData.id,
                draggedData.type,
                draggedData.parentId,
                draggedData.shortcutId
            );
            if (selectionHandled) {
                if (handleDragEnd) handleDragEnd();
                return;
            }

            let overlayShown = false;
            if (handleDropOnFolder) {
                const result = handleDropOnFolder(targetId, draggedData.id, draggedData.parentId, draggedData.shortcutId);
                if (result === true) overlayShown = true;
            }
            if (!overlayShown && !handleDropOnFolder && handleMoveSubjectWithSource) {
                handleMoveSubjectWithSource(draggedData.id, targetId, draggedData.parentId);
            }
        } else if (draggedData.type === 'folder' && handleNestFolder) {
            const selectionHandled = handleSelectedEntriesDrop(
                targetId,
                draggedData.id,
                draggedData.type,
                draggedData.parentId,
                draggedData.shortcutId
            );
            if (selectionHandled) {
                if (handleDragEnd) handleDragEnd();
                return;
            }

            handleNestFolder(targetId, draggedData.id, draggedData.shortcutId || null);
        }

        if (handleDragEnd) handleDragEnd();
    };

    const handleListDrop = (dragged, target: any) => {
        if (target.type === 'folder') {
            if (dragged.id === target.id) return;
            if (dragged.type === 'subject') {
                const sourceFolderId = dragged.folderId || dragged.parentId;

                if (handleSelectedEntriesDrop(target.id, dragged.id, dragged.type, sourceFolderId, dragged.shortcutId)) {
                    if (handleDragEnd) handleDragEnd();
                    return;
                }

                let overlayShown = false;
                if (handleDropOnFolder) {
                    const result = handleDropOnFolder(target.id, dragged.id, sourceFolderId, dragged.shortcutId);
                    if (result === true) overlayShown = true;
                }
                if (!overlayShown && !handleDropOnFolder && handleMoveSubjectWithSource) {
                    handleMoveSubjectWithSource(dragged.id, target.id, sourceFolderId);
                }
            } else if (dragged.type === 'folder') {
                if (handleSelectedEntriesDrop(target.id, dragged.id, dragged.type, dragged.parentId, dragged.shortcutId)) {
                    if (handleDragEnd) handleDragEnd();
                    return;
                }

                if (dragged.shortcutId && handleNestFolder) {
                    handleNestFolder(target.id, dragged.id, dragged.shortcutId);
                    if (handleDragEnd) handleDragEnd();
                    return;
                }
                if (handleMoveFolderWithSource) handleMoveFolderWithSource(dragged.id, dragged.parentId, target.id);
                else handleNestFolder(target.id, dragged.id, dragged.shortcutId || null);
            }
        } else if (target.type === 'subject') {
            const targetParentId = target.parentId || (currentFolder ? currentFolder.id : null);
            if (dragged.type === 'subject') {
                if (
                    dragged.parentId === targetParentId &&
                    typeof dragged.index === 'number' &&
                    typeof target.index === 'number' &&
                    handleDropReorderSubject
                ) {
                    handleDropReorderSubject(dragged.shortcutId || dragged.id, dragged.index, target.index);
                    if (handleDragEnd) handleDragEnd();
                    return;
                }
                if (dragged.parentId !== targetParentId) {
                    const sourceFolderId = dragged.folderId || dragged.parentId;

                    if (handleSelectedEntriesDrop(targetParentId, dragged.id, dragged.type, sourceFolderId, dragged.shortcutId)) {
                        if (handleDragEnd) handleDragEnd();
                        return;
                    }

                    let overlayShown = false;
                    if (handleDropOnFolder) {
                        const result = handleDropOnFolder(targetParentId, dragged.id, sourceFolderId, dragged.shortcutId);
                        if (result === true) overlayShown = true;
                    }
                    if (!overlayShown && !handleDropOnFolder && handleMoveSubjectWithSource) {
                        handleMoveSubjectWithSource(dragged.id, targetParentId, sourceFolderId);
                    }
                }
            } else if (dragged.type === 'folder') {
                if (handleSelectedEntriesDrop(targetParentId, dragged.id, dragged.type, dragged.parentId, dragged.shortcutId)) {
                    if (handleDragEnd) handleDragEnd();
                    return;
                }

                if (dragged.shortcutId && handleNestFolder) {
                    handleNestFolder(targetParentId, dragged.id, dragged.shortcutId);
                    if (handleDragEnd) handleDragEnd();
                    return;
                }
                if (handleMoveFolderWithSource) {
                    handleMoveFolderWithSource(dragged.id, dragged.parentId, targetParentId);
                } else if (handleNestFolder) {
                    handleNestFolder(targetParentId, dragged.id, dragged.shortcutId || null);
                }
            }
        }

        if (handleDragEnd) handleDragEnd();
    };

    return {
        isPromoteZoneHovered,
        isRootZoneHovered,
        setIsRootZoneHovered,
        handlePromoteZoneDragOver,
        handlePromoteZoneDragLeave,
        handlePromoteZoneDrop,
        handleRootZoneDrop,
        handleListDrop
    };
};

export default useHomeContentDnd;
