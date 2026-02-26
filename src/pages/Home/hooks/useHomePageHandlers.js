// src/pages/Home/hooks/useHomePageHandlers.js
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { isInvalidFolderMove } from '../../../utils/folderUtils';
import { canEdit } from '../../../utils/permissionUtils';

export const useHomePageHandlers = ({
    logic,
    currentUserId,
    updateFolder,
    moveSubjectToParent,
    moveFolderToParent,
    moveSubjectBetweenFolders,
    setShareConfirm,
    setUnshareConfirm,
    setTopicsModalConfig,
    setFolderContentsModalConfig
}) => {
    const closeUnshareConfirm = () => {
        setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null, onPreserveConfirm: null });
    };

    const isViewerInsideSharedFolder = Boolean(
        logic?.currentFolder?.isShared === true &&
        currentUserId &&
        !canEdit(logic.currentFolder, currentUserId)
    );

    const canWriteIntoTargetFolder = (targetFolderId) => {
        if (!targetFolderId) return true;
        const targetFolder = (logic.folders || []).find(f => f.id === targetFolderId);
        if (!targetFolder) return true;
        if (targetFolder.isShared !== true) return true;
        if (!currentUserId) return false;
        return canEdit(targetFolder, currentUserId);
    };

    const resolveFolderShortcutId = (folderId, sourceParentId = null) => {
        if (!folderId || !Array.isArray(logic?.shortcuts)) return null;

        const exactMatch = (logic.shortcuts || []).find(
            s =>
                s.targetType === 'folder' &&
                s.targetId === folderId &&
                (s.parentId || null) === (sourceParentId || null)
        );
        if (exactMatch?.id) return exactMatch.id;

        const fallback = (logic.shortcuts || []).find(
            s => s.targetType === 'folder' && s.targetId === folderId
        );
        return fallback?.id || null;
    };

    const handleSaveFolderWrapper = folderData => {
        const dataWithParent = { ...folderData, parentId: logic.currentFolder ? logic.currentFolder.id : null };
        logic.handleSaveFolder(dataWithParent);
    };

    const handleUpwardDrop = async e => {
        if (isViewerInsideSharedFolder) return;
        e.preventDefault();
        e.stopPropagation();
        const subjectId = e.dataTransfer.getData('subjectId');
        const subjectShortcutId = e.dataTransfer.getData('subjectShortcutId');
        const folderId = e.dataTransfer.getData('folderId');
        let folderShortcutId = e.dataTransfer.getData('folderShortcutId');
        if (logic.currentFolder) {
            const currentId = logic.currentFolder.id;
            const parentId = logic.currentFolder.parentId;
            if (subjectId) {
                if (subjectShortcutId && logic?.moveShortcut) {
                    await logic.moveShortcut(subjectShortcutId, parentId || null);
                } else {
                    await moveSubjectToParent(subjectId, currentId, parentId);
                }
            } else if (folderShortcutId && logic?.moveShortcut) {
                await logic.moveShortcut(folderShortcutId, parentId || null);
            } else if (folderId && folderId !== currentId) {
                folderShortcutId = folderShortcutId || resolveFolderShortcutId(folderId, currentId || null);
                if (folderShortcutId && logic?.moveShortcut) {
                    await logic.moveShortcut(folderShortcutId, parentId || null);
                    return;
                }
                await moveFolderToParent(folderId, currentId, parentId);
            }
        }
    };

    const handleDropOnFolderWrapper = (targetFolderId, subjectId, typeOrSourceFolderId, sourceFolderIdMaybe, shortcutIdMaybe) => {
        if (isViewerInsideSharedFolder) {
            return true;
        }

        if (!canWriteIntoTargetFolder(targetFolderId)) {
            return true;
        }

        const isKnownType = typeOrSourceFolderId === 'subject' || typeOrSourceFolderId === 'folder';
        const type = isKnownType ? typeOrSourceFolderId : 'subject';
        const explicitSourceFolderId = isKnownType ? sourceFolderIdMaybe : typeOrSourceFolderId;
        let draggedShortcutId = isKnownType ? shortcutIdMaybe : sourceFolderIdMaybe;

        if (type === 'folder') {
            const sourceParentId = explicitSourceFolderId !== undefined ? explicitSourceFolderId : (logic.currentFolder ? logic.currentFolder.id : null);
            draggedShortcutId = draggedShortcutId || resolveFolderShortcutId(subjectId, sourceParentId || null);
            handleNestFolder(targetFolderId, subjectId, draggedShortcutId || null);
            return true;
        }

        const subject = (logic.subjects || []).find(s => s.id === subjectId);
        const currentFolderId =
            explicitSourceFolderId !== undefined && explicitSourceFolderId !== null
                ? explicitSourceFolderId
                : subject?.folderId || (logic.currentFolder ? logic.currentFolder.id : null);


        if (targetFolderId === currentFolderId) {
            return;
        }
        const targetFolder = (logic.folders || []).find(f => f.id === targetFolderId);
        const sourceFolder = (logic.folders || []).find(f => f.id === currentFolderId);
        const userId = currentUserId;

        if (!draggedShortcutId && logic?.shortcuts) {
            const inferredShortcut = (logic.shortcuts || []).find(
                s =>
                    s.targetType === 'subject' &&
                    s.targetId === subjectId &&
                    (s.parentId || null) === (currentFolderId || null)
            );
            draggedShortcutId = inferredShortcut?.id || null;
        }

        if (draggedShortcutId && logic?.moveShortcut) {
            logic.moveShortcut(draggedShortcutId, targetFolderId || null);
            return true;
        }

        if (subject) {
            const userCanEdit = userId ? canEdit(subject, userId) : false;
            if (!userCanEdit) {
                return true;
            }
        }

        const getSharedUids = item => (item && Array.isArray(item.sharedWithUids) ? item.sharedWithUids : []);

        const subjectSharedWithUids = getSharedUids(subject);
        const sourceFolderSharedWithUids = getSharedUids(sourceFolder);
        const targetFolderSharedWithUids = getSharedUids(targetFolder);
        const baselineSharedWithUids = sourceFolder ? sourceFolderSharedWithUids : subjectSharedWithUids;
        const removedUsers = baselineSharedWithUids.filter(uid => !targetFolderSharedWithUids.includes(uid));

        if (removedUsers.length > 0) {
            setUnshareConfirm({
                open: true,
                subjectId,
                folder: sourceFolder,
                onConfirm: async () => {
                    await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
                    closeUnshareConfirm();
                },
                onPreserveConfirm: async () => {
                    await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId, { preserveSharing: true });
                    closeUnshareConfirm();
                },
            });
            return true;
        }

        if (targetFolder && targetFolder.isShared) {
            const subjectShared = new Set(baselineSharedWithUids);
            const folderShared = targetFolderSharedWithUids;
            const newUsers = folderShared.filter(uid => !subjectShared.has(uid));
            if (newUsers.length > 0) {
                setShareConfirm({
                    open: true,
                    subjectId,
                    folder: targetFolder,
                    onConfirm: async () => {
                        await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
                        setShareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                    }
                });
                return true;
            }
        }
        
        moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
        return true;
    };

    const handleBreadcrumbDrop = (targetFolderId, subjectId, droppedFolderId, droppedFolderShortcutId = null) => {
        if (isViewerInsideSharedFolder) {
            return true;
        }

        if (!canWriteIntoTargetFolder(targetFolderId)) {
            return true;
        }

        const currentFolderId = logic.currentFolder ? logic.currentFolder.id : null;
        if (subjectId) {
            return handleDropOnFolderWrapper(targetFolderId, subjectId, 'subject', currentFolderId);
        }
        let resolvedFolderShortcutId = droppedFolderShortcutId;
        resolvedFolderShortcutId = resolvedFolderShortcutId || resolveFolderShortcutId(droppedFolderId, currentFolderId || null);
        if (resolvedFolderShortcutId && logic?.moveShortcut) {
            logic.moveShortcut(resolvedFolderShortcutId, targetFolderId || null);
            return true;
        }
        if (droppedFolderId) {
            if (isInvalidFolderMove(droppedFolderId, targetFolderId, logic.folders || [])) {
                console.warn('🚫 BLOCKED: Circular dependency detected.');
                return true;
            }

            const droppedFolder = (logic.folders || []).find(f => f.id === droppedFolderId);
            if (!droppedFolder) return;
            const currentParentId = droppedFolder.parentId || null;
            const targetFolder = (logic.folders || []).find(f => f.id === targetFolderId);
            const getSharedUids = item => (item && Array.isArray(item.sharedWithUids) ? item.sharedWithUids : []);
            if (droppedFolder && droppedFolder.isShared && (!targetFolder || !targetFolder.isShared)) {
                if (droppedFolder.parentId) {
                    const parentFolder = (logic.folders || []).find(f => f.id === droppedFolder.parentId);
                    if (parentFolder && parentFolder.isShared) {
                        setUnshareConfirm({
                            open: true,
                            subjectId: null,
                            folder: droppedFolder,
                            onConfirm: async () => {
                                const oldSharedWithUids = Array.isArray(droppedFolder.sharedWithUids)
                                    ? droppedFolder.sharedWithUids
                                    : [];
                                await updateFolder(droppedFolderId, {
                                    sharedWith: [],
                                    sharedWithUids: [],
                                    isShared: false
                                });
                                // Update all subjects in this folder (query by folderId)
                                const subjectsInFolder = (logic.subjects || []).filter(s => s.folderId === droppedFolderId);
                                for (const subject of subjectsInFolder) {
                                    const newSharedWith = (subject.sharedWith || []).filter(
                                        u => !oldSharedWithUids.includes(u.uid)
                                    );
                                    const newSharedWithUids = (subject.sharedWithUids || []).filter(
                                        uid => !oldSharedWithUids.includes(uid)
                                    );
                                    await updateDoc(doc(db, 'subjects', subject.id), {
                                        sharedWith: newSharedWith,
                                        sharedWithUids: newSharedWithUids,
                                        isShared: newSharedWithUids.length > 0
                                    });
                                }
                                await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                                closeUnshareConfirm();
                            }
                        });
                        return true;
                    }
                }
            }
            if (targetFolder && targetFolder.isShared) {
                const droppedShared = new Set(getSharedUids(droppedFolder));
                const targetShared = getSharedUids(targetFolder);
                const newUsers = targetShared.filter(uid => !droppedShared.has(uid));
                if (newUsers.length > 0) {
                    setShareConfirm({
                        open: true,
                        folder: targetFolder,
                        subjectId: null,
                        onConfirm: async () => {
                            await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                            setShareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                        }
                    });
                    return true;
                }
            }
            moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
            return true;
        }
    };

    const handleNestFolder = async (targetFolderId, droppedFolderId, droppedFolderShortcutId = null) => {
        if (isViewerInsideSharedFolder) {
            return;
        }

        if (!canWriteIntoTargetFolder(targetFolderId)) {
            return;
        }

        const inferredShortcutId = droppedFolderShortcutId || resolveFolderShortcutId(droppedFolderId, logic.currentFolder?.id || null);

        if (inferredShortcutId && logic?.moveShortcut) {
            await logic.moveShortcut(inferredShortcutId, targetFolderId || null);
            return;
        }
        if (targetFolderId === droppedFolderId) return;

        const droppedFolderSource = (logic.folders || []).find(f => f.id === droppedFolderId);
        const userCanEditSource = droppedFolderSource && currentUserId ? canEdit(droppedFolderSource, currentUserId) : false;
        if (!userCanEditSource) {
            return;
        }

        if (isInvalidFolderMove(droppedFolderId, targetFolderId, logic.folders || [])) {
            console.warn('🚫 BLOCKED: Circular dependency detected.');
            return;
        }

        const droppedFolder = (logic.folders || []).find(f => f.id === droppedFolderId);
        if (!droppedFolder) return;
        const currentParentId = droppedFolder.parentId || null;
        const targetFolder = (logic.folders || []).find(f => f.id === targetFolderId);

        const getSharedUids = item => (item && Array.isArray(item.sharedWithUids) ? item.sharedWithUids : []);

        if (droppedFolder && droppedFolder.isShared && (!targetFolder || !targetFolder.isShared) && droppedFolder.parentId) {
            const parentFolder = (logic.folders || []).find(f => f.id === droppedFolder.parentId);
            if (parentFolder && parentFolder.isShared) {
                setUnshareConfirm({
                    open: true,
                    subjectId: null,
                    folder: droppedFolder,
                    onConfirm: async () => {
                        const oldSharedWithUids = Array.isArray(droppedFolder.sharedWithUids) ? droppedFolder.sharedWithUids : [];
                        await updateFolder(droppedFolderId, {
                            sharedWith: [],
                            sharedWithUids: [],
                            isShared: false
                        });
                        // Update all subjects in this folder (query by folderId)
                        const subjectsInFolder2 = (logic.subjects || []).filter(s => s.folderId === droppedFolderId);
                        for (const subject of subjectsInFolder2) {
                            const newSharedWith = (subject.sharedWith || []).filter(
                                u => !oldSharedWithUids.includes(u.uid)
                            );
                            const newSharedWithUids = (subject.sharedWithUids || []).filter(
                                uid => !oldSharedWithUids.includes(uid)
                            );
                            await updateDoc(doc(db, 'subjects', subject.id), {
                                sharedWith: newSharedWith,
                                sharedWithUids: newSharedWithUids,
                                isShared: newSharedWithUids.length > 0
                            });
                        }
                        await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                        closeUnshareConfirm();
                    }
                });
                return;
            }
        }

        if (targetFolder && targetFolder.isShared) {
            const droppedShared = new Set(getSharedUids(droppedFolder));
            const targetShared = getSharedUids(targetFolder);
            const newUsers = targetShared.filter(uid => !droppedShared.has(uid));
            if (newUsers.length > 0) {
                setShareConfirm({
                    open: true,
                    folder: targetFolder,
                    subjectId: null,
                    onConfirm: async () => {
                        await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                        setShareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                    }
                });
                return;
            }
        }
        await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId, { preserveSharing: true });
    };

    const handlePromoteSubjectWrapper = async (subjectId, subjectShortcutId = null) => {
        if (isViewerInsideSharedFolder) return;

        const currentFolder = logic.currentFolder;
        const parentId = currentFolder ? currentFolder.parentId : null;

        if (subjectShortcutId && logic?.moveShortcut) {
            await logic.moveShortcut(subjectShortcutId, parentId || null);
            return;
        }

        const sourceFolder = currentFolder;
        let targetFolder = null;
        if (parentId) {
            targetFolder = (logic.folders || []).find(f => f.id === parentId);
        }

        if (sourceFolder && sourceFolder.isShared && (!targetFolder || !targetFolder.isShared)) {
            setUnshareConfirm({
                open: true,
                subjectId,
                folder: sourceFolder,
                onConfirm: async () => {
                    await moveSubjectToParent(subjectId, currentFolder.id, parentId);
                    closeUnshareConfirm();
                },
                onPreserveConfirm: async () => {
                    await moveSubjectBetweenFolders(subjectId, currentFolder.id, parentId, { preserveSharing: true });
                    closeUnshareConfirm();
                },
            });
            return;
        }

        if (currentFolder) await moveSubjectToParent(subjectId, currentFolder.id, parentId);
    };

    const handlePromoteFolderWrapper = async (folderId, folderShortcutId = null) => {
        if (isViewerInsideSharedFolder) return;

        const resolvedShortcutId = folderShortcutId || resolveFolderShortcutId(folderId, logic.currentFolder?.id || null);

        if (resolvedShortcutId && logic?.moveShortcut) {
            const parentId = logic.currentFolder ? logic.currentFolder.parentId : null;
            await logic.moveShortcut(resolvedShortcutId, parentId || null);
            return;
        }

        const sourceFolder = (logic.folders || []).find(f => f.id === folderId);
        const userCanEditSource = sourceFolder && currentUserId ? canEdit(sourceFolder, currentUserId) : false;
        if (!userCanEditSource) {
            return;
        }

        if (logic.currentFolder && folderId !== logic.currentFolder.id) {
            const currentFolder = logic.currentFolder;
            const parentId = currentFolder.parentId;
            const sourceFolder = currentFolder;
            let targetFolder = null;
            if (parentId) {
                targetFolder = (logic.folders || []).find(f => f.id === parentId);
            }
            if (sourceFolder && sourceFolder.isShared && (!targetFolder || !targetFolder.isShared)) {
                setUnshareConfirm({
                    open: true,
                    subjectId: null,
                    folder: sourceFolder,
                    onConfirm: async () => {
                        const oldSharedWithUids = Array.isArray(sourceFolder.sharedWithUids) ? sourceFolder.sharedWithUids : [];
                        await updateFolder(folderId, {
                            sharedWith: [],
                            sharedWithUids: [],
                            isShared: false
                        });
                        const folder = (logic.folders || []).find(f => f.id === folderId);
                        // Update all subjects in this folder (query by folderId)
                        const subjectsInFolder3 = (logic.subjects || []).filter(s => s.folderId === folderId);
                        for (const subject of subjectsInFolder3) {
                            const newSharedWith = (subject.sharedWith || []).filter(
                                u => !oldSharedWithUids.includes(u.uid)
                            );
                            const newSharedWithUids = (subject.sharedWithUids || []).filter(
                                uid => !oldSharedWithUids.includes(uid)
                            );
                            await updateDoc(doc(db, 'subjects', subject.id), {
                                sharedWith: newSharedWith,
                                sharedWithUids: newSharedWithUids,
                                isShared: newSharedWithUids.length > 0
                            });
                        }
                        await moveFolderToParent(folderId, currentFolder.id, parentId);
                        closeUnshareConfirm();
                    }
                });
                return;
            }
            await moveFolderToParent(folderId, currentFolder.id, parentId);
        }
    };

    const handleShowFolderContents = folder => {
        setFolderContentsModalConfig({ isOpen: true, folder });
    };

    const handleNavigateFromTree = folder => {
        setFolderContentsModalConfig({ isOpen: false, folder: null });
        logic.setCurrentFolder(folder);
        if (folder && folder.id) {
            localStorage.setItem('dlp_last_folderId', folder.id);
        }
        if (!folder) {
            localStorage.removeItem('dlp_last_folderId');
        }
    };

    const handleNavigateSubjectFromTree = subject => {
        setFolderContentsModalConfig({ isOpen: false, folder: null });
        logic.navigate(`/home/subject/${subject.id}`);
    };

    const handleTreeMoveSubject = async (subjectId, targetFolderId, sourceFolderId) => {
        if (isViewerInsideSharedFolder) return;

        if (!canWriteIntoTargetFolder(targetFolderId)) return;

        const subject = (logic.subjects || []).find(s => s.id === subjectId);
        const userId = currentUserId;
        const userCanEdit = subject && userId ? canEdit(subject, userId) : false;

        if (!userCanEdit && logic?.moveShortcut) {
            const shortcut = (logic.shortcuts || []).find(
                s =>
                    s.targetId === subjectId &&
                    s.targetType === 'subject' &&
                    (s.parentId || null) === (sourceFolderId || null)
            );

            if (shortcut?.id) {
                await logic.moveShortcut(shortcut.id, targetFolderId || null);
                return;
            }
        }

        await moveSubjectBetweenFolders(subjectId, sourceFolderId, targetFolderId);
    };

    const handleTreeReorderSubject = async (folderId, subjectId, newIndex) => {
        if (logic.currentFolder && folderId === logic.currentFolder.id) {
            if (logic.handleDropReorderSubject) logic.handleDropReorderSubject(subjectId, newIndex);
        }
    };

    const handleOpenTopics = subject => {
        setTopicsModalConfig({ isOpen: true, subject });
    };

    return {
        handleSaveFolderWrapper,
        handleUpwardDrop,
        handleBreadcrumbDrop,
        handleOpenTopics,
        handleDropOnFolderWrapper,
        handleNestFolder,
        handlePromoteSubjectWrapper,
        handlePromoteFolderWrapper,
        handleShowFolderContents,
        handleNavigateFromTree,
        handleNavigateSubjectFromTree,
        handleTreeMoveSubject,
        handleTreeReorderSubject
    };
};
