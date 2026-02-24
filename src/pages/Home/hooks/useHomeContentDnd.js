// src/pages/Home/hooks/useHomeContentDnd.js
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
    handleDragEnd
}) => {
    const [isPromoteZoneHovered, setIsPromoteZoneHovered] = useState(false);
    const [isRootZoneHovered, setIsRootZoneHovered] = useState(false);

    const handlePromoteZoneDragOver = (e) => {
        if (currentFolder && (draggedItemType === 'subject' || draggedItemType === 'folder')) {
            e.preventDefault();
            e.stopPropagation();
            setIsPromoteZoneHovered(true);
        }
    };

    const handlePromoteZoneDragLeave = (e) => {
        e.preventDefault();
        setIsPromoteZoneHovered(false);
    };

    const handlePromoteZoneDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPromoteZoneHovered(false);

        if (!currentFolder || !draggedItem) return;
        if (draggedItemType === 'subject') {
            handlePromoteSubject(draggedItem.id);
        } else if (draggedItemType === 'folder') {
            handlePromoteFolder(draggedItem.id);
        }
    };

    const handleRootZoneDrop = (e) => {
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
            if (subjectId) {
                draggedData = {
                    id: subjectId,
                    type: 'subject',
                    parentId: subjectParentId || undefined,
                    shortcutId: subjectShortcutId || undefined
                };
            }
            else if (folderId) draggedData = { id: folderId, type: 'folder', parentId: undefined };
        }
        console.log('[DND] handleRootZoneDrop:', { draggedData, currentFolder });

        if (!draggedData) return;

        const targetId = currentFolder ? currentFolder.id : null;
        if (draggedData.parentId === targetId) return;

        if (draggedData.type === 'subject') {
            let overlayShown = false;
            if (handleDropOnFolder) {
                console.log('[DND] handleDropOnFolder call from handleRootZoneDrop:', {
                    targetId,
                    draggedId: draggedData.id,
                    draggedParentId: draggedData.parentId,
                    draggedType: draggedData.type
                });
                const result = handleDropOnFolder(targetId, draggedData.id, draggedData.parentId, draggedData.shortcutId);
                if (result === true) overlayShown = true;
            }
            if (!overlayShown && !handleDropOnFolder && handleMoveSubjectWithSource) {
                handleMoveSubjectWithSource(draggedData.id, targetId, draggedData.parentId);
            }
        } else if (draggedData.type === 'folder' && handleNestFolder) {
            handleNestFolder(targetId, draggedData.id);
        }

        if (handleDragEnd) handleDragEnd();
    };

    const handleListDrop = (dragged, target) => {
        console.log('[DND] handleListDrop:', { dragged, target, currentFolder });
        if (target.type === 'folder') {
            if (dragged.id === target.id) return;
            if (dragged.type === 'subject') {
                let overlayShown = false;
                if (handleDropOnFolder) {
                    const sourceFolderId = dragged.folderId || dragged.parentId;
                    console.log('[DND] handleDropOnFolder call from handleListDrop:', {
                        targetId: target.id,
                        draggedId: dragged.id,
                        draggedParentId: dragged.parentId,
                        draggedFolderId: dragged.folderId,
                        sourceFolderId,
                        draggedType: dragged.type,
                        targetType: target.type
                    });
                    const result = handleDropOnFolder(target.id, dragged.id, sourceFolderId, dragged.shortcutId);
                    if (result === true) overlayShown = true;
                }
                if (!overlayShown && !handleDropOnFolder && handleMoveSubjectWithSource) {
                    const sourceFolderId = dragged.folderId || dragged.parentId;
                    handleMoveSubjectWithSource(dragged.id, target.id, sourceFolderId);
                }
            } else if (dragged.type === 'folder') {
                if (handleMoveFolderWithSource) handleMoveFolderWithSource(dragged.id, dragged.parentId, target.id);
                else handleNestFolder(target.id, dragged.id);
            }
        } else if (target.type === 'subject') {
            const targetParentId = target.parentId || (currentFolder ? currentFolder.id : null);
            if (dragged.type === 'subject') {
                if (dragged.parentId !== targetParentId) {
                    let overlayShown = false;
                    if (handleDropOnFolder) {
                        const sourceFolderId = dragged.folderId || dragged.parentId;
                        console.log('[DND] handleDropOnFolder call from handleListDrop (subject):', {
                            targetParentId,
                            draggedId: dragged.id,
                            draggedParentId: dragged.parentId,
                            draggedFolderId: dragged.folderId,
                            sourceFolderId,
                            draggedType: dragged.type,
                            targetType: target.type
                        });
                        const result = handleDropOnFolder(targetParentId, dragged.id, sourceFolderId, dragged.shortcutId);
                        if (result === true) overlayShown = true;
                    }
                    if (!overlayShown && !handleDropOnFolder && handleMoveSubjectWithSource) {
                        const sourceFolderId = dragged.folderId || dragged.parentId;
                        handleMoveSubjectWithSource(dragged.id, targetParentId, sourceFolderId);
                    }
                }
            } else if (dragged.type === 'folder') {
                if (handleMoveFolderWithSource) {
                    handleMoveFolderWithSource(dragged.id, dragged.parentId, targetParentId);
                } else if (handleNestFolder) {
                    handleNestFolder(targetParentId, dragged.id);
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
