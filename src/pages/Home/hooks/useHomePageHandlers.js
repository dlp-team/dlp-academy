// src/pages/Home/hooks/useHomePageHandlers.js
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { isInvalidFolderMove } from '../../../utils/folderUtils';
import { canEdit, getPermissionLevel } from '../../../utils/permissionUtils';

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
    const closeShareConfirm = () => {
        setShareConfirm({ open: false, type: null, subjectId: null, folder: null, onConfirm: null, onMergeConfirm: null });
    };

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
        if (canEdit(targetFolder, currentUserId)) return true;

        const rootSharedFolder = getRootSharedFolder(targetFolderId);
        if (!rootSharedFolder) return false;
        const rootPermission = getPermissionLevel(rootSharedFolder, currentUserId);
        return rootPermission === 'editor' || rootPermission === 'owner';
    };

    const canWriteFromSourceFolder = (sourceFolderId) => {
        if (!sourceFolderId) return true;
        const sourceFolder = (logic.folders || []).find(f => f.id === sourceFolderId);
        if (!sourceFolder) return true;
        if (sourceFolder.isShared !== true) return true;
        if (!currentUserId) return false;
        if (canEdit(sourceFolder, currentUserId)) return true;

        const rootSharedFolder = getRootSharedFolder(sourceFolderId);
        if (!rootSharedFolder) return false;
        const rootPermission = getPermissionLevel(rootSharedFolder, currentUserId);
        return rootPermission === 'editor' || rootPermission === 'owner';
    };

    const getFolderById = (folderId) => {
        if (!folderId) return null;
        return (logic.folders || []).find(f => f.id === folderId) || null;
    };

    const getSharedUids = item => (item && Array.isArray(item.sharedWithUids) ? item.sharedWithUids : []);
    const getSharedWithEntries = item => (item && Array.isArray(item.sharedWith) ? item.sharedWith : []);

    const areSharedSetsEqual = (leftUids = [], rightUids = []) => {
        const leftSet = new Set(leftUids || []);
        const rightSet = new Set(rightUids || []);
        if (leftSet.size !== rightSet.size) return false;
        for (const uid of leftSet) {
            if (!rightSet.has(uid)) return false;
        }
        return true;
    };

    const mergeTargetFolderShares = async (targetFolderId, incomingUids = [], incomingSharedWith = []) => {
        const targetFolder = getFolderById(targetFolderId);
        if (!targetFolder) return;

        const targetUids = getSharedUids(targetFolder);
        const targetSharedWith = getSharedWithEntries(targetFolder);

        const mergedUids = Array.from(new Set([...(targetUids || []), ...(incomingUids || [])]));
        const mergedSharedWithMap = new Map();

        [...targetSharedWith, ...(incomingSharedWith || [])].forEach(entry => {
            const entryUid = entry?.uid || null;
            const entryEmail = (entry?.email || '').toLowerCase();
            const key = entryUid || `email:${entryEmail}`;
            if (!key) return;
            if (!mergedSharedWithMap.has(key)) {
                mergedSharedWithMap.set(key, entry);
            }
        });

        await updateFolder(targetFolderId, {
            sharedWithUids: mergedUids,
            sharedWith: Array.from(mergedSharedWithMap.values()),
            isShared: mergedUids.length > 0
        });
    };

    const getRootSharedFolder = (folderId) => {
        if (!folderId) return null;
        let current = getFolderById(folderId);
        let safety = 0;

        while (current?.parentId && safety < 200) {
            current = getFolderById(current.parentId);
            safety += 1;
        }

        if (!current) return null;
        return current.isShared === true ? current : null;
    };

    const isInsideRootSharedTree = (targetFolderId, rootSharedFolderId) => {
        if (!targetFolderId || !rootSharedFolderId) return false;

        let current = getFolderById(targetFolderId);
        let safety = 0;

        while (current && safety < 200) {
            if (current.id === rootSharedFolderId) return true;
            current = current.parentId ? getFolderById(current.parentId) : null;
            safety += 1;
        }

        return false;
    };

    const isEditorLeavingRootSharedBoundary = (sourceFolderId, targetFolderId) => {
        if (!sourceFolderId || !currentUserId) return false;

        const rootSharedFolder = getRootSharedFolder(sourceFolderId);
        if (!rootSharedFolder) return false;

        const rootPermission = getPermissionLevel(rootSharedFolder, currentUserId);
        if (rootPermission !== 'editor') return false;

        return !isInsideRootSharedTree(targetFolderId, rootSharedFolder.id);
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

    const requestOwnerMoveForShortcut = ({ shortcutId, targetFolderId, targetType, targetId }) => {
        const targetFolder = targetFolderId ? getFolderById(targetFolderId) : null;
        if (!targetFolder || targetFolder.isShared !== true) return false;

        setShareConfirm({
            open: true,
            type: 'shortcut-move-request',
            subjectId: targetType === 'subject' ? targetId : null,
            folder: targetFolder,
            requestedShortcutType: targetType,
            requestedShortcutId: shortcutId,
            requestedTargetId: targetId,
            onConfirm: async () => {
                // TODO(shortcut-move-request): send email to shared folder owner requesting source-item move approval.
                // TODO(shortcut-move-request): create in-app notification for owner with approve/reject actions.
                // TODO(shortcut-move-request): if owner approves, execute source move (folder/subject), never move shortcut into shared folder.
                console.info('[SHORTCUT_MOVE_REQUEST][queued]', {
                    shortcutId,
                    targetFolderId,
                    targetFolderName: targetFolder?.name || null,
                    targetType,
                    targetId,
                    requestedBy: currentUserId || null
                });
                closeShareConfirm();
            }
        });

        return true;
    };

    const moveShortcutOrRequest = async (shortcutId, targetFolderId, targetType, targetId) => {
        if (!shortcutId || !logic?.moveShortcut) return false;

        if (requestOwnerMoveForShortcut({ shortcutId, targetFolderId, targetType, targetId })) {
            return true;
        }

        await logic.moveShortcut(shortcutId, targetFolderId || null);
        return true;
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

            if (isEditorLeavingRootSharedBoundary(currentId, parentId || null)) {
                return;
            }

            if (subjectId) {
                if (subjectShortcutId && logic?.moveShortcut) {
                    await moveShortcutOrRequest(subjectShortcutId, parentId || null, 'subject', subjectId);
                } else {
                    await moveSubjectToParent(subjectId, currentId, parentId);
                }
            } else if (folderShortcutId && logic?.moveShortcut) {
                await moveShortcutOrRequest(folderShortcutId, parentId || null, 'folder', folderId || null);
            } else if (folderId && folderId !== currentId) {
                folderShortcutId = folderShortcutId || resolveFolderShortcutId(folderId, currentId || null);
                if (folderShortcutId && logic?.moveShortcut) {
                    await moveShortcutOrRequest(folderShortcutId, parentId || null, 'folder', folderId);
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

        const isKnownType = typeOrSourceFolderId === 'subject' || typeOrSourceFolderId === 'folder';
        const type = isKnownType ? typeOrSourceFolderId : 'subject';
        const explicitSourceFolderId = isKnownType ? sourceFolderIdMaybe : typeOrSourceFolderId;
        let draggedShortcutId = isKnownType ? shortcutIdMaybe : sourceFolderIdMaybe;

        const targetFolder = (logic.folders || []).find(f => f.id === targetFolderId);

        if (draggedShortcutId) {
            if (requestOwnerMoveForShortcut({
                shortcutId: draggedShortcutId,
                targetFolderId,
                targetType: type,
                targetId: subjectId
            })) {
                return true;
            }
            if (logic?.moveShortcut) {
                logic.moveShortcut(draggedShortcutId, targetFolderId || null);
                return true;
            }
        }

        if (!canWriteIntoTargetFolder(targetFolderId)) {
            return true;
        }

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

        if (!canWriteFromSourceFolder(currentFolderId)) {
            return true;
        }

        if (isEditorLeavingRootSharedBoundary(currentFolderId, targetFolderId || null)) {
            return true;
        }


        if (targetFolderId === currentFolderId) {
            return;
        }
        const sourceFolder = (logic.folders || []).find(f => f.id === currentFolderId);
        const userId = currentUserId;

        if (!sourceFolder && (!targetFolder || targetFolder.isShared !== true)) {
            moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
            return true;
        }

        if (!draggedShortcutId && logic?.shortcuts) {
            const inferredShortcut = (logic.shortcuts || []).find(
                s =>
                    s.targetType === 'subject' &&
                    s.targetId === subjectId &&
                    (s.parentId || null) === (currentFolderId || null)
            );
            draggedShortcutId = inferredShortcut?.id || null;
        }

        if (subject) {
            const userCanEdit = userId ? canEdit(subject, userId) : false;
            const userCanEditFromContext = canWriteFromSourceFolder(currentFolderId);
            if (!userCanEdit && !userCanEditFromContext) {
                return true;
            }
        }

        const subjectSharedWithUids = getSharedUids(subject);
        const sourceFolderSharedWithUids = getSharedUids(sourceFolder);
        const targetFolderSharedWithUids = getSharedUids(targetFolder);
        const baselineSharedWith = [
            ...getSharedWithEntries(sourceFolder),
            ...getSharedWithEntries(subject)
        ];
        const baselineSharedWithUids = sourceFolder ? sourceFolderSharedWithUids : subjectSharedWithUids;
        const effectiveSourceSharedWithUids = Array.from(new Set([
            ...baselineSharedWithUids,
            ...subjectSharedWithUids
        ]));

        if (targetFolder && targetFolder.isShared && effectiveSourceSharedWithUids.length > 0 && !areSharedSetsEqual(effectiveSourceSharedWithUids, targetFolderSharedWithUids)) {
            setShareConfirm({
                open: true,
                type: 'shared-mismatch-move',
                subjectId,
                folder: targetFolder,
                sourceType: 'subject',
                sourceName: subject?.name || '',
                onConfirm: async () => {
                    await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId, {
                        alignToTargetFolder: true,
                        forceRefreshSharing: true
                    });
                    closeShareConfirm();
                },
                onMergeConfirm: async () => {
                    await mergeTargetFolderShares(targetFolderId, effectiveSourceSharedWithUids, baselineSharedWith);
                    await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId, { forceRefreshSharing: true });
                    closeShareConfirm();
                }
            });
            return true;
        }

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

    const handleBreadcrumbDrop = (targetFolderId, subjectId, droppedFolderId, droppedFolderShortcutId = null, subjectShortcutId = null) => {
        if (isViewerInsideSharedFolder) {
            return true;
        }

        const currentFolderId = logic.currentFolder ? logic.currentFolder.id : null;
        if (subjectId) {
            return handleDropOnFolderWrapper(targetFolderId, subjectId, 'subject', currentFolderId, subjectShortcutId || null);
        }
        let resolvedFolderShortcutId = droppedFolderShortcutId;
        resolvedFolderShortcutId = resolvedFolderShortcutId || resolveFolderShortcutId(droppedFolderId, currentFolderId || null);
        if (resolvedFolderShortcutId && logic?.moveShortcut) {
            moveShortcutOrRequest(resolvedFolderShortcutId, targetFolderId || null, 'folder', droppedFolderId || null);
            return true;
        }

        if (!canWriteIntoTargetFolder(targetFolderId)) {
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

            if (isEditorLeavingRootSharedBoundary(currentParentId || droppedFolder.id, targetFolderId || null)) {
                return true;
            }

            const targetFolder = (logic.folders || []).find(f => f.id === targetFolderId);
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
                const droppedSharedUids = getSharedUids(droppedFolder);
                const targetShared = getSharedUids(targetFolder);
                if (droppedSharedUids.length > 0 && !areSharedSetsEqual(droppedSharedUids, targetShared)) {
                    setShareConfirm({
                        open: true,
                        type: 'shared-mismatch-move',
                        folder: targetFolder,
                        subjectId: null,
                        sourceType: 'folder',
                        sourceName: droppedFolder?.name || '',
                        onConfirm: async () => {
                            await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                            closeShareConfirm();
                        },
                        onMergeConfirm: async () => {
                            await mergeTargetFolderShares(targetFolderId, droppedSharedUids, getSharedWithEntries(droppedFolder));
                            await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                            closeShareConfirm();
                        }
                    });
                    return true;
                }

                const droppedShared = new Set(droppedSharedUids);
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

        const inferredShortcutId = droppedFolderShortcutId || resolveFolderShortcutId(droppedFolderId, logic.currentFolder?.id || null);

        if (inferredShortcutId && logic?.moveShortcut) {
            await moveShortcutOrRequest(inferredShortcutId, targetFolderId || null, 'folder', droppedFolderId);
            return;
        }

        if (!canWriteIntoTargetFolder(targetFolderId)) {
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

        if (isEditorLeavingRootSharedBoundary(currentParentId || droppedFolder.id, targetFolderId || null)) {
            return;
        }

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
            const droppedSharedUids = getSharedUids(droppedFolder);
            const targetShared = getSharedUids(targetFolder);
            if (droppedSharedUids.length > 0 && !areSharedSetsEqual(droppedSharedUids, targetShared)) {
                setShareConfirm({
                    open: true,
                    type: 'shared-mismatch-move',
                    folder: targetFolder,
                    subjectId: null,
                    sourceType: 'folder',
                    sourceName: droppedFolder?.name || '',
                    onConfirm: async () => {
                        await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                        closeShareConfirm();
                    },
                    onMergeConfirm: async () => {
                        await mergeTargetFolderShares(targetFolderId, droppedSharedUids, getSharedWithEntries(droppedFolder));
                        await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                        closeShareConfirm();
                    }
                });
                return;
            }

            const droppedShared = new Set(droppedSharedUids);
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
            await moveShortcutOrRequest(subjectShortcutId, parentId || null, 'subject', subjectId);
            return;
        }

        const sourceFolder = currentFolder;
        let targetFolder = null;
        if (parentId) {
            targetFolder = (logic.folders || []).find(f => f.id === parentId);
        }

        if (isEditorLeavingRootSharedBoundary(currentFolder?.id || null, parentId || null)) {
            return;
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
            await moveShortcutOrRequest(resolvedShortcutId, parentId || null, 'folder', folderId);
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

            if (isEditorLeavingRootSharedBoundary(currentFolder?.id || null, parentId || null)) {
                return;
            }

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
        const resolvedSourceFolderId = sourceFolderId !== undefined ? sourceFolderId : (subject?.folderId || null);

        if (!canWriteFromSourceFolder(resolvedSourceFolderId)) return;
        if (isEditorLeavingRootSharedBoundary(resolvedSourceFolderId, targetFolderId || null)) return;
        const userId = currentUserId;
        const userCanEdit = subject && userId ? canEdit(subject, userId) : false;
        const userCanEditFromContext = canWriteFromSourceFolder(resolvedSourceFolderId);

        if (!userCanEdit && logic?.moveShortcut) {
            const shortcut = (logic.shortcuts || []).find(
                s =>
                    s.targetId === subjectId &&
                    s.targetType === 'subject' &&
                    (s.parentId || null) === (sourceFolderId || null)
            );

            if (shortcut?.id) {
                await moveShortcutOrRequest(shortcut.id, targetFolderId || null, 'subject', subjectId);
                return;
            }

            if (!userCanEditFromContext) {
                return;
            }
        }

        if (!userCanEdit && !userCanEditFromContext) {
            return;
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
