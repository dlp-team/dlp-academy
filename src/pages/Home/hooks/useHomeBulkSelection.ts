// src/pages/Home/hooks/useHomeBulkSelection.ts
import React, { useMemo, useRef, useState } from 'react';
import { isShortcutItem } from '../../../utils/permissionUtils';

const MAX_CONFIRMATION_PREVIEW_NAMES = 5;

type HomeBulkSelectionParams = {
    logic: any;
    isStudentRole: boolean;
    onHomeFeedback: (message: string, tone?: string) => void;
    moveSelectionEntryWithShareRules?: (entry: any, targetFolderId: any, moveOptions?: any) => Promise<any>;
};

const getEntrySourceParentId = (entry: any) => {
    const item = entry?.item;
    if (!item) return null;

    if (entry?.type === 'subject') {
        return item?.shortcutParentId ?? item?.folderId ?? item?.parentId ?? null;
    }

    if (entry?.type === 'folder') {
        return item?.shortcutParentId ?? item?.parentId ?? null;
    }

    return null;
};

const collectBlockedFolderDestinationIds = (selectedEntries: any[] = [], allFolders: any[] = []) => {
    const selectedFolderIds = new Set(
        selectedEntries
            .filter((entry: any) => entry?.type === 'folder' && entry?.item?.id)
            .map((entry: any) => entry.item.id)
    );

    if (selectedFolderIds.size === 0) {
        return selectedFolderIds;
    }

    const childrenByParent = new Map<any, any[]>();
    (allFolders || []).forEach((folder: any) => {
        const parentId = folder?.parentId ?? null;
        if (!parentId || !folder?.id) return;

        const siblings = childrenByParent.get(parentId) || [];
        siblings.push(folder.id);
        childrenByParent.set(parentId, siblings);
    });

    const blockedIds = new Set(selectedFolderIds);
    const queue = Array.from(selectedFolderIds);

    while (queue.length > 0) {
        const current = queue.shift();
        const children = childrenByParent.get(current) || [];
        children.forEach((childId: any) => {
            if (blockedIds.has(childId)) return;
            blockedIds.add(childId);
            queue.push(childId);
        });
    }

    return blockedIds;
};

const normalizeMoveStatus = (result: any) => {
    if (!result) return 'skipped';
    if (typeof result === 'string') return result;
    if (typeof result?.status === 'string') return result.status;
    if (result?.moved === true) return 'moved';
    if (result?.deferred === true) return 'deferred';
    return 'skipped';
};

const resolveSelectionEntryDisplayName = (entry: any) => {
    const itemName = String(entry?.item?.name || '').trim();
    if (itemName) return itemName;
    return entry?.type === 'folder' ? 'Carpeta' : 'Asignatura';
};

const buildMoveConfirmationPreview = (entries: any[] = []) => {
    const names = (Array.isArray(entries) ? entries : [])
        .map(resolveSelectionEntryDisplayName)
        .filter(Boolean);

    return {
        totalCount: names.length,
        visibleNames: names.slice(0, MAX_CONFIRMATION_PREVIEW_NAMES),
        hiddenCount: Math.max(0, names.length - MAX_CONFIRMATION_PREVIEW_NAMES),
    };
};

