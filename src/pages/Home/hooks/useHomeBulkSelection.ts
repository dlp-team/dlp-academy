// src/pages/Home/hooks/useHomeBulkSelection.ts
import React, { useMemo, useRef, useState } from 'react';
import { isShortcutItem } from '../../../utils/permissionUtils';
import { buildBatchConfirmationPreview } from '../utils/homeBatchConfirmationUtils';

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

export const useHomeBulkSelection = ({
    logic,
    isStudentRole,
    onHomeFeedback,
    moveSelectionEntryWithShareRules,
}: HomeBulkSelectionParams) => {
    const [selectMode, setSelectMode] = useState(false);
    const [selectedItemsByKey, setSelectedItemsByKey] = useState<any>({});
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
        if (entries.length === 0) {
            setBulkMoveTargetFolderId('');
        }
    }, []);

    const toggleSelectItem = React.useCallback((item, type: any) => {
        if (!item?.id || !type) return;
        const key = buildSelectionKey(item, type);
        setSelectedItemsByKey((prev: any) => {
            if (prev[key]) {
                const next = { ...prev };
                delete next[key];
                return next;
            }
            const next = {
                ...prev,
                [key]: { key, type, item }
            };

            const selectedEntry = next[key];
            const selectedFolderId = type === 'folder' ? item?.id : null;
            const selectedAncestors = getEntryAncestorFolders(selectedEntry);
            const keysToRemove = new Set<string>();

            Object.entries(next).forEach(([entryKey, entryValue]: any) => {
                if (entryKey === key) return;

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
        });
    }, [buildSelectionKey, getEntryAncestorFolders]);

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
            const batchPreview = buildBatchConfirmationPreview(itemsToMove);
            state = {
                destination,
                batchDecisions: {},
                snapshotsByKey: new Map<string, any>(),
                movedKeys: new Set<string>(),
                failedEntriesByKey: new Map<string, any>(),
                deferredNoticeShown: false,
                batchPreview
            };
            bulkMoveStateRef.current = state;
        }

        for (let index = 0; index < itemsToMove.length; index += 1) {
            const entry: any = itemsToMove[index];
            if (!entry?.key) continue;

            if (!state.snapshotsByKey.has(entry.key)) {
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
            }

            try {
                const moveResult = moveSelectionEntryWithShareRules
                    ? await moveSelectionEntryWithShareRules(entry, destination, {
                        batchDecisions: state.batchDecisions,
                        batchPreview: state.batchPreview,
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
    }, [selectedItemsByKey, moveSelectionEntryWithShareRules, runDefaultMoveForEntry, setSelectionFromEntries, finalizeBulkMoveSession, onHomeFeedback]);

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
