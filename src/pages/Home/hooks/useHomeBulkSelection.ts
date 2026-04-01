// src/pages/Home/hooks/useHomeBulkSelection.ts
import React, { useMemo, useState } from 'react';
import { isShortcutItem } from '../../../utils/permissionUtils';

type HomeBulkSelectionParams = {
    logic: any;
    isStudentRole: boolean;
    onHomeFeedback: (message: string, tone?: string) => void;
};

export const useHomeBulkSelection = ({ logic, isStudentRole, onHomeFeedback }: HomeBulkSelectionParams) => {
    const [selectMode, setSelectMode] = useState(false);
    const [selectedItemsByKey, setSelectedItemsByKey] = useState<any>({});
    const [bulkMoveTargetFolderId, setBulkMoveTargetFolderId] = useState('');

    const selectedItems = useMemo(() => Object.values(selectedItemsByKey), [selectedItemsByKey]);
    const selectedItemKeys = useMemo(() => new Set(Object.keys(selectedItemsByKey)), [selectedItemsByKey]);

    const buildSelectionKey = React.useCallback((item, type) => `${type}:${item?.shortcutId || item?.id}`, []);

    const clearSelection = React.useCallback(() => {
        setSelectedItemsByKey({});
        setBulkMoveTargetFolderId('');
    }, []);

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
            return {
                ...prev,
                [key]: { key, type, item }
            };
        });
    }, [buildSelectionKey]);

    const runBulkMoveToFolder = React.useCallback(async (targetFolderId: any) => {
        const destination = targetFolderId || null;
        const itemsToMove = Object.values(selectedItemsByKey);
        if (itemsToMove.length === 0) return;

        const settledResults = await Promise.allSettled(
            itemsToMove.map(async (entry: any) => {
                const item = entry?.item;
                const type = entry?.type;
                if (!item?.id || !type) {
                    return { moved: false, skipped: true, entry };
                }

                try {
                    if (type === 'subject') {
                        if (isShortcutItem(item) && item?.shortcutId) {
                            await logic.moveShortcut(item.shortcutId, destination);
                            return { moved: true, entry };
                        }

                        await logic.updateSubject(item.id, { folderId: destination });
                        return { moved: true, entry };
                    }

                    if (type === 'folder') {
                        if (destination && item.id === destination) {
                            return { moved: false, skipped: true, entry };
                        }

                        if (isShortcutItem(item) && item?.shortcutId) {
                            await logic.moveShortcut(item.shortcutId, destination);
                            return { moved: true, entry };
                        }

                        await logic.updateFolder(item.id, { parentId: destination });
                        return { moved: true, entry };
                    }

                    return { moved: false, skipped: true, entry };
                } catch (error: any) {
                    const wrappedError: any = new Error(error?.message || 'No se pudo mover el elemento.');
                    wrappedError.entry = entry;
                    throw wrappedError;
                }
            })
        );

        let moved = 0;
        const failedEntries: any[] = [];

        settledResults.forEach((result: any) => {
            if (result.status === 'fulfilled') {
                if (result.value?.moved) moved += 1;
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
            onHomeFeedback(`Se movieron ${moved} elemento(s).`, 'success');
        } else if (moved === 0) {
            onHomeFeedback('No se pudieron mover los elementos seleccionados por permisos o conflictos.', 'error');
        } else {
            onHomeFeedback(`Se movieron ${moved} elemento(s) y ${failedEntries.length} no se pudieron mover.`, 'warning');
        }
    }, [selectedItemsByKey, logic, clearSelection, setSelectionFromEntries, onHomeFeedback]);

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
                        await logic.deleteShortcut(item.shortcutId);
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
            setSelectMode(false);
        } catch {
            onHomeFeedback('No se pudo crear la carpeta para organizar la selección.', 'error');
        }
    }, [selectedItemsByKey, logic, runBulkMoveToFolder, onHomeFeedback]);

    React.useEffect(() => {
        if (logic.viewMode === 'shared' || logic.viewMode === 'bin' || isStudentRole) {
            setSelectMode(false);
            clearSelection();
        }
    }, [logic.viewMode, isStudentRole, clearSelection]);

    return {
        selectMode,
        setSelectMode,
        selectedItems,
        selectedItemKeys,
        bulkMoveTargetFolderId,
        setBulkMoveTargetFolderId,
        clearSelection,
        toggleSelectItem,
        runBulkMoveToFolder,
        handleBulkDelete,
        handleCreateFolderFromSelection
    };
};