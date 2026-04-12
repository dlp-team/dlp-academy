// src/pages/Home/hooks/useHomePageHandlers.ts
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { isInvalidFolderMove } from '../../../utils/folderUtils';
import { canEdit, getPermissionLevel } from '../../../utils/permissionUtils';
import { createShortcutMoveRequest } from '../../../services/shortcutMoveRequestService';
import { clearLastHomeFolderId, saveLastHomeFolderId } from '../utils/homePersistence';
import { buildBatchConfirmationPreview } from '../utils/homeBatchConfirmationUtils';

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
    setFolderContentsModalConfig,
    rememberOrganization = true,
    onHomeFeedback = null,
    registerUndoAction = null
}: any): any => {
    const publishHomeFeedback = (message: any, tone = 'success') => {
        if (typeof onHomeFeedback === 'function') {
            onHomeFeedback(message, tone);
        }
    };

    const closeShareConfirm = () => {
        setShareConfirm({ open: false, type: null, subjectId: null, folder: null, onConfirm: null, onMergeConfirm: null, batchPreview: null });
    };

    const closeUnshareConfirm = () => {
        setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null, onPreserveConfirm: null, batchPreview: null });
    };

    const isViewerInsideSharedFolder = Boolean(
        logic?.currentFolder?.isShared === true &&
        currentUserId &&
        !canEdit(logic.currentFolder, currentUserId)
    );

    const canWriteIntoTargetFolder = (targetFolderId: any) => {
        if (!targetFolderId) return true;
        const targetFolder = ((logic.folders || []) as any[]).find(f => f.id === targetFolderId);
        if (!targetFolder) return true;
        if (targetFolder.isShared !== true) return true;
        if (!currentUserId) return false;
        if (canEdit(targetFolder, currentUserId)) return true;

        const rootSharedFolder = getRootSharedFolder(targetFolderId);
        if (!rootSharedFolder) return false;
        const rootPermission = getPermissionLevel(rootSharedFolder, currentUserId);
        return rootPermission === 'editor' || rootPermission === 'owner';
    };

    const canWriteFromSourceFolder = (sourceFolderId: any) => {
        if (!sourceFolderId) return true;
        const sourceFolder = ((logic.folders || []) as any[]).find(f => f.id === sourceFolderId);
        if (!sourceFolder) return true;
        if (sourceFolder.isShared !== true) return true;
        if (!currentUserId) return false;
        if (canEdit(sourceFolder, currentUserId)) return true;

        const rootSharedFolder = getRootSharedFolder(sourceFolderId);
        if (!rootSharedFolder) return false;
        const rootPermission = getPermissionLevel(rootSharedFolder, currentUserId);
        return rootPermission === 'editor' || rootPermission === 'owner';
    };

    const getFolderById = (folderId: any) => {
        if (!folderId) return null;
        return ((logic.folders || []) as any[]).find(f => f.id === folderId) || null;
    };

    const getSubjectById = (subjectId: any) => {
        if (!subjectId) return null;
        return ((logic.subjects || []) as any[]).find(s => s.id === subjectId) || null;
    };

    const registerUndoMove = (payload: any, message = '') => {
        if (typeof registerUndoAction !== 'function' || !payload) return;
        registerUndoAction(payload, { message });
    };

    const registerSubjectMoveUndo = (subjectId: any, fromParentId: any, toParentId: any) => {
        const subjectName = getSubjectById(subjectId)?.name || 'Asignatura';
        registerUndoMove(
            {
                action: 'move-subject',
                id: subjectId,
                fromParentId: fromParentId || null,
                toParentId: toParentId || null,
                label: subjectName
            },
            `Movimiento aplicado: ${subjectName}.`
        );
    };

    const registerFolderMoveUndo = (folderId: any, fromParentId: any, toParentId: any) => {
        const folderName = getFolderById(folderId)?.name || 'Carpeta';
        registerUndoMove(
            {
                action: 'move-folder',
                id: folderId,
                fromParentId: fromParentId || null,
                toParentId: toParentId || null,
                label: folderName
            },
            `Movimiento aplicado: ${folderName}.`
        );
    };

    const registerShortcutMoveUndo = (shortcutId: any, targetType: any, targetId: any, fromParentId: any, toParentId: any) => {
        const fallbackLabel = targetType === 'folder' ? 'Carpeta' : 'Asignatura';
        const label = targetType === 'folder'
            ? (getFolderById(targetId)?.name || fallbackLabel)
            : (getSubjectById(targetId)?.name || fallbackLabel);

        registerUndoMove(
            {
                action: 'move-shortcut',
                shortcutId,
                targetType,
                targetId,
                fromParentId: fromParentId || null,
                toParentId: toParentId || null,
                label
            },
            `Movimiento aplicado: ${label}.`
        );
    };

    const getSharedUids = (item: any): any[] => (item && Array.isArray(item.sharedWithUids) ? item.sharedWithUids : []);
    const getSharedWithEntries = (item: any): any[] => (item && Array.isArray(item.sharedWith) ? item.sharedWith : []);

    const areSharedSetsEqual = (leftUids: any[] = [], rightUids: any[] = []) => {
        const leftSet = new Set(leftUids || []);
        const rightSet = new Set(rightUids || []);
        if (leftSet.size !== rightSet.size) return false;
        for (const uid of leftSet) {
            if (!rightSet.has(uid)) return false;
        }
        return true;
    };

    const mergeTargetFolderShares = async (targetFolderId: any, incomingUids: any[] = [], incomingSharedWith: any[] = []) => {
        const targetFolder = getFolderById(targetFolderId);
        if (!targetFolder) {
            return {
                mergedUids: Array.from(new Set(incomingUids || [])),
                mergedSharedWith: Array.isArray(incomingSharedWith) ? incomingSharedWith : []
            };
        }

        const targetUids = getSharedUids(targetFolder);
        const targetSharedWith = getSharedWithEntries(targetFolder);

        const mergedUids = Array.from(new Set([...(targetUids || []), ...(incomingUids || [])])) as any[];
        const mergedSharedWithMap = new Map<string, any>();

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

        return {
            mergedUids,
            mergedSharedWith: Array.from(mergedSharedWithMap.values()) as any[]
        };
    };

    const syncSharedStateToFolderTree = async (rootFolderId: any, sharedWithUids: any[] = [], sharedWith: any[] = []) => {
        if (!rootFolderId) return;

        const normalizedUids = Array.from(new Set((sharedWithUids || []).filter(Boolean))) as any[];
        const normalizedSharedWithMap = new Map<string, any>();

        (Array.isArray(sharedWith) ? sharedWith : []).forEach(entry => {
            const uid = entry?.uid || null;
            const email = (entry?.email || '').toLowerCase();
            const key = uid || (email ? `email:${email}` : null);
            if (!key || normalizedSharedWithMap.has(key)) return;
            normalizedSharedWithMap.set(key, entry);
        });

        const normalizedSharedWith = Array.from(normalizedSharedWithMap.values()) as any[];
        const allFolders = Array.isArray(logic?.folders) ? logic.folders : [];
        const allSubjects = Array.isArray(logic?.subjects) ? logic.subjects : [];

        const subtreeFolderIds = new Set<any>([rootFolderId]);
        const queue: any[] = [rootFolderId];

        while (queue.length > 0) {
            const currentFolderId = queue.shift();
            allFolders
                .filter(folder => (folder?.parentId || null) === currentFolderId)
                .forEach(childFolder => {
                    if (!childFolder?.id || subtreeFolderIds.has(childFolder.id)) return;
                    subtreeFolderIds.add(childFolder.id);
                    queue.push(childFolder.id);
                });
        }

        const descendantFolderIds = Array.from(subtreeFolderIds).filter(folderId => folderId !== rootFolderId);

        for (const folderId of descendantFolderIds) {
            await updateFolder(folderId, {
                sharedWithUids: [...normalizedUids],
                sharedWith: [...normalizedSharedWith],
                isShared: normalizedUids.length > 0
            });
        }

        const subjectsInTree = allSubjects.filter(subject => subtreeFolderIds.has(subject?.folderId || null));
        for (const subject of subjectsInTree) {
            await updateDoc(doc(db, 'subjects', subject.id), {
                sharedWithUids: [...normalizedUids],
                sharedWith: [...normalizedSharedWith],
                isShared: normalizedUids.length > 0,
                updatedAt: new Date()
            });
        }
    };

    const getRootSharedFolder = (folderId: any) => {
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

    const isInsideRootSharedTree = (targetFolderId, rootSharedFolderId: any) => {
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

    const isEditorLeavingRootSharedBoundary = (sourceFolderId, targetFolderId: any) => {
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

    const getBatchDecision = (moveOptions: any, key: any) => {
        if (!moveOptions || !moveOptions.batchDecisions) return null;
        return moveOptions.batchDecisions[key] ?? null;
    };

    const setBatchDecision = (moveOptions: any, key: any, value: any) => {
        if (typeof moveOptions?.setBatchDecision === 'function') {
            moveOptions.setBatchDecision(key, value);
        }
    };

    const notifyDeferredResolved = async (moveOptions: any, payload: any = {}) => {
        if (typeof moveOptions?.onDeferredResolved === 'function') {
            await moveOptions.onDeferredResolved({
                key: moveOptions?.entryKey || null,
                ...payload
            });
        }
    };

    const notifyDeferredCancelled = (moveOptions: any) => {
        if (typeof moveOptions?.onDeferredCancelled === 'function') {
            moveOptions.onDeferredCancelled({
                key: moveOptions?.entryKey || null
            });
        }
    };

    const resolveBatchPreview = (moveOptions: any, fallbackEntries: any[] = []) => {
        const previewFromOptions = moveOptions?.batchPreview;
        if (previewFromOptions && Number(previewFromOptions.totalCount || 0) > 0) {
            return previewFromOptions;
        }

        const fallbackPreview = buildBatchConfirmationPreview(fallbackEntries || []);
        return Number(fallbackPreview.totalCount || 0) > 1 ? fallbackPreview : null;
    };

    const requestOwnerMoveForShortcut = ({ shortcutId, targetFolderId, targetType, targetId, moveOptions = null }: any) => {
        const targetFolder = targetFolderId ? getFolderById(targetFolderId) : null;
        if (!targetFolder || targetFolder.isShared !== true) return false;

        const targetItem = targetType === 'folder'
            ? getFolderById(targetId)
            : getSubjectById(targetId);
        const batchPreview = resolveBatchPreview(moveOptions, [{
            type: targetType,
            item: targetItem || { id: targetId, name: targetItem?.name || '' }
        }]);

        setShareConfirm({
            open: true,
            type: 'shortcut-move-request',
            subjectId: targetType === 'subject' ? targetId : null,
            folder: targetFolder,
            batchPreview,
            requestedShortcutType: targetType,
            requestedShortcutId: shortcutId,
            requestedTargetId: targetId,
            onConfirm: async () => {
                try {
                    await createShortcutMoveRequest({
                        shortcutId,
                        targetFolderId,
                        targetId,
                        shortcutType: targetType
                    });
                    publishHomeFeedback('Solicitud enviada al propietario de la carpeta compartida.', 'success');
                    closeShareConfirm();
                    await notifyDeferredResolved(moveOptions, { moved: false });
                } catch (error: any) {
                    const errorCode = String(error?.code || '').toLowerCase();
                    if (errorCode.includes('already-exists')) {
                        publishHomeFeedback('Ya existe una solicitud pendiente para este acceso directo.', 'warning');
                        closeShareConfirm();
                        await notifyDeferredResolved(moveOptions, { moved: false });
                        return;
                    }
                    publishHomeFeedback('No se pudo enviar la solicitud de movimiento. Intentalo de nuevo.', 'error');
                }
            },
            onCancel: () => notifyDeferredCancelled(moveOptions)
        });

        return true;
    };

    const moveShortcutOrRequest = async (shortcutId, targetFolderId, targetType, targetId: any, sourceParentId: any = null, moveOptions: any = null) => {
        if (!shortcutId || !logic?.moveShortcut) return false;

        if (requestOwnerMoveForShortcut({ shortcutId, targetFolderId, targetType, targetId, moveOptions })) {
            return 'deferred';
        }

        await logic.moveShortcut(shortcutId, targetFolderId || null);
        registerShortcutMoveUndo(shortcutId, targetType, targetId, sourceParentId, targetFolderId || null);
        return 'moved';
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
                    await moveShortcutOrRequest(subjectShortcutId, parentId || null, 'subject', subjectId, currentId || null);
                } else {
                    await moveSubjectToParent(subjectId, currentId, parentId);
                    registerSubjectMoveUndo(subjectId, currentId, parentId || null);
                }
            } else if (folderShortcutId && logic?.moveShortcut) {
                await moveShortcutOrRequest(folderShortcutId, parentId || null, 'folder', folderId || null, currentId || null);
            } else if (folderId && folderId !== currentId) {
                folderShortcutId = folderShortcutId || resolveFolderShortcutId(folderId, currentId || null);
                if (folderShortcutId && logic?.moveShortcut) {
                    await moveShortcutOrRequest(folderShortcutId, parentId || null, 'folder', folderId, currentId || null);
                    return;
                }
                await moveFolderToParent(folderId, currentId, parentId);
                registerFolderMoveUndo(folderId, currentId, parentId || null);
            }
        }
    };

    const handleDropOnFolderWrapper = (
        targetFolderId,
        subjectId,
        typeOrSourceFolderId,
        sourceFolderIdMaybe,
        shortcutIdMaybe: any,
        moveOptions: any = null
    ) => {
        if (isViewerInsideSharedFolder) {
            return 'blocked';
        }

        const isKnownType = typeOrSourceFolderId === 'subject' || typeOrSourceFolderId === 'folder';
        const type = isKnownType ? typeOrSourceFolderId : 'subject';
        const explicitSourceFolderId = isKnownType ? sourceFolderIdMaybe : typeOrSourceFolderId;
        let draggedShortcutId = isKnownType ? shortcutIdMaybe : sourceFolderIdMaybe;

        const targetFolder = ((logic.folders || []) as any[]).find(f => f.id === targetFolderId);

        if (draggedShortcutId) {
            if (requestOwnerMoveForShortcut({
                shortcutId: draggedShortcutId,
                targetFolderId,
                targetType: type,
                targetId: subjectId,
                moveOptions
            })) {
                return 'deferred';
            }
            if (logic?.moveShortcut) {
                logic.moveShortcut(draggedShortcutId, targetFolderId || null);
                registerShortcutMoveUndo(
                    draggedShortcutId,
                    type,
                    subjectId,
                    explicitSourceFolderId || null,
                    targetFolderId || null
                );
                return 'moved';
            }
        }

        if (!canWriteIntoTargetFolder(targetFolderId)) {
            return 'blocked';
        }

        if (type === 'folder') {
            const sourceParentId = explicitSourceFolderId !== undefined ? explicitSourceFolderId : (logic.currentFolder ? logic.currentFolder.id : null);
            draggedShortcutId = draggedShortcutId || resolveFolderShortcutId(subjectId, sourceParentId || null);
            handleNestFolder(targetFolderId, subjectId, draggedShortcutId || null, moveOptions);
            return 'moved';
        }

        const subject = (logic.subjects || []).find(s => s.id === subjectId);
        const currentFolderId =
            explicitSourceFolderId !== undefined && explicitSourceFolderId !== null
                ? explicitSourceFolderId
                : subject?.folderId || (logic.currentFolder ? logic.currentFolder.id : null);

        if (!canWriteFromSourceFolder(currentFolderId)) {
            return 'blocked';
        }

        if (isEditorLeavingRootSharedBoundary(currentFolderId, targetFolderId || null)) {
            return 'blocked';
        }


        if (targetFolderId === currentFolderId) {
            return 'noop';
        }
        const sourceFolder = ((logic.folders || []) as any[]).find(f => f.id === currentFolderId);
        const userId = currentUserId;

        if (!sourceFolder && (!targetFolder || targetFolder.isShared !== true)) {
            moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
            return 'moved';
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
                return 'blocked';
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

        const executeSubjectSharedMismatchAlign = async () => {
            await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId, {
                alignToTargetFolder: true,
                forceRefreshSharing: true
            });
            registerSubjectMoveUndo(subjectId, currentFolderId, targetFolderId || null);
        };

        const executeSubjectSharedMismatchMerge = async () => {
            const { mergedUids, mergedSharedWith } = await mergeTargetFolderShares(targetFolderId, effectiveSourceSharedWithUids, baselineSharedWith);
            await syncSharedStateToFolderTree(targetFolderId, mergedUids, mergedSharedWith);
            await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId, { forceRefreshSharing: true });
            registerSubjectMoveUndo(subjectId, currentFolderId, targetFolderId || null);
        };

        const executeSubjectUnshareMove = async (preserveSharing = false) => {
            if (preserveSharing) {
                await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId, { preserveSharing: true });
            } else {
                await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
            }
            registerSubjectMoveUndo(subjectId, currentFolderId, targetFolderId || null);
        };

        const executeSubjectShareToTarget = async () => {
            await moveSubjectBetweenFolders(subjectId, currentFolderId, targetFolderId);
            registerSubjectMoveUndo(subjectId, currentFolderId, targetFolderId || null);
        };

        if (targetFolder && targetFolder.isShared && effectiveSourceSharedWithUids.length > 0 && !areSharedSetsEqual(effectiveSourceSharedWithUids, targetFolderSharedWithUids)) {
            const sharedMismatchDecision = getBatchDecision(moveOptions, 'subjectSharedMismatch');
            if (sharedMismatchDecision === 'align') {
                executeSubjectSharedMismatchAlign();
                return 'moved';
            }

            if (sharedMismatchDecision === 'merge') {
                executeSubjectSharedMismatchMerge();
                return 'moved';
            }

            setShareConfirm({
                open: true,
                type: 'shared-mismatch-move',
                subjectId,
                folder: targetFolder,
                batchPreview: resolveBatchPreview(moveOptions, [{
                    type: 'subject',
                    item: subject || { id: subjectId, name: subject?.name || '' }
                }]),
                sourceType: 'subject',
                sourceName: subject?.name || '',
                onConfirm: async () => {
                    await executeSubjectSharedMismatchAlign();
                    setBatchDecision(moveOptions, 'subjectSharedMismatch', 'align');
                    closeShareConfirm();
                    await notifyDeferredResolved(moveOptions, { moved: true });
                },
                onMergeConfirm: async () => {
                    await executeSubjectSharedMismatchMerge();
                    setBatchDecision(moveOptions, 'subjectSharedMismatch', 'merge');
                    closeShareConfirm();
                    await notifyDeferredResolved(moveOptions, { moved: true });
                },
                onCancel: () => notifyDeferredCancelled(moveOptions)
            });
            return 'deferred';
        }

        const removedUsers = baselineSharedWithUids.filter(uid => !targetFolderSharedWithUids.includes(uid));

        if (removedUsers.length > 0) {
            const unshareDecision = getBatchDecision(moveOptions, 'subjectUnshareMove');
            if (unshareDecision === 'remove') {
                executeSubjectUnshareMove(false);
                return 'moved';
            }

            if (unshareDecision === 'preserve') {
                executeSubjectUnshareMove(true);
                return 'moved';
            }

            setUnshareConfirm({
                open: true,
                subjectId,
                folder: sourceFolder,
                batchPreview: resolveBatchPreview(moveOptions, [{
                    type: 'subject',
                    item: subject || { id: subjectId, name: subject?.name || '' }
                }]),
                onConfirm: async () => {
                    await executeSubjectUnshareMove(false);
                    setBatchDecision(moveOptions, 'subjectUnshareMove', 'remove');
                    closeUnshareConfirm();
                    await notifyDeferredResolved(moveOptions, { moved: true });
                },
                onPreserveConfirm: async () => {
                    await executeSubjectUnshareMove(true);
                    setBatchDecision(moveOptions, 'subjectUnshareMove', 'preserve');
                    closeUnshareConfirm();
                    await notifyDeferredResolved(moveOptions, { moved: true });
                },
                onCancel: () => notifyDeferredCancelled(moveOptions)
            });
            return 'deferred';
        }

        if (targetFolder && targetFolder.isShared) {
            const subjectShared = new Set(baselineSharedWithUids);
            const folderShared = targetFolderSharedWithUids;
            const newUsers = folderShared.filter(uid => !subjectShared.has(uid));
            if (newUsers.length > 0) {
                const shareDecision = getBatchDecision(moveOptions, 'subjectShareToTarget');
                if (shareDecision === 'confirm') {
                    executeSubjectShareToTarget();
                    return 'moved';
                }

                setShareConfirm({
                    open: true,
                    subjectId,
                    folder: targetFolder,
                    batchPreview: resolveBatchPreview(moveOptions, [{
                        type: 'subject',
                        item: subject || { id: subjectId, name: subject?.name || '' }
                    }]),
                    onConfirm: async () => {
                        await executeSubjectShareToTarget();
                        setBatchDecision(moveOptions, 'subjectShareToTarget', 'confirm');
                        setShareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null, batchPreview: null });
                        await notifyDeferredResolved(moveOptions, { moved: true });
                    }
                });
                return 'deferred';
            }
        }
        
        executeSubjectShareToTarget();
        return 'moved';
    };

    const moveSelectionEntryWithShareRules = async (entry: any, targetFolderId: any, moveOptions: any = null) => {
        const type = entry?.type;
        const item = entry?.item;
        if (!item?.id || !type) {
            return { status: 'skipped' };
        }

        const scopedMoveOptions = {
            ...(moveOptions || {}),
            entryKey: moveOptions?.entryKey || entry?.key || null
        };

        if (type === 'folder') {
            const sourceParentId = item?.shortcutParentId ?? item?.parentId ?? (logic.currentFolder ? logic.currentFolder.id : null);
            const resolvedShortcutId = item?.shortcutId || resolveFolderShortcutId(item.id, sourceParentId || null);
            const folderStatus = await handleNestFolder(targetFolderId, item.id, resolvedShortcutId || null, scopedMoveOptions);
            if (typeof folderStatus === 'string') {
                return { status: folderStatus };
            }
            return { status: 'moved' };
        }

        const sourceFolderId = type === 'subject'
            ? (item?.shortcutParentId ?? item?.folderId ?? item?.parentId ?? (logic.currentFolder ? logic.currentFolder.id : null))
            : (item?.shortcutParentId ?? item?.parentId ?? (logic.currentFolder ? logic.currentFolder.id : null));

        const status = await Promise.resolve(handleDropOnFolderWrapper(
            targetFolderId,
            item.id,
            type,
            sourceFolderId,
            item?.shortcutId || null,
            scopedMoveOptions
        ));

        if (typeof status === 'string') {
            return { status };
        }

        return { status: 'moved' };
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
            if (requestOwnerMoveForShortcut({
                shortcutId: resolvedFolderShortcutId,
                targetFolderId: targetFolderId || null,
                targetType: 'folder',
                targetId: droppedFolderId || null
            })) {
                return 'deferred';
            }

            logic.moveShortcut(resolvedFolderShortcutId, targetFolderId || null);
            registerShortcutMoveUndo(
                resolvedFolderShortcutId,
                'folder',
                droppedFolderId || null,
                currentFolderId || null,
                targetFolderId || null
            );
            return 'moved';
        }

        if (!canWriteIntoTargetFolder(targetFolderId)) {
            return true;
        }
        if (droppedFolderId) {
            if (isInvalidFolderMove(droppedFolderId, targetFolderId, logic.folders || [])) {
                console.warn('🚫 BLOCKED: Circular dependency detected.');
                return true;
            }

            const droppedFolder = ((logic.folders || []) as any[]).find(f => f.id === droppedFolderId);
            if (!droppedFolder) return;
            const currentParentId = droppedFolder.parentId || null;

            if (isEditorLeavingRootSharedBoundary(currentParentId || droppedFolder.id, targetFolderId || null)) {
                return true;
            }

            const targetFolder = ((logic.folders || []) as any[]).find(f => f.id === targetFolderId);
            if (droppedFolder && droppedFolder.isShared && (!targetFolder || !targetFolder.isShared)) {
                if (droppedFolder.parentId) {
                    const parentFolder = ((logic.folders || []) as any[]).find(f => f.id === droppedFolder.parentId);
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
                                registerFolderMoveUndo(droppedFolderId, currentParentId || null, targetFolderId || null);
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
                            registerFolderMoveUndo(droppedFolderId, currentParentId || null, targetFolderId || null);
                            closeShareConfirm();
                        },
                        onMergeConfirm: async () => {
                            const { mergedUids, mergedSharedWith } = await mergeTargetFolderShares(targetFolderId, droppedSharedUids, getSharedWithEntries(droppedFolder));
                            await syncSharedStateToFolderTree(targetFolderId, mergedUids, mergedSharedWith);
                            await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
                            registerFolderMoveUndo(droppedFolderId, currentParentId || null, targetFolderId || null);
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
                            registerFolderMoveUndo(droppedFolderId, currentParentId || null, targetFolderId || null);
                            setShareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null, batchPreview: null });
                        }
                    });
                    return true;
                }
            }
            moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
            registerFolderMoveUndo(droppedFolderId, currentParentId || null, targetFolderId || null);
            return true;
        }
    };

    const handleNestFolder = async (targetFolderId, droppedFolderId, droppedFolderShortcutId = null, moveOptions: any = null) => {
        if (isViewerInsideSharedFolder) {
            return 'blocked';
        }

        const inferredShortcutId = droppedFolderShortcutId || resolveFolderShortcutId(droppedFolderId, logic.currentFolder?.id || null);

        if (inferredShortcutId && logic?.moveShortcut) {
            return await moveShortcutOrRequest(
                inferredShortcutId,
                targetFolderId || null,
                'folder',
                droppedFolderId,
                logic.currentFolder?.id || null,
                moveOptions
            );
        }

        if (!canWriteIntoTargetFolder(targetFolderId)) {
            return 'blocked';
        }
        if (targetFolderId === droppedFolderId) return 'noop';

        const droppedFolderSource = ((logic.folders || []) as any[]).find(f => f.id === droppedFolderId);
        const userCanEditSource = droppedFolderSource && currentUserId ? canEdit(droppedFolderSource, currentUserId) : false;
        if (!userCanEditSource) {
            return 'blocked';
        }

        if (isInvalidFolderMove(droppedFolderId, targetFolderId, logic.folders || [])) {
            console.warn('🚫 BLOCKED: Circular dependency detected.');
            return 'blocked';
        }

        const droppedFolder = ((logic.folders || []) as any[]).find(f => f.id === droppedFolderId);
        if (!droppedFolder) return 'blocked';
        const currentParentId = droppedFolder.parentId || null;

        if (isEditorLeavingRootSharedBoundary(currentParentId || droppedFolder.id, targetFolderId || null)) {
            return 'blocked';
        }

        const targetFolder = ((logic.folders || []) as any[]).find(f => f.id === targetFolderId);

        const getSharedUids = item => (item && Array.isArray(item.sharedWithUids) ? item.sharedWithUids : []);

        const executeFolderUnshareMove = async () => {
            const oldSharedWithUids = Array.isArray(droppedFolder.sharedWithUids) ? droppedFolder.sharedWithUids : [];
            await updateFolder(droppedFolderId, {
                sharedWith: [],
                sharedWithUids: [],
                isShared: false
            });
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
            registerFolderMoveUndo(droppedFolderId, currentParentId || null, targetFolderId || null);
        };

        const executeFolderSharedMismatchAlign = async () => {
            await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
            registerFolderMoveUndo(droppedFolderId, currentParentId || null, targetFolderId || null);
        };

        const executeFolderSharedMismatchMerge = async () => {
            const droppedSharedUids = getSharedUids(droppedFolder);
            const { mergedUids, mergedSharedWith } = await mergeTargetFolderShares(targetFolderId, droppedSharedUids, getSharedWithEntries(droppedFolder));
            await syncSharedStateToFolderTree(targetFolderId, mergedUids, mergedSharedWith);
            await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
            registerFolderMoveUndo(droppedFolderId, currentParentId || null, targetFolderId || null);
        };

        const executeFolderShareToTarget = async () => {
            await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId);
            registerFolderMoveUndo(droppedFolderId, currentParentId || null, targetFolderId || null);
        };

        if (droppedFolder && droppedFolder.isShared && (!targetFolder || !targetFolder.isShared) && droppedFolder.parentId) {
            const parentFolder = ((logic.folders || []) as any[]).find(f => f.id === droppedFolder.parentId);
            if (parentFolder && parentFolder.isShared) {
                const unshareDecision = getBatchDecision(moveOptions, 'folderUnshareMove');
                if (unshareDecision === 'remove') {
                    await executeFolderUnshareMove();
                    return 'moved';
                }

                setUnshareConfirm({
                    open: true,
                    subjectId: null,
                    folder: droppedFolder,
                    batchPreview: resolveBatchPreview(moveOptions, [{
                        type: 'folder',
                        item: droppedFolder || { id: droppedFolderId, name: droppedFolder?.name || '' }
                    }]),
                    onConfirm: async () => {
                        await executeFolderUnshareMove();
                        setBatchDecision(moveOptions, 'folderUnshareMove', 'remove');
                        closeUnshareConfirm();
                        await notifyDeferredResolved(moveOptions, { moved: true });
                    },
                    onCancel: () => notifyDeferredCancelled(moveOptions)
                });
                return 'deferred';
            }
        }

        if (targetFolder && targetFolder.isShared) {
            const droppedSharedUids = getSharedUids(droppedFolder);
            const targetShared = getSharedUids(targetFolder);
            if (droppedSharedUids.length > 0 && !areSharedSetsEqual(droppedSharedUids, targetShared)) {
                const sharedMismatchDecision = getBatchDecision(moveOptions, 'folderSharedMismatch');
                if (sharedMismatchDecision === 'align') {
                    await executeFolderSharedMismatchAlign();
                    return 'moved';
                }

                if (sharedMismatchDecision === 'merge') {
                    await executeFolderSharedMismatchMerge();
                    return 'moved';
                }

                setShareConfirm({
                    open: true,
                    type: 'shared-mismatch-move',
                    folder: targetFolder,
                    subjectId: null,
                    batchPreview: resolveBatchPreview(moveOptions, [{
                        type: 'folder',
                        item: droppedFolder || { id: droppedFolderId, name: droppedFolder?.name || '' }
                    }]),
                    sourceType: 'folder',
                    sourceName: droppedFolder?.name || '',
                    onConfirm: async () => {
                        await executeFolderSharedMismatchAlign();
                        setBatchDecision(moveOptions, 'folderSharedMismatch', 'align');
                        closeShareConfirm();
                        await notifyDeferredResolved(moveOptions, { moved: true });
                    },
                    onMergeConfirm: async () => {
                        await executeFolderSharedMismatchMerge();
                        setBatchDecision(moveOptions, 'folderSharedMismatch', 'merge');
                        closeShareConfirm();
                        await notifyDeferredResolved(moveOptions, { moved: true });
                    },
                    onCancel: () => notifyDeferredCancelled(moveOptions)
                });
                return 'deferred';
            }

            const droppedShared = new Set(droppedSharedUids);
            const newUsers = targetShared.filter(uid => !droppedShared.has(uid));
            if (newUsers.length > 0) {
                const shareDecision = getBatchDecision(moveOptions, 'folderShareToTarget');
                if (shareDecision === 'confirm') {
                    await executeFolderShareToTarget();
                    return 'moved';
                }

                setShareConfirm({
                    open: true,
                    folder: targetFolder,
                    subjectId: null,
                    batchPreview: resolveBatchPreview(moveOptions, [{
                        type: 'folder',
                        item: droppedFolder || { id: droppedFolderId, name: droppedFolder?.name || '' }
                    }]),
                    onConfirm: async () => {
                        await executeFolderShareToTarget();
                        setBatchDecision(moveOptions, 'folderShareToTarget', 'confirm');
                        setShareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null, batchPreview: null });
                        await notifyDeferredResolved(moveOptions, { moved: true });
                    },
                    onCancel: () => notifyDeferredCancelled(moveOptions)
                });
                return 'deferred';
            }
        }
        await moveFolderToParent(droppedFolderId, currentParentId, targetFolderId, { preserveSharing: true });
        registerFolderMoveUndo(droppedFolderId, currentParentId || null, targetFolderId || null);
        return 'moved';
    };

    const handlePromoteSubjectWrapper = async (subjectId: any, subjectShortcutId: any = null) => {
        if (isViewerInsideSharedFolder) return;

        const currentFolder: any = logic.currentFolder;
        const parentId = currentFolder ? currentFolder.parentId : null;

        if (subjectShortcutId && logic?.moveShortcut) {
            await moveShortcutOrRequest(subjectShortcutId, parentId || null, 'subject', subjectId, currentFolder?.id || null);
            return;
        }

        const sourceFolder: any = currentFolder;
        let targetFolder: any = null;
        if (parentId) {
            targetFolder = ((logic.folders || []) as any[]).find(f => f.id === parentId);
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
                    registerSubjectMoveUndo(subjectId, currentFolder.id, parentId || null);
                    closeUnshareConfirm();
                },
                onPreserveConfirm: async () => {
                    await moveSubjectBetweenFolders(subjectId, currentFolder.id, parentId, { preserveSharing: true });
                    registerSubjectMoveUndo(subjectId, currentFolder.id, parentId || null);
                    closeUnshareConfirm();
                },
            });
            return;
        }

        if (currentFolder) {
            await moveSubjectToParent(subjectId, currentFolder.id, parentId);
            registerSubjectMoveUndo(subjectId, currentFolder.id, parentId || null);
        }
    };

    const handlePromoteFolderWrapper = async (folderId: any, folderShortcutId: any = null) => {
        if (isViewerInsideSharedFolder) return;

        const resolvedShortcutId = folderShortcutId || resolveFolderShortcutId(folderId, logic.currentFolder?.id || null);

        if (resolvedShortcutId && logic?.moveShortcut) {
            const parentId = logic.currentFolder ? logic.currentFolder.parentId : null;
            await moveShortcutOrRequest(
                resolvedShortcutId,
                parentId || null,
                'folder',
                folderId,
                logic.currentFolder?.id || null
            );
            return;
        }

            const sourceFolder = ((logic.folders || []) as any[]).find(f => f.id === folderId);
        const userCanEditSource = sourceFolder && currentUserId ? canEdit(sourceFolder, currentUserId) : false;
        if (!userCanEditSource) {
            return;
        }

        if (logic.currentFolder && folderId !== logic.currentFolder.id) {
            const currentFolder: any = logic.currentFolder;
            const parentId = currentFolder.parentId;
            const sourceFolder: any = currentFolder;

            if (isEditorLeavingRootSharedBoundary(currentFolder?.id || null, parentId || null)) {
                return;
            }

            let targetFolder: any = null;
            if (parentId) {
                targetFolder = ((logic.folders || []) as any[]).find(f => f.id === parentId);
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
                        registerFolderMoveUndo(folderId, currentFolder.id, parentId || null);
                        closeUnshareConfirm();
                    }
                });
                return;
            }
            await moveFolderToParent(folderId, currentFolder.id, parentId);
            registerFolderMoveUndo(folderId, currentFolder.id, parentId || null);
        }
    };

    const handleShowFolderContents = folder => {
        setFolderContentsModalConfig({ isOpen: true, folder });
    };

    const handleNavigateFromTree = folder => {
        setFolderContentsModalConfig({ isOpen: false, folder: null });
        logic.setCurrentFolder(folder);
        if (rememberOrganization && folder && folder.id) {
            saveLastHomeFolderId(folder.id);
        }
        if (rememberOrganization && !folder) {
            clearLastHomeFolderId();
        }
    };

    const handleNavigateSubjectFromTree = subject => {
        setFolderContentsModalConfig({ isOpen: false, folder: null });
        logic.navigate(`/home/subject/${subject.id}`);
    };

    const handleTreeMoveSubject = async (subjectId, targetFolderId, sourceFolderId: any) => {
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
                await moveShortcutOrRequest(shortcut.id, targetFolderId || null, 'subject', subjectId, sourceFolderId || null);
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
        registerSubjectMoveUndo(subjectId, sourceFolderId || null, targetFolderId || null);
    };

    const handleTreeReorderSubject = async (folderId, subjectId, newIndex: any) => {
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
        moveSelectionEntryWithShareRules,
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

