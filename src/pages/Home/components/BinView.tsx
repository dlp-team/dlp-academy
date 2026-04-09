// src/pages/Home/components/BinView.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Trash2, Loader2, XCircle, ArrowLeft, CheckSquare, Square, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ListViewItem from '../../../components/modules/ListViewItem';
import { useSubjects } from '../../../hooks/useSubjects';
import { useFolders } from '../../../hooks/useFolders';
import { useShortcuts } from '../../../hooks/useShortcuts';
import {
    BIN_SORT_MODES,
    DEFAULT_BIN_SORT_MODE,
    getDaysRemaining,
    getDaysRemainingTextClass,
    sortBinItems,
    toJsDate
} from '../utils/binViewUtils';
import { isTrashRetentionExpired } from '../../../utils/trashRetentionUtils';
import { getActiveRole } from '../../../utils/permissionUtils';
import { getBinUnselectedDimmingClass } from '../../../utils/selectionVisualUtils';

import BinGridItem          from './bin/BinGridItem';
import BinSelectionOverlay  from './bin/BinSelectionOverlay';
import { DeleteConfirmModal, EmptyBinConfirmModal } from './bin/BinConfirmModals';

const ListViewItemComponent: any = ListViewItem;

const isTopLevelTrashedFolderEntry = (folderEntry: any) => {
    const rootFolderId = folderEntry?.trashedRootFolderId || folderEntry?.id;
    const parentTrashMarker = folderEntry?.trashedByFolderId || null;
    return !parentTrashMarker && rootFolderId === folderEntry?.id;
};

const BIN_SORT_OPTIONS = [
    { id: BIN_SORT_MODES.URGENCY_ASC, label: 'Urgencia: Ascendente' },
    { id: BIN_SORT_MODES.URGENCY_DESC, label: 'Urgencia: Descendente' },
    { id: BIN_SORT_MODES.ALPHA_ASC, label: 'Nombre: A-Z' },
    { id: BIN_SORT_MODES.ALPHA_DESC, label: 'Nombre: Z-A' }
];

const BIN_SORT_DESCRIPTIONS = {
    [BIN_SORT_MODES.URGENCY_ASC]: 'Ordenado por urgencia: menos tiempo restante primero.',
    [BIN_SORT_MODES.URGENCY_DESC]: 'Ordenado por urgencia: más tiempo restante primero.',
    [BIN_SORT_MODES.ALPHA_ASC]: 'Ordenado alfabéticamente de A a Z.',
    [BIN_SORT_MODES.ALPHA_DESC]: 'Ordenado alfabéticamente de Z a A.'
};

// ─────────────────────────────────────────────────────────────────────────────

