// src/hooks/useBinActions.ts
import { isShortcutItemType } from './useBinData';

const useBinActions = (
    binData: any,
    navigate: (path: string) => void,
    getPreviewSafePath: (path: string) => string,
) => {
    const {
        actionLoading,
        selectedItemId,
        selectedItemType,
        visibleTrashedItems,
        selectedBulkEntries,
        bulkSelection,

        setActionLoading,
        setErrorMessage,
        setDeleteConfirm,
        setSelectedItemId,
        setSelectedItemType,
        setFolderBinTrail,
        setSelectionMode,
        setBulkSelection,
        setBulkDeleteConfirmOpen,
        setBulkActionLoading,
        setEmptyConfirmOpen,
        setLoading,

        loadTrashedItems,
        buildActionKey,

        restoreSubject,
        restoreFolder,
        restoreShortcut,
        permanentlyDeleteSubject,
        permanentlyDeleteFolder,
        permanentlyDeleteShortcut,
    } = binData;

    // ── Bulk selection helpers ──────────────────────────────────────────────────

    const clearBulkSelection = () => {
        setBulkSelection({});
    };

    const toggleBulkSelectionMode = () => {
        setSelectionMode((previous: boolean) => {
            const next = !previous;
            if (!next) {
                setBulkSelection({});
                setBulkDeleteConfirmOpen(false);
            }
            return next;
        });
        setSelectedItemId(null);
        setSelectedItemType(null);
    };

    const toggleBulkItemSelection = (itemId: any, itemType: any) => {
        const selectionKey = buildActionKey(itemId, itemType);
        setBulkSelection((previousSelection: any) => {
            if (previousSelection[selectionKey]) {
                const nextSelection = { ...previousSelection };
                delete nextSelection[selectionKey];
                return nextSelection;
            }

            return {
                ...previousSelection,
                [selectionKey]: { id: itemId, itemType },
            };
        });
    };

    const handleSelectAllVisible = () => {
        if (Object.keys(bulkSelection).length === visibleTrashedItems.length) {
            setBulkSelection({});
            return;
        }

        const nextSelection: any = {};
        visibleTrashedItems.forEach((item: any) => {
            const selectionKey = buildActionKey(item.id, item.itemType);
            nextSelection[selectionKey] = { id: item.id, itemType: item.itemType };
        });
        setBulkSelection(nextSelection);
    };

    // ── Bulk actions ───────────────────────────────────────────────────────────

    const handleBulkRestore = async () => {
        if (selectedBulkEntries.length === 0) return;

        setBulkActionLoading(true);
        setErrorMessage(null);

        try {
            const results = await Promise.allSettled(
                selectedBulkEntries.map((entry: any) => {
                    if (entry.itemType === 'folder') return restoreFolder(entry.id);
                    if (isShortcutItemType(entry.itemType)) return restoreShortcut(entry.id);
                    return restoreSubject(entry.id);
                }),
            );

            const failures = results.filter((result: any) => result.status === 'rejected');
            const restoredCount = results.length - failures.length;

            if (failures.length > 0) {
                setErrorMessage(`Se restauraron ${restoredCount} de ${results.length} elementos. Algunos fallaron por permisos insuficientes.`);
            }

            setSelectionMode(false);
            setBulkSelection({});
            setSelectedItemId(null);
            setSelectedItemType(null);
            await loadTrashedItems();
        } catch (err: any) {
            console.error('Error restoring bulk selection:', err);
            setErrorMessage('Error al restaurar los elementos seleccionados. Por favor, intenta mas tarde.');
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleBulkPermanentDelete = async () => {
        if (selectedBulkEntries.length === 0) return;

        setBulkActionLoading(true);
        setErrorMessage(null);

        try {
            const results = await Promise.allSettled(
                selectedBulkEntries.map((entry: any) => {
                    if (entry.itemType === 'folder') return permanentlyDeleteFolder(entry.id);
                    if (isShortcutItemType(entry.itemType)) return permanentlyDeleteShortcut(entry.id);
                    return permanentlyDeleteSubject(entry.id);
                }),
            );

            const failures = results.filter((result: any) => result.status === 'rejected');
            const deletedCount = results.length - failures.length;

            if (failures.length > 0) {
                setErrorMessage(`Se eliminaron ${deletedCount} de ${results.length} elementos. Algunos fallaron por permisos insuficientes.`);
            }

            setSelectionMode(false);
            setBulkSelection({});
            setBulkDeleteConfirmOpen(false);
            setSelectedItemId(null);
            setSelectedItemType(null);
            await loadTrashedItems();
        } catch (err: any) {
            console.error('Error deleting bulk selection:', err);
            setErrorMessage('Error al eliminar permanentemente la selección. Por favor, intenta mas tarde.');
            setBulkDeleteConfirmOpen(false);
        } finally {
            setBulkActionLoading(false);
        }
    };

    // ── Single-item actions ────────────────────────────────────────────────────

    const handleRestore = async (itemId: any, itemType: any) => {
        const actionKey = buildActionKey(itemId, itemType);
        setActionLoading(actionKey);
        setErrorMessage(null);

        try {
            if (itemType === 'folder') {
                await restoreFolder(itemId);
            } else if (isShortcutItemType(itemType)) {
                await restoreShortcut(itemId);
            } else {
                await restoreSubject(itemId);
            }

            if (selectedItemId === itemId && selectedItemType === itemType) {
                setSelectedItemId(null);
                setSelectedItemType(null);
            }

            if (itemType === 'folder') {
                setFolderBinTrail((previousTrail: any[]) => {
                    const targetIndex = previousTrail.findIndex(entry => entry.id === itemId);
                    if (targetIndex === -1) return previousTrail;
                    return previousTrail.slice(0, targetIndex);
                });
            }

            await loadTrashedItems();
        } catch (err: any) {
            console.error('Error restoring trashed item:', err);
            setErrorMessage(
                itemType === 'folder'
                    ? 'No se pudo restaurar la carpeta completa. Verifica tus permisos e intenta nuevamente.'
                    : isShortcutItemType(itemType)
                        ? 'No se pudo restaurar el acceso directo. Verifica tus permisos e intenta nuevamente.'
                        : 'No se pudo restaurar la asignatura. Verifica tus permisos e intenta nuevamente.',
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handlePermanentDelete = async (itemId: any, itemType: any) => {
        const actionKey = buildActionKey(itemId, itemType);
        setActionLoading(actionKey);
        setErrorMessage(null);

        try {
            if (itemType === 'folder') {
                await permanentlyDeleteFolder(itemId);
            } else if (isShortcutItemType(itemType)) {
                await permanentlyDeleteShortcut(itemId);
            } else {
                await permanentlyDeleteSubject(itemId);
            }

            if (selectedItemId === itemId && selectedItemType === itemType) {
                setSelectedItemId(null);
                setSelectedItemType(null);
            }

            if (itemType === 'folder') {
                setFolderBinTrail((previousTrail: any[]) => {
                    const targetIndex = previousTrail.findIndex(entry => entry.id === itemId);
                    if (targetIndex === -1) return previousTrail;
                    return previousTrail.slice(0, targetIndex);
                });
            }

            await loadTrashedItems();
            setDeleteConfirm(null);
        } catch (err: any) {
            console.error('Error permanently deleting trashed item:', err);
            const isPermErr = err?.code === 'permission-denied'
                || err?.message?.includes('permission')
                || err?.message?.includes('insufficient');
            setErrorMessage(
                isPermErr
                    ? 'No tienes permisos para eliminar algunos elementos relacionados. Intenta vaciar la papelera completa o contacta al administrador.'
                    : 'Error al eliminar el elemento. Por favor, intenta mas tarde.',
            );
            setDeleteConfirm(null);
        } finally {
            setActionLoading(null);
        }
    };

    const handleEmptyBin = async () => {
        setLoading(true);
        setErrorMessage(null);
        try {
            const results = await Promise.allSettled(
                visibleTrashedItems.map((item: any) => {
                    if (item.itemType === 'folder') return permanentlyDeleteFolder(item.id);
                    if (isShortcutItemType(item.itemType)) return permanentlyDeleteShortcut(item.id);
                    return permanentlyDeleteSubject(item.id);
                }),
            );

            const failures = results.filter(r => r.status === 'rejected');
            if (failures.length > 0) {
                setErrorMessage(`Se eliminaron ${results.length - failures.length} de ${results.length} elementos. Algunos fallaron por permisos insuficientes.`);
            }

            setSelectedItemId(null);
            setSelectedItemType(null);
            setSelectionMode(false);
            setBulkSelection({});
            setBulkDeleteConfirmOpen(false);

            await loadTrashedItems();
            setEmptyConfirmOpen(false);
        } catch (err: any) {
            console.error('Error emptying bin:', err);
            setErrorMessage('Error al vaciar la papelera. Por favor, intenta mas tarde.');
        } finally {
            setLoading(false);
        }
    };

    // ── Navigation / selection ─────────────────────────────────────────────────

    const handleOpenReadOnlySubject = (subjectId: any) => {
        if (!subjectId) return;
        navigate(getPreviewSafePath(`/home/subject/${subjectId}?mode=readonly&source=bin`));
    };

    const handleSelectItem = (itemId: any, itemType: any) => {
        if (binData.selectionMode) {
            toggleBulkItemSelection(itemId, itemType);
            return;
        }

        const isSameSelection = selectedItemId === itemId && selectedItemType === itemType;
        if (isSameSelection) {
            setSelectedItemId(null);
            setSelectedItemType(null);
            return;
        }

        setSelectedItemId(itemId);
        setSelectedItemType(itemType);
    };

    const handleOpenFolderTrashView = (folderItem: any) => {
        if (!folderItem?.id) return;

        setFolderBinTrail((previousTrail: any[]) => {
            const existingIndex = previousTrail.findIndex(entry => entry.id === folderItem.id);
            if (existingIndex >= 0) {
                return previousTrail.slice(0, existingIndex + 1);
            }

            return [
                ...previousTrail,
                {
                    id: folderItem.id,
                    name: folderItem?.name || 'Carpeta',
                },
            ];
        });

        setSelectedItemId(null);
        setSelectedItemType(null);
        setSelectionMode(false);
        clearBulkSelection();
    };

    const handleCloseFolderTrashView = () => {
        setFolderBinTrail((previousTrail: any[]) => {
            if (!previousTrail.length) return previousTrail;
            return previousTrail.slice(0, -1);
        });
        setSelectedItemId(null);
        setSelectedItemType(null);
        setSelectionMode(false);
        clearBulkSelection();
    };

    return {
        clearBulkSelection,
        toggleBulkSelectionMode,
        toggleBulkItemSelection,
        handleSelectAllVisible,
        handleBulkRestore,
        handleBulkPermanentDelete,
        handleRestore,
        handlePermanentDelete,
        handleEmptyBin,
        handleOpenReadOnlySubject,
        handleSelectItem,
        handleOpenFolderTrashView,
        handleCloseFolderTrashView,
    };
};

export default useBinActions;
