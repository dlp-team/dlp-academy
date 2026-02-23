// src/pages/Home/hooks/useHomePageHandlers.js
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { isInvalidFolderMove } from '../../../utils/folderUtils';
import { canEdit } from '../../../utils/permissionUtils';

export const useHomePageHandlers = ({
    logic,
    updateFolder,
    moveSubjectToParent,
    moveFolderToParent,
    moveSubjectBetweenFolders,
    setShareConfirm,
    setUnshareConfirm,
    setTopicsModalConfig,
    setFolderContentsModalConfig
}) => {
    const handleSaveFolderWrapper = folderData => {
        const dataWithParent = { ...folderData, parentId: logic.currentFolder ? logic.currentFolder.id : null };
        logic.handleSaveFolder(dataWithParent);
    };

    const handleUpwardDrop = async e => {
        e.preventDefault();
        e.stopPropagation();
        const subjectId = e.dataTransfer.getData('subjectId');
        const subjectShortcutId = e.dataTransfer.getData('subjectShortcutId');
        const folderId = e.dataTransfer.getData('folderId');
        if (logic.currentFolder) {
            const currentId = logic.currentFolder.id;
            const parentId = logic.currentFolder.parentId;
            if (subjectId) {
                if (subjectShortcutId && logic?.moveShortcut) {
                    await logic.moveShortcut(subjectShortcutId, parentId || null);
                } else {
                    await moveSubjectToParent(subjectId, currentId, parentId);
                }
            } else if (folderId && folderId !== currentId) {
                await moveFolderToParent(folderId, currentId, parentId);
            }
        }
    };

    const handleDropOnFolderWrapper = (targetFolderId, subjectId, typeOrSourceFolderId, sourceFolderIdMaybe, shortcutIdMaybe) => {
        const isKnownType = typeOrSourceFolderId === 'subject' || typeOrSourceFolderId === 'folder';
        const type = isKnownType ? typeOrSourceFolderId : 'subject';
        const explicitSourceFolderId = isKnownType ? sourceFolderIdMaybe : typeOrSourceFolderId;
        const draggedShortcutId = isKnownType ? shortcutIdMaybe : sourceFolderIdMaybe;

        if (type === 'folder') {
            handleNestFolder(targetFolderId, subjectId);
            return true;
        }

        const subject = (logic.subjects || []).find(s => s.id === subjectId);
        const currentFolderId =
            explicitSourceFolderId !== undefined && explicitSourceFolderId !== null
                ? explicitSourceFolderId
                : subject?.folderId || (logic.currentFolder ? logic.currentFolder.id : null);

        console.log('[CALL] handleDropOnFolderWrapper:', {
            targetFolderId,
            subjectId,
            type,
            typeOrSourceFolderId,
            sourceFolderIdMaybe,
            currentFolderId,
            draggedShortcutId
        });

        if (targetFolderId === currentFolderId) {
            return;
        }
        const targetFolder = (logic.folders || []).find(f => f.id === targetFolderId);
        const sourceFolder = (logic.folders || []).find(f => f.id === currentFolderId);
        const userId = logic?.user?.uid || logic?.uid;

        if (draggedShortcutId && logic?.moveShortcut) {
            logic.moveShortcut(draggedShortcutId, targetFolderId || null);
            return true;
        }

        if (subject) {
            const userCanEdit = userId ? canEdit(subject, userId) : false;
            if (!userCanEdit) {
                console.log('[handleDropOnFolderWrapper] viewer/editor without shortcut cannot move source subject directly:', {
                    subjectId,
                    targetFolderId,
                    currentFolderId,
                    userId
                });
                return true;
            }
        }

        const getSharedUids = item => (item && Array.isArray(item.sharedWithUids) ? item.sharedWithUids : []);

        const subjectSharedWithUids = getSharedUids(subject);
        const targetFolderSharedWithUids = getSharedUids(targetFolder);

        if (
            sourceFolder &&
            sourceFolder.isShared &&
            (!targetFolder || !targetFolder.isShared) &&
            Array.isArray(sourceFolder.subjectIds) &&
            sourceFolder.subjectIds.includes(subjectId)
        ) {
            const parentFolder = sourceFolder.parentId ? (logic.folders || []).find(f => f.id === sourceFolder.parentId) : null;
            if (parentFolder && parentFolder.isShared) {
                setUnshareConfirm({
                    open: true,
                    subjectId,
                    folder: sourceFolder,
                    onConfirm: async () => {
                        await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
                        setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                    }
                });
                return true;
            }
        }

        if (targetFolder && targetFolder.isShared) {
            const subjectShared = new Set(subjectSharedWithUids);
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
        console.log('[handleDropOnFolderWrapper] moveSubjectBetweenFolders args:', {
            subjectId,
            currentFolderId,
            targetFolderId
        });
        moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
        return true;
    };

    const handleBreadcrumbDrop = (targetFolderId, subjectId, droppedFolderId) => {
        const currentFolderId = logic.currentFolder ? logic.currentFolder.id : null;
        if (subjectId) {
            return handleDropOnFolderWrapper(targetFolderId, subjectId, 'subject', currentFolderId);
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
                                if (Array.isArray(droppedFolder.subjectIds)) {
                                    for (const childSubjectId of droppedFolder.subjectIds) {
                                        const subject = (logic.subjects || []).find(s => s.id === childSubjectId);
                                        if (subject) {
                                            const newSharedWith = (subject.sharedWith || []).filter(
                                                u => !oldSharedWithUids.includes(u.uid)
                                            );
                                            const newSharedWithUids = (subject.sharedWithUids || []).filter(
                                                uid => !oldSharedWithUids.includes(uid)
                                            );
                                            await updateDoc(doc(db, 'subjects', childSubjectId), {
                                                sharedWith: newSharedWith,
                                                sharedWithUids: newSharedWithUids,
                                                isShared: newSharedWithUids.length > 0
                                            });
                                        }
                                    }
                                }
                                await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                                setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
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

    const handleNestFolder = async (targetFolderId, droppedFolderId) => {
        if (targetFolderId === droppedFolderId) return;

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
                        if (Array.isArray(droppedFolder.subjectIds)) {
                            for (const childSubjectId of droppedFolder.subjectIds) {
                                const subject = (logic.subjects || []).find(s => s.id === childSubjectId);
                                if (subject) {
                                    const newSharedWith = (subject.sharedWith || []).filter(
                                        u => !oldSharedWithUids.includes(u.uid)
                                    );
                                    const newSharedWithUids = (subject.sharedWithUids || []).filter(
                                        uid => !oldSharedWithUids.includes(uid)
                                    );
                                    await updateDoc(doc(db, 'subjects', childSubjectId), {
                                        sharedWith: newSharedWith,
                                        sharedWithUids: newSharedWithUids,
                                        isShared: newSharedWithUids.length > 0
                                    });
                                }
                            }
                        }
                        await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                        setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
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

    const handlePromoteSubjectWrapper = async subjectId => {
        const currentFolder = logic.currentFolder;
        const parentId = currentFolder ? currentFolder.parentId : null;
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
                    setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
                }
            });
            return;
        }

        if (currentFolder) await moveSubjectToParent(subjectId, currentFolder.id, parentId);
    };

    const handlePromoteFolderWrapper = async folderId => {
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
                        if (folder && Array.isArray(folder.subjectIds)) {
                            for (const childSubjectId of folder.subjectIds) {
                                const subject = (logic.subjects || []).find(s => s.id === childSubjectId);
                                if (subject) {
                                    const newSharedWith = (subject.sharedWith || []).filter(
                                        u => !oldSharedWithUids.includes(u.uid)
                                    );
                                    const newSharedWithUids = (subject.sharedWithUids || []).filter(
                                        uid => !oldSharedWithUids.includes(uid)
                                    );
                                    await updateDoc(doc(db, 'subjects', childSubjectId), {
                                        sharedWith: newSharedWith,
                                        sharedWithUids: newSharedWithUids,
                                        isShared: newSharedWithUids.length > 0
                                    });
                                }
                            }
                        }
                        await moveFolderToParent(folderId, currentFolder.id, parentId);
                        setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null });
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
        const subject = (logic.subjects || []).find(s => s.id === subjectId);
        const userId = logic?.user?.uid || logic?.uid;
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