const BinView = ({ user, cardScale = 100, layoutMode = 'grid' }: any) => {
    const navigate = useNavigate();
    const isStudent = getActiveRole(user) === 'student';

    const [trashedItems, setTrashedItems] = useState<any[]>([]);
    const [allTrashedSubjects, setAllTrashedSubjects] = useState<any[]>([]);
    const [allTrashedFolders, setAllTrashedFolders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<any>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
    const [emptyConfirmOpen, setEmptyConfirmOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<any>(null);
    const [selectedItemId, setSelectedItemId] = useState<any>(null);
    const [selectedItemType, setSelectedItemType] = useState<any>(null);
    const [folderBinTrail, setFolderBinTrail] = useState<any[]>([]);
    const [sortMode, setSortMode] = useState<string>(DEFAULT_BIN_SORT_MODE);
    const [selectionMode, setSelectionMode] = useState(false);
    const [bulkSelection, setBulkSelection] = useState<any>({});
    const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    const selectedCardRef = useRef<any>(null);

    const { getTrashedSubjects, restoreSubject, permanentlyDeleteSubject } = useSubjects(isStudent ? null : user);
    const { getTrashedFolders, restoreFolder, permanentlyDeleteFolder } = useFolders(isStudent ? null : user);
    const { getTrashedShortcuts, restoreShortcut, permanentlyDeleteShortcut } = useShortcuts(isStudent ? null : user);

    const activeFolderBin = useMemo(
        () => (folderBinTrail.length > 0 ? folderBinTrail[folderBinTrail.length - 1] : null),
        [folderBinTrail]
    );

    const activeFolderBinId = activeFolderBin?.id || null;
    const activeFolderRootId = folderBinTrail.length > 0 ? folderBinTrail[0]?.id || null : null;

    const topLevelTrashedSubjects = useMemo(
        () => trashedItems.filter(item => item.itemType === 'subject'),
        [trashedItems]
    );

    const topLevelTrashedFolders = useMemo(
        () => trashedItems.filter(item => item.itemType === 'folder'),
        [trashedItems]
    );

    const sortedTopLevelTrashedItems = useMemo(
        () => sortBinItems(trashedItems, sortMode),
        [trashedItems, sortMode]
    );

    const nestedFolderItems = useMemo(() => {
        if (!activeFolderBinId) return [];

        return allTrashedFolders
            .filter(folder => folder.id !== activeFolderBinId)
            .filter(folder => {
                if ((folder?.parentId || null) !== activeFolderBinId) return false;
                if (!activeFolderRootId) return true;
                const folderRootId = folder?.trashedRootFolderId || folder?.id;
                return folderRootId === activeFolderRootId;
            });
    }, [allTrashedFolders, activeFolderBinId, activeFolderRootId]);

    const nestedFolderSubjectItems = useMemo(() => {
        if (!activeFolderBinId) return [];

        return allTrashedSubjects
            .filter(subject => {
                if (subject?.folderId !== activeFolderBinId) return false;
                if (!activeFolderRootId) return true;
                const subjectRootId = subject?.trashedRootFolderId || subject?.trashedByFolderId || null;
                return !subjectRootId || subjectRootId === activeFolderRootId;
            });
    }, [allTrashedSubjects, activeFolderBinId, activeFolderRootId]);

    const activeFolderBinItems = useMemo(() => {
        if (!activeFolderBinId) return [];

        return sortBinItems([...nestedFolderItems, ...nestedFolderSubjectItems], sortMode);
    }, [activeFolderBinId, nestedFolderItems, nestedFolderSubjectItems, sortMode]);

    const visibleTrashedItems = useMemo(
        () => (activeFolderBinId ? activeFolderBinItems : sortedTopLevelTrashedItems),
        [activeFolderBinId, activeFolderBinItems, sortedTopLevelTrashedItems]
    );

    const selectedItem = useMemo(
        () => visibleTrashedItems.find(item => item.id === selectedItemId && item.itemType === selectedItemType) ?? null,
        [visibleTrashedItems, selectedItemId, selectedItemType]
    );

    const isShortcutItemType = (itemType: any) => itemType === 'shortcut-subject' || itemType === 'shortcut-folder';
    const isFolderItemType = (itemType: any) => itemType === 'folder' || itemType === 'shortcut-folder';

    const buildActionKey = React.useCallback((itemId: any, itemType: any) => `${itemType}:${itemId}`, []);

    const selectedBulkEntries = useMemo(() => Object.values(bulkSelection), [bulkSelection]);
    const selectedBulkCount = selectedBulkEntries.length;
    const selectedBulkKeys = useMemo(() => new Set(Object.keys(bulkSelection)), [bulkSelection]);

    const loadTrashedItems = async (options: any = {}) => {
        const skipAutoRetentionPurge = options?.skipAutoRetentionPurge === true;

        if (isStudent) {
            setTrashedItems([]);
            setAllTrashedSubjects([]);
            setAllTrashedFolders([]);
            setFolderBinTrail([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [subjects, folders, shortcuts] = await Promise.all([
                getTrashedSubjects(),
                getTrashedFolders({ includeNested: true }),
                getTrashedShortcuts(),
            ]);

            if (!skipAutoRetentionPurge) {
                const nowMs = Date.now();
                const expiredRootFolderItems = folders
                    .filter(isTopLevelTrashedFolderEntry)
                    .filter((folder: any) => isTrashRetentionExpired(folder?.trashedAt, nowMs));

                const expiredRootFolderIds = new Set(expiredRootFolderItems.map((folder: any) => folder.id));

                const expiredSubjectItems = subjects.filter((subject: any) => {
                    if (!isTrashRetentionExpired(subject?.trashedAt, nowMs)) return false;

                    const subjectFolderRoot = subject?.trashedRootFolderId || subject?.trashedByFolderId || null;
                    return !subjectFolderRoot || !expiredRootFolderIds.has(subjectFolderRoot);
                });

                if (expiredRootFolderItems.length > 0 || expiredSubjectItems.length > 0) {
                    await Promise.allSettled([
                        ...expiredRootFolderItems.map((folder: any) => permanentlyDeleteFolder(folder.id)),
                        ...expiredSubjectItems.map((subject: any) => permanentlyDeleteSubject(subject.id)),
                    ]);

                    await loadTrashedItems({ skipAutoRetentionPurge: true });
                    return;
                }
            }

            const allSubjectItems = subjects.map((subject: any) => ({ ...subject, itemType: 'subject' }));
            setAllTrashedSubjects(allSubjectItems);

            const allFolderItems = folders.map((folder: any) => ({ ...folder, itemType: 'folder' }));
            setAllTrashedFolders(allFolderItems);

            const allShortcutItems = shortcuts.map((shortcut: any) => ({
                ...shortcut,
                itemType: shortcut?.itemType
                    || (shortcut?.targetType === 'folder' ? 'shortcut-folder' : 'shortcut-subject')
            }));

            const folderItems = allFolderItems.filter(isTopLevelTrashedFolderEntry);

            setFolderBinTrail(previousTrail => {
                if (!previousTrail.length) return previousTrail;

                const folderById = new Map<any, any>(
                    allFolderItems.map(folderItem => [folderItem.id, folderItem])
                );

                const nextTrail: any[] = [];
                for (let index = 0; index < previousTrail.length; index += 1) {
                    const trailEntry = previousTrail[index];
                    const currentFolder = folderById.get(trailEntry.id);
                    if (!currentFolder) break;

                    if (index === 0) {
                        if (!isTopLevelTrashedFolderEntry(currentFolder)) break;
                    } else {
                        const expectedParentId = nextTrail[index - 1]?.id || null;
                        if ((currentFolder?.parentId || null) !== expectedParentId) break;
                    }

                    nextTrail.push({
                        id: currentFolder.id,
                        name: currentFolder?.name || trailEntry?.name || 'Carpeta'
                    });
                }

                const isUnchanged = nextTrail.length === previousTrail.length
                    && nextTrail.every((entry, idx) => (
                        entry.id === previousTrail[idx]?.id
                        && entry.name === previousTrail[idx]?.name
                    ));

                return isUnchanged ? previousTrail : nextTrail;
            });

            // Subjects trashed by folder deletion stay nested under their folder and
            // should not be duplicated in the top-level bin listing.
            const subjectItems = allSubjectItems
                .filter((subject: any) => !subject?.trashedByFolderId);

            const topLevelItems = [...subjectItems, ...folderItems, ...allShortcutItems];
            setTrashedItems(topLevelItems);

            const allKnownItems = [...topLevelItems, ...allSubjectItems, ...allFolderItems, ...allShortcutItems];
            if (selectedItemId && !allKnownItems.some(item => item.id === selectedItemId && item.itemType === selectedItemType)) {
                setSelectedItemId(null);
                setSelectedItemType(null);
            }
        } catch (err: any) {
            console.error('Error loading trashed items:', err);
            setErrorMessage('Error al cargar los elementos de la papelera. Por favor, intenta mas tarde.');
        } finally {
            setLoading(false);
        }
    };

    // ── Data loading ───────────────────────────────────────────────────────────
    useEffect(() => {
        loadTrashedItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, isStudent]);

    useEffect(() => {
        if (!selectedItemId) return;

        const selectedStillVisible = visibleTrashedItems.some(item =>
            item.id === selectedItemId && item.itemType === selectedItemType
        );

        if (!selectedStillVisible) {
            setSelectedItemId(null);
            setSelectedItemType(null);
        }
    }, [visibleTrashedItems, selectedItemId, selectedItemType]);

    useEffect(() => {
        if (!selectionMode) return;

        const visibleKeys = new Set(visibleTrashedItems.map(item => buildActionKey(item.id, item.itemType)));
        setBulkSelection((previousSelection: any) => {
            const nextSelection: any = {};
            let changed = false;

            Object.keys(previousSelection).forEach((key: string) => {
                if (visibleKeys.has(key)) {
                    nextSelection[key] = previousSelection[key];
                } else {
                    changed = true;
                }
            });

            if (!changed && Object.keys(nextSelection).length === Object.keys(previousSelection).length) {
                return previousSelection;
            }

            return nextSelection;
        });
    }, [selectionMode, visibleTrashedItems, buildActionKey]);

    useEffect(() => {
        if (!selectionMode) return;
        setSelectedItemId(null);
        setSelectedItemType(null);
    }, [selectionMode]);

    useEffect(() => {
        setSelectionMode(false);
        setBulkSelection({});
        setBulkDeleteConfirmOpen(false);
    }, [activeFolderBinId]);

    // ── Action handlers ────────────────────────────────────────────────────────
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
                [selectionKey]: { id: itemId, itemType }
            };
        });
    };

    const handleSelectAllVisible = () => {
        if (selectedBulkCount === visibleTrashedItems.length) {
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

    const handleBulkRestore = async () => {
        if (selectedBulkEntries.length === 0) return;

        setBulkActionLoading(true);
        setErrorMessage(null);

        try {
            const results = await Promise.allSettled(
                selectedBulkEntries.map((entry: any) => {
                    if (entry.itemType === 'folder') {
                        return restoreFolder(entry.id);
                    }
                    if (isShortcutItemType(entry.itemType)) {
                        return restoreShortcut(entry.id);
                    }
                    return restoreSubject(entry.id);
                })
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
                    if (entry.itemType === 'folder') {
                        return permanentlyDeleteFolder(entry.id);
                    }
                    if (isShortcutItemType(entry.itemType)) {
                        return permanentlyDeleteShortcut(entry.id);
                    }
                    return permanentlyDeleteSubject(entry.id);
                })
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
                setFolderBinTrail(previousTrail => {
                    const targetIndex = previousTrail.findIndex(entry => entry.id === itemId);
                    if (targetIndex === -1) return previousTrail;
                    return previousTrail.slice(0, targetIndex);
                });
            }

            await loadTrashedItems();
        } catch (err: any) {
            console.error('Error restoring trashed item:', err);
            setErrorMessage(itemType === 'folder'
                ? 'No se pudo restaurar la carpeta completa. Verifica tus permisos e intenta nuevamente.'
                : isShortcutItemType(itemType)
                    ? 'No se pudo restaurar el acceso directo. Verifica tus permisos e intenta nuevamente.'
                : 'No se pudo restaurar la asignatura. Verifica tus permisos e intenta nuevamente.'
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
                setFolderBinTrail(previousTrail => {
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
            setErrorMessage(isPermErr
                ? 'No tienes permisos para eliminar algunos elementos relacionados. Intenta vaciar la papelera completa o contacta al administrador.'
                : 'Error al eliminar el elemento. Por favor, intenta mas tarde.'
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
                visibleTrashedItems.map(item => {
                    if (item.itemType === 'folder') {
                        return permanentlyDeleteFolder(item.id);
                    }
                    if (isShortcutItemType(item.itemType)) {
                        return permanentlyDeleteShortcut(item.id);
                    }
                    return permanentlyDeleteSubject(item.id);
                })
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

    const handleOpenReadOnlySubject = (subjectId: any) => {
        if (!subjectId) return;
        navigate(`/home/subject/${subjectId}?mode=readonly&source=bin`);
    };

    const handleSelectItem = (itemId: any, itemType: any) => {
        if (selectionMode) {
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

        setFolderBinTrail(previousTrail => {
            const existingIndex = previousTrail.findIndex(entry => entry.id === folderItem.id);
            if (existingIndex >= 0) {
                return previousTrail.slice(0, existingIndex + 1);
            }

            return [
                ...previousTrail,
                {
                    id: folderItem.id,
                    name: folderItem?.name || 'Carpeta'
                }
            ];
        });

        setSelectedItemId(null);
        setSelectedItemType(null);
        setSelectionMode(false);
        clearBulkSelection();
    };

    const handleCloseFolderTrashView = () => {
        setFolderBinTrail(previousTrail => {
            if (!previousTrail.length) return previousTrail;
            return previousTrail.slice(0, -1);
        });
        setSelectedItemId(null);
        setSelectedItemType(null);
        setSelectionMode(false);
        clearBulkSelection();
    };

    // Restrict access for students
    if (isStudent) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-16">
                <XCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-2">Acceso denegado</h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg">La papelera no está disponible para alumnos.</p>
            </div>
        );
    }

    // ── Early returns ──────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    const activeFolderPathLabel = folderBinTrail
        .map(folderEntry => folderEntry?.name || 'Carpeta')
        .join(' / ');

    const folderBackButtonLabel = folderBinTrail.length > 1
        ? 'Volver a carpeta anterior'
        : 'Volver a papelera principal';

    if (visibleTrashedItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <Trash2 size={64} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">
                    {activeFolderBinId ? 'Esta carpeta no tiene elementos en papelera' : 'La papelera esta vacia'}
                </p>
                <p className="text-sm mt-1">
                    {activeFolderBinId
                        ? 'Vuelve atras para revisar otros elementos eliminados.'
                        : 'Las carpetas y asignaturas eliminadas apareceran aqui'}
                </p>
                {activeFolderBinId && (
                    <button
                        onClick={handleCloseFolderTrashView}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        {folderBackButtonLabel}
                    </button>
                )}
            </div>
        );
    }

    const gridStyle = {
        gridTemplateColumns: `repeat(auto-fill, minmax(${(320 * cardScale) / 100}px, 1fr))`
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4">

            {/* Error banner */}
            {errorMessage && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 mb-4">
                    <XCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">{errorMessage}</p>
                    </div>
                    <button
                        onClick={() => setErrorMessage(null)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                    >
                        <XCircle size={18} />
                    </button>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-2">
                <div>
                    {activeFolderBinId && (
                        <button
                            onClick={handleCloseFolderTrashView}
                            className="inline-flex items-center gap-2 mb-2 text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                        >
                            <ArrowLeft size={15} />
                            {folderBackButtonLabel}
                        </button>
                    )}
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {activeFolderBinId
                            ? `Papelera / ${activeFolderPathLabel} (${visibleTrashedItems.length})`
                            : `Papelera (${visibleTrashedItems.length})`}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {activeFolderBinId
                            ? 'Contenido interno de la carpeta eliminada. Puedes abrir subcarpetas y restaurar o eliminar elementos individuales.'
                            : BIN_SORT_DESCRIPTIONS[sortMode as keyof typeof BIN_SORT_DESCRIPTIONS]}
                    </p>
                </div>

                <div className="flex flex-col items-start lg:items-end gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide" htmlFor="bin-sort-select">
                            Ordenar
                        </label>
                        <select
                            id="bin-sort-select"
                            value={sortMode}
                            onChange={(event) => setSortMode(event.target.value)}
                            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-700 dark:text-gray-200"
                            aria-label="Ordenar elementos de la papelera"
                        >
                            {BIN_SORT_OPTIONS.map((option: any) => (
                                <option key={option.id} value={option.id}>{option.label}</option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={toggleBulkSelectionMode}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                selectionMode && selectedBulkCount > 0
                                    ? 'bg-sky-600 hover:bg-sky-700 text-white'
                                    : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                            aria-pressed={selectionMode}
                        >
                            {selectionMode ? <CheckSquare size={16} /> : <Square size={16} />}
                            {selectionMode ? 'Salir de la selección' : 'Modo selección'}
                        </button>

                        {selectionMode && (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                selectedBulkCount > 0
                                    ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                                {selectedBulkCount} seleccionados
                            </span>
                        )}

                        {!selectionMode && (
                            <button
                                onClick={() => setEmptyConfirmOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                            >
                                <Trash2 size={16} />
                                {activeFolderBinId ? 'Vaciar vista actual' : 'Vaciar papelera'}
                            </button>
                        )}
                    </div>

                    {selectionMode && (
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={handleSelectAllVisible}
                                disabled={visibleTrashedItems.length === 0}
                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50"
                            >
                                {selectedBulkCount === visibleTrashedItems.length && visibleTrashedItems.length > 0
                                    ? 'Quitar todo'
                                    : 'Seleccionar todo'}
                            </button>
                            <button
                                type="button"
                                onClick={clearBulkSelection}
                                disabled={selectedBulkCount === 0}
                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50"
                            >
                                Limpiar
                            </button>
                            <button
                                type="button"
                                onClick={handleBulkRestore}
                                disabled={selectedBulkCount === 0 || bulkActionLoading}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                {bulkActionLoading ? <Loader2 className="animate-spin" size={16} /> : <RotateCcw size={16} />}
                                Restaurar selección
                            </button>
                            <button
                                type="button"
                                onClick={() => setBulkDeleteConfirmOpen(true)}
                                disabled={selectedBulkCount === 0 || bulkActionLoading}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                {bulkActionLoading ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                Eliminar selección
                            </button>
                        </div>
                    )}

                    {selectionMode && (
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            Modo seguro: selecciona elementos y confirma antes de eliminar permanentemente.
                        </p>
                    )}
                </div>
            </div>

            {/* Grid / List */}
            {layoutMode === 'grid' ? (
                <div className="grid gap-6" style={gridStyle}>
                    {visibleTrashedItems.map((item: any) => {
                        const isSelected = selectionMode
                            ? selectedBulkKeys.has(buildActionKey(item.id, item.itemType))
                            : (selectedItemId === item.id && selectedItemType === item.itemType);
                        const hasSelection = selectionMode
                            ? selectedBulkCount > 0
                            : false;
                        const hideCardBehindOverlay = !selectionMode
                            && selectedItemId === item.id
                            && selectedItemType === item.itemType;

                        return (
                            <BinGridItem
                                key={`${item.itemType}-${item.id}`}
                                ref={isSelected ? selectedCardRef : null}
                                item={item}
                                itemType={item.itemType}
                                user={user}
                                cardScale={cardScale}
                                isSelected={isSelected}
                                hasSelection={hasSelection}
                                selectionMode={selectionMode}
                                overlayHidden={hideCardBehindOverlay}
                                onSelect={() => handleSelectItem(item.id, item.itemType)}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="space-y-2">
                    {visibleTrashedItems.map((item: any) => {
                        const isSelected = selectionMode
                            ? selectedBulkKeys.has(buildActionKey(item.id, item.itemType))
                            : (selectedItemId === item.id && selectedItemType === item.itemType);
                        const hasSelection = selectionMode
                            ? selectedBulkCount > 0
                            : Boolean(selectedItemId && selectedItemType);
                        const daysRemaining = getDaysRemaining(item);
                        const trashedDate = toJsDate(item.trashedAt);
                        const isFolderItem = isFolderItemType(item.itemType);
                        const isUrgentItem = daysRemaining <= 3;
                        const isMediumUrgency = !isUrgentItem && daysRemaining <= 7;
                        const restoreActionClass = isUrgentItem
                            ? 'border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
                            : isMediumUrgency
                                ? 'border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40'
                                : 'border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40';
                        const dimmingClass = getBinUnselectedDimmingClass({
                            hasSelection,
                            isSelected,
                            isFolderLike: isFolderItem,
                        });
                        const actionKey = buildActionKey(item.id, item.itemType);

                        return (
                            <div
                                key={`${item.itemType}-${item.id}`}
                                className={`rounded-xl transition-all duration-200 ease-out ${!isSelected ? dimmingClass : ''} ${isSelected && !selectionMode ? 'scale-[1.01]' : ''}`}
                            >
                                <ListViewItemComponent
                                    user={user}
                                    item={item}
                                    type={isFolderItem ? 'folder' : 'subject'}
                                    onNavigate={() => handleSelectItem(item.id, item.itemType)}
                                    onNavigateSubject={() => handleSelectItem(item.id, item.itemType)}
                                    onEdit={() => {}}
                                    onDelete={() => {}}
                                    onShare={() => {}}
                                    draggable={false}
                                    cardScale={cardScale}
                                    onDropAction={() => {}}
                                    allFolders={activeFolderBinId ? nestedFolderItems : topLevelTrashedFolders}
                                    allSubjects={activeFolderBinId ? nestedFolderSubjectItems : topLevelTrashedSubjects}
                                    disableAllActions={true}
                                    isSelected={selectionMode ? isSelected : false}
                                />
                                <div className="px-3 pb-2">
                                    <p className={`text-xs font-semibold ${getDaysRemainingTextClass(daysRemaining)}`}>
                                        {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} restantes
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Eliminada: {trashedDate ? trashedDate.toLocaleDateString() : 'Fecha no disponible'}
                                    </p>
                                </div>

                                {!selectionMode && isSelected && (
                                    <div
                                        data-testid={`bin-list-inline-panel-${item.itemType}-${item.id}`}
                                        className="mt-3 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-900/95 shadow-[0_16px_34px_rgba(15,23,42,0.20)] p-4 animate-in fade-in slide-in-from-top-1 zoom-in-95 duration-200"
                                    >
                                        <div className="space-y-4">
                                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Elemento seleccionado</p>
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                                            <div className="space-y-2">
                                                {item.itemType === 'folder' && (
                                                    <button onClick={() => handleOpenFolderTrashView(item)}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors">
                                                        Abrir contenido de carpeta
                                                    </button>
                                                )}
                                                {item.itemType === 'subject' && (
                                                    <button onClick={() => handleOpenReadOnlySubject(item.id)}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors">
                                                        Ver contenido
                                                    </button>
                                                )}
                                                <button onClick={() => handleRestore(item.id, item.itemType)}
                                                    disabled={actionLoading === actionKey}
                                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-colors disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:text-gray-600 dark:disabled:text-slate-300 ${restoreActionClass}`}>
                                                    {actionLoading === actionKey
                                                        ? <Loader2 className="animate-spin" size={18} />
                                                        : (item.itemType === 'folder'
                                                            ? 'Restaurar carpeta completa'
                                                            : isShortcutItemType(item.itemType)
                                                                ? 'Restaurar acceso directo'
                                                                : 'Restaurar')}
                                                </button>
                                                <button onClick={() => setDeleteConfirm({ id: item.id, itemType: item.itemType })}
                                                    disabled={actionLoading === actionKey}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:text-gray-600 dark:disabled:text-slate-300 font-semibold transition-colors">
                                                    Eliminar permanentemente
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Selection overlay (grid mode) ────────────────────────────────── */}
            {selectedItem && layoutMode === 'grid' && !selectionMode && (
                <BinSelectionOverlay
                    item={selectedItem}
                    itemType={selectedItem.itemType}
                    selectedCardRef={selectedCardRef}
                    actionLoading={actionLoading}
                    onClose={() => {
                        setSelectedItemId(null);
                        setSelectedItemType(null);
                    }}
                    onShowDescription={selectedItem.itemType === 'subject'
                        ? () => handleOpenReadOnlySubject(selectedItem.id)
                        : selectedItem.itemType === 'folder'
                            ? () => handleOpenFolderTrashView(selectedItem)
                            : undefined}
                    onRestore={handleRestore}
                    onDeleteConfirm={(itemId: any, itemType: any) => setDeleteConfirm({ id: itemId, itemType })}
                >
                    {/* Re-render the card inside the overlay so it sits above the dim */}
                    <BinGridItem
                        item={selectedItem}
                        itemType={selectedItem.itemType}
                        user={user}
                        cardScale={cardScale}
                        isSelected={true}
                        hasSelection={false}
                        selectionMode={false}
                        onSelect={() => {
                            setSelectedItemId(null);
                            setSelectedItemType(null);
                        }}
                    />
                </BinSelectionOverlay>
            )}

            {/* ── Modals ──────────────────────────────────────────────────────── */}

            {deleteConfirm && (
                <DeleteConfirmModal
                    targetId={deleteConfirm.id}
                    itemType={deleteConfirm.itemType}
                    actionLoading={actionLoading}
                    onConfirm={() => handlePermanentDelete(deleteConfirm.id, deleteConfirm.itemType)}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}

            {emptyConfirmOpen && (
                <EmptyBinConfirmModal
                    count={visibleTrashedItems.length}
                    onConfirm={handleEmptyBin}
                    onCancel={() => setEmptyConfirmOpen(false)}
                />
            )}

            {bulkDeleteConfirmOpen && (
                <EmptyBinConfirmModal
                    count={selectedBulkCount}
                    title="Eliminar selección"
                    description={`Seguro que deseas eliminar permanentemente los ${selectedBulkCount} elementos seleccionados?`}
                    confirmLabel="Eliminar seleccionados"
                    isConfirming={bulkActionLoading}
                    onConfirm={handleBulkPermanentDelete}
                    onCancel={() => setBulkDeleteConfirmOpen(false)}
                />
            )}
        </div>
    );
};

export default BinView;