export const useHomeBulkSelection = ({
    logic,
    isStudentRole,
    onHomeFeedback,
    moveSelectionEntryWithShareRules,
}: HomeBulkSelectionParams) => {
    const [selectMode, setSelectMode] = useState(false);
    const [selectedItemsByKey, setSelectedItemsByKey] = useState<any>({});
    const [selectionAnchorKey, setSelectionAnchorKey] = useState<string | null>(null);
    const [bulkMoveTargetFolderId, setBulkMoveTargetFolderId] = useState('');
    const [undoToast, setUndoToast] = useState<any>(null);
    const undoTimeoutRef = useRef<any>(null);
    const bulkMoveStateRef = useRef<any>(null);

    const selectedItems = useMemo(() => Object.values(selectedItemsByKey), [selectedItemsByKey]);
    const selectedItemKeys = useMemo(() => new Set(Object.keys(selectedItemsByKey)), [selectedItemsByKey]);
    const folderById = useMemo(() => {
        const sourceFolders = Array.isArray(logic?.folders) ? logic.folders : [];
        return sourceFolders.reduce((map: Map<string, any>, folder: any) => {
            if (!folder?.id) return map;
            map.set(folder.id, folder);
            return map;
        }, new Map<string, any>());
    }, [logic?.folders]);

    const availableMoveFolders = useMemo(() => {
        const allFolders = Array.isArray(logic?.folders) ? logic.folders : [];
        if (allFolders.length === 0) return [];

        const blockedFolderIds = collectBlockedFolderDestinationIds(selectedItems, allFolders);
        return allFolders.filter((folder: any) => !blockedFolderIds.has(folder?.id));
    }, [logic?.folders, selectedItems]);

    const buildSelectionKey = React.useCallback((item, type) => `${type}:${item?.shortcutId || item?.id}`, []);

    const getFolderAncestorChain = React.useCallback((folderId: any) => {
        const ancestors: any[] = [];
        let cursor = folderId || null;
        const visited = new Set<any>();

        while (cursor && !visited.has(cursor)) {
            ancestors.push(cursor);
            visited.add(cursor);
            const folder = folderById.get(cursor);
            cursor = folder?.parentId ?? null;
        }

        return ancestors;
    }, [folderById]);

    const getEntryAncestorFolders = React.useCallback((entry: any) => {
        const item = entry?.item;
        if (!item) return [];

        if (entry?.type === 'folder') {
            const parentFolderId = item?.shortcutParentId ?? item?.parentId ?? folderById.get(item?.id)?.parentId ?? null;
            return getFolderAncestorChain(parentFolderId);
        }

        const parentFolderId = item?.shortcutParentId ?? item?.folderId ?? item?.parentId ?? null;
        return getFolderAncestorChain(parentFolderId);
    }, [folderById, getFolderAncestorChain]);

    const clearSelection = React.useCallback(() => {
        setSelectedItemsByKey({});
        setSelectionAnchorKey(null);
        setBulkMoveTargetFolderId('');
    }, []);

    const clearUndoToast = React.useCallback(() => {
        if (undoTimeoutRef.current) {
            window.clearTimeout(undoTimeoutRef.current);
            undoTimeoutRef.current = null;
        }
        setUndoToast(null);
    }, []);

    const pushUndoToast = React.useCallback((payload: any) => {
        if (!payload || typeof payload?.undo !== 'function') return;

        if (undoTimeoutRef.current) {
            window.clearTimeout(undoTimeoutRef.current);
        }

        setUndoToast(payload);
        undoTimeoutRef.current = window.setTimeout(() => {
            setUndoToast(null);
            undoTimeoutRef.current = null;
        }, 5000);
    }, []);

    const undoLastSelectionAction = React.useCallback(async () => {
        if (!undoToast || typeof undoToast?.undo !== 'function') return;
        const currentUndo = undoToast;
        clearUndoToast();

        try {
            await currentUndo.undo();
            onHomeFeedback(currentUndo.successMessage || 'Accion deshecha.', 'success');
        } catch {
            onHomeFeedback('No se pudo deshacer la ultima accion.', 'error');
        }
    }, [undoToast, clearUndoToast, onHomeFeedback]);

    const setSelectionFromEntries = React.useCallback((entries: any[] = []) => {
        const nextSelection: any = {};
        entries.forEach((entry: any) => {
            if (!entry?.key) return;
            nextSelection[entry.key] = entry;
        });
        setSelectedItemsByKey(nextSelection);
        setSelectionAnchorKey(entries.length > 0 ? entries[entries.length - 1]?.key || null : null);
        if (entries.length === 0) {
            setBulkMoveTargetFolderId('');
        }
    }, []);

    const mergeEntryIntoSelectionMap = React.useCallback((selectionMap: any, entry: any) => {
        if (!entry?.key || !entry?.item?.id || !entry?.type) {
            return selectionMap;
        }

        const next = {
            ...selectionMap,
            [entry.key]: entry
        };

        const selectedFolderId = entry?.type === 'folder' ? entry?.item?.id : null;
        const selectedAncestors = getEntryAncestorFolders(entry);
        const keysToRemove = new Set<string>();

        Object.entries(next).forEach(([entryKey, entryValue]: any) => {
            if (entryKey === entry.key) return;

            if (entryValue?.type === 'folder' && selectedAncestors.includes(entryValue?.item?.id)) {
                keysToRemove.add(entryKey);
                return;
            }

            if (!selectedFolderId) return;
            const entryAncestors = getEntryAncestorFolders(entryValue);
            if (entryAncestors.includes(selectedFolderId)) {
                keysToRemove.add(entryKey);
            }
        });

        keysToRemove.forEach((entryKey: string) => {
            delete next[entryKey];
        });

        return next;
    }, [getEntryAncestorFolders]);

    const startSelectionWithItem = React.useCallback((item: any, type: any) => {
        if (!item?.id || !type) return;
        const key = buildSelectionKey(item, type);
        setSelectedItemsByKey({
            [key]: { key, type, item }
        });
        setSelectionAnchorKey(key);
        setBulkMoveTargetFolderId('');
        setSelectMode(true);
    }, [buildSelectionKey]);

    const selectRangeToItem = React.useCallback((item: any, type: any, orderedEntries: any[] = [], options: any = {}) => {
        if (!item?.id || !type) return;

        const targetKey = buildSelectionKey(item, type);
        const normalizedOrderedEntries = (Array.isArray(orderedEntries) ? orderedEntries : [])
            .map((entry: any) => {
                if (!entry) return null;

                if (entry?.key && entry?.item?.id && entry?.type) {
                    return entry;
                }

                if (entry?.item?.id && entry?.type) {
                    return {
                        key: buildSelectionKey(entry.item, entry.type),
                        type: entry.type,
                        item: entry.item
                    };
                }

                return null;
            })
            .filter(Boolean);

        const entryByKey = new Map<string, any>();
        normalizedOrderedEntries.forEach((entry: any) => {
            if (!entryByKey.has(entry.key)) {
                entryByKey.set(entry.key, entry);
            }
        });

        const targetEntry = entryByKey.get(targetKey) || { key: targetKey, type, item };
        if (!entryByKey.has(targetKey)) {
            normalizedOrderedEntries.push(targetEntry);
            entryByKey.set(targetKey, targetEntry);
        }

        const orderedKeys = normalizedOrderedEntries.map((entry: any) => entry.key);
        const targetIndex = orderedKeys.indexOf(targetKey);

        const anchorCandidate = selectionAnchorKey && orderedKeys.includes(selectionAnchorKey)
            ? selectionAnchorKey
            : targetKey;
        const anchorIndex = orderedKeys.indexOf(anchorCandidate);

        const replaceSelection = options?.replaceSelection === true;

        setSelectedItemsByKey((prev: any) => {
            let next = replaceSelection ? {} : { ...prev };

            if (targetIndex === -1 || anchorIndex === -1) {
                return mergeEntryIntoSelectionMap(next, targetEntry);
            }

            const start = Math.min(anchorIndex, targetIndex);
            const end = Math.max(anchorIndex, targetIndex);

            for (let index = start; index <= end; index += 1) {
                const rangeKey = orderedKeys[index];
                const rangeEntry = entryByKey.get(rangeKey);
                next = mergeEntryIntoSelectionMap(next, rangeEntry);
            }

            if (!next[targetKey]) {
                next = mergeEntryIntoSelectionMap(next, targetEntry);
            }

            return next;
        });

        setSelectionAnchorKey(targetKey);
        setSelectMode(true);
    }, [buildSelectionKey, mergeEntryIntoSelectionMap, selectionAnchorKey]);

    const toggleSelectItem = React.useCallback((item, type: any, options: any = {}) => {
        if (!item?.id || !type) return;
        const key = buildSelectionKey(item, type);
        setSelectedItemsByKey((prev: any) => {
            if (prev[key] && options?.forceAdd !== true) {
                const next = { ...prev };
                delete next[key];
                return next;
            }
            const nextEntry = { key, type, item };
            return mergeEntryIntoSelectionMap(prev, nextEntry);
        });
        setSelectionAnchorKey(key);
        if (options?.ensureSelectMode) {
            setSelectMode(true);
        }
    }, [buildSelectionKey, mergeEntryIntoSelectionMap]);

    const runDefaultMoveForEntry = React.useCallback(async (entry: any, destination: any) => {
        const item = entry?.item;
        const type = entry?.type;
        if (!item?.id || !type) {
            return { status: 'skipped' };
        }

        if (type === 'subject') {
            if (isShortcutItem(item) && item?.shortcutId && logic?.moveShortcut) {
                await logic.moveShortcut(item.shortcutId, destination);
                return { status: 'moved' };
            }

            await logic.updateSubject(item.id, { folderId: destination });
            return { status: 'moved' };
        }

        if (type === 'folder') {
            if (destination && item.id === destination) {
                return { status: 'skipped' };
            }

            if (isShortcutItem(item) && item?.shortcutId && logic?.moveShortcut) {
                await logic.moveShortcut(item.shortcutId, destination);
                return { status: 'moved' };
            }

            await logic.updateFolder(item.id, { parentId: destination });
            return { status: 'moved' };
        }

        return { status: 'skipped' };
    }, [logic]);

    const canUseParallelSubjectMove = React.useCallback((entries: any[] = [], destination: any) => {
        if (!Array.isArray(entries) || entries.length === 0) return false;

        const targetFolder = destination ? folderById.get(destination) : null;
        if (targetFolder?.isShared === true) return false;

        return entries.every((entry: any) => {
            if (entry?.type !== 'subject') return false;
            const item = entry?.item;
            if (!item?.id) return false;
            if (isShortcutItem(item) && item?.shortcutId) return false;
            if (item?.isShared === true) return false;

            const sourceParentId = getEntrySourceParentId(entry);
            const sourceFolder = sourceParentId ? folderById.get(sourceParentId) : null;
            if (sourceFolder?.isShared === true) return false;

            return true;
        });
    }, [folderById]);

    const ensureSnapshotForEntry = React.useCallback((state: any, entry: any) => {
        if (!state || !entry?.key) return;
        if (state.snapshotsByKey.has(entry.key)) return;

        state.snapshotsByKey.set(entry.key, {
            key: entry.key,
            type: entry?.type,
            id: entry?.item?.id,
            shortcutId: entry?.item?.shortcutId || null,
            previousParentId: getEntrySourceParentId(entry),
            previousSharedWithUids: Array.isArray(entry?.item?.sharedWithUids)
                ? [...entry.item.sharedWithUids]
                : null,
            previousSharedWith: Array.isArray(entry?.item?.sharedWith)
                ? [...entry.item.sharedWith]
                : null,
            previousIsShared: typeof entry?.item?.isShared === 'boolean'
                ? entry.item.isShared
                : null,
            entry
        });
    }, []);

    const finalizeBulkMoveSession = React.useCallback((options: any = {}) => {
        const state = bulkMoveStateRef.current;
        if (!state) return;

        const preserveSelection = options?.preserveSelection === true;
        const undoSnapshots: any[] = (Array.from(state.snapshotsByKey.values()) as any[]).filter(
            (snapshot: any) => state.movedKeys.has(snapshot?.key)
        );
        const failedEntries: any[] = (Array.from(state.failedEntriesByKey.values()) as any[]).filter(
            (entry: any) => entry?.key && !state.movedKeys.has(entry.key)
        );
        const movedCount = undoSnapshots.length;

        if (!preserveSelection) {
            if (failedEntries.length > 0) {
                setSelectionFromEntries(failedEntries);
                setSelectMode(true);
            } else {
                clearSelection();
                setSelectMode(false);
            }
        }

        if (preserveSelection) {
            if (movedCount > 0) {
                onHomeFeedback(`Se movieron ${movedCount} elemento(s). Se canceló la confirmacion para los pendientes.`, 'warning');
            } else {
                onHomeFeedback('Se canceló la confirmacion de movimiento por lotes.', 'warning');
            }
        } else if (failedEntries.length > 0) {
            if (movedCount === 0) {
                onHomeFeedback('No se pudieron mover los elementos seleccionados por permisos o conflictos.', 'error');
            } else {
                onHomeFeedback(`Se movieron ${movedCount} elemento(s) y ${failedEntries.length} no se pudieron mover.`, 'warning');
            }
        } else {
            onHomeFeedback(`Se movieron ${movedCount} elemento(s).`, 'success');
        }

        if (undoSnapshots.length > 0) {
            pushUndoToast({
                message: `Movimiento aplicado en ${undoSnapshots.length} elemento(s).`,
                actionLabel: 'Deshacer',
                successMessage: 'Movimiento deshecho correctamente.',
                undo: async () => {
                    for (const snapshot of undoSnapshots) {
                        if (snapshot?.shortcutId && logic?.moveShortcut) {
                            await logic.moveShortcut(snapshot.shortcutId, snapshot.previousParentId || null);
                            continue;
                        }

                        if (snapshot?.type === 'subject') {
                            const subjectUndoPayload: any = {
                                folderId: snapshot.previousParentId || null,
                            };

                            if (Array.isArray(snapshot.previousSharedWithUids)) {
                                subjectUndoPayload.sharedWithUids = [...snapshot.previousSharedWithUids];
                            }

                            if (Array.isArray(snapshot.previousSharedWith)) {
                                subjectUndoPayload.sharedWith = [...snapshot.previousSharedWith];
                            }

                            if (typeof snapshot.previousIsShared === 'boolean') {
                                subjectUndoPayload.isShared = snapshot.previousIsShared;
                            }

                            await logic.updateSubject(snapshot.id, subjectUndoPayload);
                            continue;
                        }

                        if (snapshot?.type === 'folder') {
                            const folderUndoPayload: any = {
                                parentId: snapshot.previousParentId || null,
                            };

                            if (Array.isArray(snapshot.previousSharedWithUids)) {
                                folderUndoPayload.sharedWithUids = [...snapshot.previousSharedWithUids];
                            }

                            if (Array.isArray(snapshot.previousSharedWith)) {
                                folderUndoPayload.sharedWith = [...snapshot.previousSharedWith];
                            }

                            if (typeof snapshot.previousIsShared === 'boolean') {
                                folderUndoPayload.isShared = snapshot.previousIsShared;
                            }

                            await logic.updateFolder(snapshot.id, folderUndoPayload);
                        }
                    }

                    clearSelection();
                    setSelectMode(false);
                }
            });
        }

        bulkMoveStateRef.current = null;
    }, [clearSelection, onHomeFeedback, pushUndoToast, setSelectionFromEntries, logic]);

    const runBulkMoveToFolder = React.useCallback(async function runBulkMoveToFolderInternal(targetFolderId: any, options: any = {}) {
        const destination = targetFolderId || null;
        const itemsToMove = Array.isArray(options?.entriesOverride)
            ? options.entriesOverride
            : Object.values(selectedItemsByKey);

        if (itemsToMove.length === 0) {
            if (options?.isContinuation && bulkMoveStateRef.current) {
                finalizeBulkMoveSession();
            }
            return;
        }

        let state = bulkMoveStateRef.current;
        const isContinuation = options?.isContinuation === true;
        if (!isContinuation || !state || state.destination !== destination) {
            state = {
                destination,
                batchDecisions: {},
                confirmationPreview: options?.confirmationPreview || buildMoveConfirmationPreview(itemsToMove),
                snapshotsByKey: new Map<string, any>(),
                movedKeys: new Set<string>(),
                failedEntriesByKey: new Map<string, any>(),
                deferredNoticeShown: false
            };
            bulkMoveStateRef.current = state;
        }

        const shouldUseFastParallelMove = (
            !isContinuation
            && typeof moveSelectionEntryWithShareRules === 'function'
            && canUseParallelSubjectMove(itemsToMove as any[], destination)
        );

        if (shouldUseFastParallelMove) {
            const settledResults = await Promise.allSettled(
                itemsToMove.map(async (entry: any) => {
                    ensureSnapshotForEntry(state, entry);
                    const result = await runDefaultMoveForEntry(entry, destination);
                    return {
                        entry,
                        status: normalizeMoveStatus(result)
                    };
                })
            );

            settledResults.forEach((result: any, index: number) => {
                const fallbackEntry = itemsToMove[index];
                const resolvedEntry = result.status === 'fulfilled' ? result.value?.entry : fallbackEntry;
                const resolvedKey = resolvedEntry?.key;
                const status = result.status === 'fulfilled'
                    ? result.value?.status
                    : 'skipped';

                if (!resolvedKey) return;

                if (status === 'moved') {
                    state.movedKeys.add(resolvedKey);
                    state.failedEntriesByKey.delete(resolvedKey);
                    return;
                }

                state.failedEntriesByKey.set(resolvedKey, resolvedEntry);
            });

            finalizeBulkMoveSession();
            return;
        }

        for (let index = 0; index < itemsToMove.length; index += 1) {
            const entry: any = itemsToMove[index];
            if (!entry?.key) continue;
            ensureSnapshotForEntry(state, entry);

            try {
                const moveResult = moveSelectionEntryWithShareRules
                    ? await moveSelectionEntryWithShareRules(entry, destination, {
                        batchDecisions: state.batchDecisions,
                        confirmationPreview: state.confirmationPreview,
                        skipShortcutUndo: true,
                        setBatchDecision: (key: any, value: any) => {
                            state.batchDecisions[key] = value;
                        },
                        entryKey: entry.key,
                        onDeferredResolved: async (payload: any = {}) => {
                            const resolvedKey = payload?.key || entry.key;
                            if (payload?.moved === true && resolvedKey && state.snapshotsByKey.has(resolvedKey)) {
                                state.movedKeys.add(resolvedKey);
                                state.failedEntriesByKey.delete(resolvedKey);
                            }

                            const pendingEntries = itemsToMove.slice(index);
                            const remainingEntries = pendingEntries.filter((candidate: any) => candidate?.key !== resolvedKey);

                            setSelectionFromEntries(remainingEntries);
                            setSelectMode(true);

                            if (remainingEntries.length === 0) {
                                finalizeBulkMoveSession();
                                return;
                            }

                            await runBulkMoveToFolderInternal(destination, {
                                isContinuation: true,
                                entriesOverride: remainingEntries
                            });
                        },
                        onDeferredCancelled: () => {
                            finalizeBulkMoveSession({ preserveSelection: true });
                        }
                    })
                    : await runDefaultMoveForEntry(entry, destination);

                const status = normalizeMoveStatus(moveResult);

                if (status === 'deferred') {
                    const deferredEntries = itemsToMove.slice(index);
                    setSelectionFromEntries(deferredEntries);
                    setSelectMode(true);

                    if (!state.deferredNoticeShown) {
                        onHomeFeedback(
                            `Revisa la confirmacion para completar ${deferredEntries.length} elemento(s) pendiente(s).`,
                            'warning'
                        );
                        state.deferredNoticeShown = true;
                    }

                    return;
                }

                if (status === 'moved') {
                    state.movedKeys.add(entry.key);
                    state.failedEntriesByKey.delete(entry.key);
                    continue;
                }

                state.failedEntriesByKey.set(entry.key, entry);
            } catch {
                state.failedEntriesByKey.set(entry.key, entry);
            }
        }

        finalizeBulkMoveSession();
    }, [selectedItemsByKey, moveSelectionEntryWithShareRules, runDefaultMoveForEntry, setSelectionFromEntries, finalizeBulkMoveSession, onHomeFeedback, canUseParallelSubjectMove, ensureSnapshotForEntry]);

    const handleBulkDelete = React.useCallback(async () => {
        const itemsToDelete = Object.values(selectedItemsByKey);
        if (itemsToDelete.length === 0) return;

        const settledResults = await Promise.allSettled(
            itemsToDelete.map(async (entry: any) => {
                const item = entry?.item;
                const type = entry?.type;
                if (!item?.id || !type) {
                    return { deleted: false, skipped: true, entry };
                }

                try {
                    if (isShortcutItem(item) && item?.shortcutId) {
                        if (item?.isOrphan) {
                            await logic.deleteShortcut(item.shortcutId, { moveToBin: true });
                        } else {
                            await logic.deleteShortcut(item.shortcutId);
                        }
                        return { deleted: true, entry };
                    }

                    if (type === 'subject') {
                        await logic.deleteSubject(item.id);
                        return { deleted: true, entry };
                    }

                    await logic.deleteFolder(item.id);
                    return { deleted: true, entry };
                } catch (error: any) {
                    const wrappedError: any = new Error(error?.message || 'No se pudo eliminar el elemento.');
                    wrappedError.entry = entry;
                    throw wrappedError;
                }
            })
        );

        let deleted = 0;
        const failedEntries: any[] = [];

        settledResults.forEach((result: any) => {
            if (result.status === 'fulfilled') {
                if (result.value?.deleted) deleted += 1;
                return;
            }

            if (result.reason?.entry) {
                failedEntries.push(result.reason.entry);
            }
        });

        if (failedEntries.length > 0) {
            setSelectionFromEntries(failedEntries);
            setSelectMode(true);
        } else {
            clearSelection();
            setSelectMode(false);
        }

        if (failedEntries.length === 0) {
            onHomeFeedback(`Se eliminaron ${deleted} elemento(s).`, 'success');
        } else if (deleted === 0) {
            onHomeFeedback('No se pudieron eliminar los elementos seleccionados por permisos o dependencias.', 'error');
        } else {
            onHomeFeedback(`Se eliminaron ${deleted} elemento(s) y ${failedEntries.length} no se pudieron eliminar.`, 'warning');
        }
    }, [selectedItemsByKey, logic, clearSelection, setSelectionFromEntries, onHomeFeedback]);

    const handleCreateFolderFromSelection = React.useCallback(async () => {
        const itemsToOrganize = Object.values(selectedItemsByKey);
        if (itemsToOrganize.length === 0) return;

        try {
            const createdFolder = await logic.addFolder({
                name: 'Nueva carpeta seleccionada',
                parentId: logic.currentFolder?.id || null,
                color: 'from-amber-400 to-amber-600'
            });

            await runBulkMoveToFolder(createdFolder?.id || null);
            onHomeFeedback('Se creó una carpeta nueva y se procesó la selección.', 'success');
        } catch {
            onHomeFeedback('No se pudo crear la carpeta para organizar la selección.', 'error');
        }
    }, [selectedItemsByKey, logic, runBulkMoveToFolder, onHomeFeedback]);

    React.useEffect(() => {
        if (logic.viewMode === 'shared' || logic.viewMode === 'bin' || isStudentRole) {
            bulkMoveStateRef.current = null;
            setSelectMode(false);
            clearSelection();
            clearUndoToast();
        }
    }, [logic.viewMode, isStudentRole, clearSelection, clearUndoToast]);

    React.useEffect(() => {
        const handleUndoShortcut = (event: any) => {
            if (!(event.ctrlKey || event.metaKey)) return;
            if ((event.key || '').toLowerCase() !== 'z') return;
            if (!undoToast) return;

            event.preventDefault();
            undoLastSelectionAction();
        };

        window.addEventListener('keydown', handleUndoShortcut);
        return () => {
            window.removeEventListener('keydown', handleUndoShortcut);
        };
    }, [undoToast, undoLastSelectionAction]);

    React.useEffect(() => {
        return () => {
            if (undoTimeoutRef.current) {
                window.clearTimeout(undoTimeoutRef.current);
            }
        };
    }, []);

    return {
        selectMode,
        setSelectMode,
        selectedItems,
        selectedItemKeys,
        startSelectionWithItem,
        selectRangeToItem,
        bulkMoveTargetFolderId,
        availableMoveFolders,
        setBulkMoveTargetFolderId,
        clearSelection,
        undoToast,
        undoLastSelectionAction,
        clearUndoToast,
        toggleSelectItem,
        runBulkMoveToFolder,
        handleBulkDelete,
        handleCreateFolderFromSelection
    };
};
