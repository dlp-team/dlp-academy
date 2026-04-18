// src/hooks/useBinData.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSubjects } from './useSubjects';
import { useFolders } from './useFolders';
import { useShortcuts } from './useShortcuts';
import {
    DEFAULT_BIN_SORT_MODE,
    sortBinItems,
} from '../pages/Home/utils/binViewUtils';
import { isTrashRetentionExpired } from '../utils/trashRetentionUtils';
import { getActiveRole } from '../utils/permissionUtils';

// ── Helpers ────────────────────────────────────────────────────────────────────

const isTopLevelTrashedFolderEntry = (folderEntry: any) => {
    const rootFolderId = folderEntry?.trashedRootFolderId || folderEntry?.id;
    const parentTrashMarker = folderEntry?.trashedByFolderId || null;
    return !parentTrashMarker && rootFolderId === folderEntry?.id;
};

export const isShortcutItemType = (itemType: any) =>
    itemType === 'shortcut-subject' || itemType === 'shortcut-folder';

export const isFolderItemType = (itemType: any) =>
    itemType === 'folder' || itemType === 'shortcut-folder';

// ── Hook ───────────────────────────────────────────────────────────────────────

const useBinData = (user: any) => {
    const isStudent = getActiveRole(user) === 'student';

    // ── State ──────────────────────────────────────────────────────────────────
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

    // ── External hooks ─────────────────────────────────────────────────────────
    const {
        getTrashedSubjects, restoreSubject, permanentlyDeleteSubject,
    } = useSubjects(isStudent ? null : user);

    const {
        getTrashedFolders, restoreFolder, permanentlyDeleteFolder,
    } = useFolders(isStudent ? null : user);

    const {
        getTrashedShortcuts, restoreShortcut, permanentlyDeleteShortcut,
    } = useShortcuts(isStudent ? null : user);

    // ── Derived data ───────────────────────────────────────────────────────────
    const activeFolderBin = useMemo(
        () => (folderBinTrail.length > 0 ? folderBinTrail[folderBinTrail.length - 1] : null),
        [folderBinTrail],
    );

    const activeFolderBinId = activeFolderBin?.id || null;
    const activeFolderRootId = folderBinTrail.length > 0 ? folderBinTrail[0]?.id || null : null;

    const topLevelTrashedSubjects = useMemo(
        () => trashedItems.filter(item => item.itemType === 'subject'),
        [trashedItems],
    );

    const topLevelTrashedFolders = useMemo(
        () => trashedItems.filter(item => item.itemType === 'folder'),
        [trashedItems],
    );

    const sortedTopLevelTrashedItems = useMemo(
        () => sortBinItems(trashedItems, sortMode),
        [trashedItems, sortMode],
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

        return allTrashedSubjects.filter(subject => {
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
        [activeFolderBinId, activeFolderBinItems, sortedTopLevelTrashedItems],
    );

    const selectedItem = useMemo(
        () => visibleTrashedItems.find(
            item => item.id === selectedItemId && item.itemType === selectedItemType,
        ) ?? null,
        [visibleTrashedItems, selectedItemId, selectedItemType],
    );

    const buildActionKey = useCallback(
        (itemId: any, itemType: any) => `${itemType}:${itemId}`,
        [],
    );

    const selectedBulkEntries = useMemo(() => Object.values(bulkSelection), [bulkSelection]);
    const selectedBulkCount = selectedBulkEntries.length;
    const selectedBulkKeys = useMemo(() => new Set(Object.keys(bulkSelection)), [bulkSelection]);

    const activeFolderPathLabel = folderBinTrail
        .map(folderEntry => folderEntry?.name || 'Carpeta')
        .join(' / ');

    const folderBackButtonLabel = folderBinTrail.length > 1
        ? 'Volver a carpeta anterior'
        : 'Volver a papelera principal';

    // ── Data loading ───────────────────────────────────────────────────────────
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
                    || (shortcut?.targetType === 'folder' ? 'shortcut-folder' : 'shortcut-subject'),
            }));

            const folderItems = allFolderItems.filter(isTopLevelTrashedFolderEntry);

            setFolderBinTrail(previousTrail => {
                if (!previousTrail.length) return previousTrail;

                const folderById = new Map<any, any>(
                    allFolderItems.map(folderItem => [folderItem.id, folderItem]),
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
                        name: currentFolder?.name || trailEntry?.name || 'Carpeta',
                    });
                }

                const isUnchanged = nextTrail.length === previousTrail.length
                    && nextTrail.every((entry, idx) => (
                        entry.id === previousTrail[idx]?.id
                        && entry.name === previousTrail[idx]?.name
                    ));

                return isUnchanged ? previousTrail : nextTrail;
            });

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

    // ── Effects ────────────────────────────────────────────────────────────────
    useEffect(() => {
        loadTrashedItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, isStudent]);

    useEffect(() => {
        if (!selectedItemId) return;

        const selectedStillVisible = visibleTrashedItems.some(
            item => item.id === selectedItemId && item.itemType === selectedItemType,
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

    // ── Return ─────────────────────────────────────────────────────────────────
    return {
        // State
        loading,
        actionLoading,
        errorMessage,
        deleteConfirm,
        emptyConfirmOpen,
        selectedItemId,
        selectedItemType,
        folderBinTrail,
        sortMode,
        selectionMode,
        bulkSelection,
        bulkDeleteConfirmOpen,
        bulkActionLoading,
        isStudent,

        // Derived
        activeFolderBinId,
        visibleTrashedItems,
        selectedItem,
        topLevelTrashedSubjects,
        topLevelTrashedFolders,
        nestedFolderItems,
        nestedFolderSubjectItems,
        selectedBulkEntries,
        selectedBulkCount,
        selectedBulkKeys,
        activeFolderPathLabel,
        folderBackButtonLabel,

        // Setters
        setLoading,
        setActionLoading,
        setErrorMessage,
        setDeleteConfirm,
        setEmptyConfirmOpen,
        setSelectedItemId,
        setSelectedItemType,
        setFolderBinTrail,
        setSortMode,
        setSelectionMode,
        setBulkSelection,
        setBulkDeleteConfirmOpen,
        setBulkActionLoading,

        // Data-layer actions
        loadTrashedItems,
        buildActionKey,

        // Hook pass-throughs for useBinActions
        restoreSubject,
        restoreFolder,
        restoreShortcut,
        permanentlyDeleteSubject,
        permanentlyDeleteFolder,
        permanentlyDeleteShortcut,
    };
};

export default useBinData;
