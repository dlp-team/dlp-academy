// src/pages/Home/components/BinView.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Trash2, Loader2, XCircle, ArrowLeft } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import ListViewItem from '../../../components/modules/ListViewItem';
import { db } from '../../../firebase/config';
import { useSubjects } from '../../../hooks/useSubjects';
import { useFolders } from '../../../hooks/useFolders';
import { getRemainingMs, getDaysRemaining, getDaysRemainingTextClass, toJsDate } from '../utils/binViewUtils';

import BinGridItem          from './bin/BinGridItem';
import BinSelectionOverlay  from './bin/BinSelectionOverlay';
import BinDescriptionModal  from './bin/BinDescriptionModal';
import { DeleteConfirmModal, EmptyBinConfirmModal } from './bin/BinConfirmModals';

const ListViewItemComponent: any = ListViewItem;

const isTopLevelTrashedFolderEntry = (folderEntry: any) => {
    const rootFolderId = folderEntry?.trashedRootFolderId || folderEntry?.id;
    const parentTrashMarker = folderEntry?.trashedByFolderId || null;
    return !parentTrashMarker && rootFolderId === folderEntry?.id;
};

// ─────────────────────────────────────────────────────────────────────────────

const BinView = ({ user, cardScale = 100, layoutMode = 'grid' }: any) => {
    const isStudent = user?.role === 'student';

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
    const [descriptionModal, setDescriptionModal] = useState<any>(null);
    const [loadingDescription, setLoadingDescription] = useState(false);
    const [expandedTopics, setExpandedTopics] = useState<any>({});

    const selectedCardRef = useRef<any>(null);

    const { getTrashedSubjects, restoreSubject, permanentlyDeleteSubject } = useSubjects(isStudent ? null : user);
    const { getTrashedFolders, restoreFolder, permanentlyDeleteFolder } = useFolders(isStudent ? null : user);

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

    const nestedFolderItems = useMemo(() => {
        if (!activeFolderBinId) return [];

        const now = new Date();
        return allTrashedFolders
            .filter(folder => folder.id !== activeFolderBinId)
            .filter(folder => {
                if ((folder?.parentId || null) !== activeFolderBinId) return false;
                if (!activeFolderRootId) return true;
                const folderRootId = folder?.trashedRootFolderId || folder?.id;
                return folderRootId === activeFolderRootId;
            })
            .sort((a, b) => getRemainingMs(a, now) - getRemainingMs(b, now));
    }, [allTrashedFolders, activeFolderBinId, activeFolderRootId]);

    const nestedFolderSubjectItems = useMemo(() => {
        if (!activeFolderBinId) return [];

        const now = new Date();
        return allTrashedSubjects
            .filter(subject => {
                if (subject?.folderId !== activeFolderBinId) return false;
                if (!activeFolderRootId) return true;
                const subjectRootId = subject?.trashedRootFolderId || subject?.trashedByFolderId || null;
                return !subjectRootId || subjectRootId === activeFolderRootId;
            })
            .sort((a, b) => getRemainingMs(a, now) - getRemainingMs(b, now));
    }, [allTrashedSubjects, activeFolderBinId, activeFolderRootId]);

    const activeFolderBinItems = useMemo(() => {
        if (!activeFolderBinId) return [];

        const now = new Date();
        return [...nestedFolderItems, ...nestedFolderSubjectItems]
            .sort((a, b) => getRemainingMs(a, now) - getRemainingMs(b, now));
    }, [activeFolderBinId, nestedFolderItems, nestedFolderSubjectItems]);

    const visibleTrashedItems = useMemo(
        () => (activeFolderBinId ? activeFolderBinItems : trashedItems),
        [activeFolderBinId, activeFolderBinItems, trashedItems]
    );

    const selectedItem = useMemo(
        () => visibleTrashedItems.find(item => item.id === selectedItemId && item.itemType === selectedItemType) ?? null,
        [visibleTrashedItems, selectedItemId, selectedItemType]
    );

    const buildActionKey = (itemId: any, itemType: any) => `${itemType}:${itemId}`;

    const loadTrashedItems = async () => {
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
            const [subjects, folders] = await Promise.all([
                getTrashedSubjects(),
                getTrashedFolders({ includeNested: true }),
            ]);

            const allSubjectItems = subjects.map((subject: any) => ({ ...subject, itemType: 'subject' }));
            setAllTrashedSubjects(allSubjectItems);

            const allFolderItems = folders.map((folder: any) => ({ ...folder, itemType: 'folder' }));
            setAllTrashedFolders(allFolderItems);

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

            const now = new Date();
            const sortedItems = [...subjectItems, ...folderItems]
                .sort((a, b) => getRemainingMs(a, now) - getRemainingMs(b, now));

            setTrashedItems(sortedItems);

            const allKnownItems = [...sortedItems, ...allSubjectItems, ...allFolderItems];
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

    // ── Action handlers ────────────────────────────────────────────────────────
    const handleRestore = async (itemId: any, itemType: any) => {
        const actionKey = buildActionKey(itemId, itemType);
        setActionLoading(actionKey);
        setErrorMessage(null);

        try {
            if (itemType === 'folder') {
                await restoreFolder(itemId);
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
                    return permanentlyDeleteSubject(item.id);
                })
            );

            const failures = results.filter(r => r.status === 'rejected');
            if (failures.length > 0) {
                setErrorMessage(`Se eliminaron ${results.length - failures.length} de ${results.length} elementos. Algunos fallaron por permisos insuficientes.`);
            }

            setSelectedItemId(null);
            setSelectedItemType(null);

            await loadTrashedItems();
            setEmptyConfirmOpen(false);
        } catch (err: any) {
            console.error('Error emptying bin:', err);
            setErrorMessage('Error al vaciar la papelera. Por favor, intenta mas tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleShowDescription = async (subject: any) => {
        setLoadingDescription(true);
        setDescriptionModal({ subject, topics: [] });
        try {
            const topicsSnap = await getDocs(
                query(collection(db, 'topics'), where('subjectId', '==', subject.id))
            );
            const topicsWithDetails = await Promise.all(
                topicsSnap.docs.map(async (topicDoc: any) => {
                    const topicData = { id: topicDoc.id, ...topicDoc.data() };

                    const [docsSnap, quizzesSnap] = await Promise.all([
                        getDocs(query(collection(db, 'documents'), where('topicId', '==', topicDoc.id))),
                        getDocs(query(collection(db, 'quizzes'),   where('topicId', '==', topicDoc.id))),
                    ]);

                    topicData.documents = docsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                    topicData.quizzes   = quizzesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                    return topicData;
                })
            );
            topicsWithDetails.sort((a, b: any) => (a.order || 0) - (b.order || 0));
            setDescriptionModal({ subject, topics: topicsWithDetails });
        } catch (err: any) {
            console.error('Error loading description:', err);
            setErrorMessage('Error al cargar la descripcion del elemento.');
            setDescriptionModal(null);
        } finally {
            setLoadingDescription(false);
        }
    };

    const toggleTopic = (topicId: any) =>
        setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));

    const handleSelectItem = (itemId: any, itemType: any) => {
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
    };

    const handleCloseFolderTrashView = () => {
        setFolderBinTrail(previousTrail => {
            if (!previousTrail.length) return previousTrail;
            return previousTrail.slice(0, -1);
        });
        setSelectedItemId(null);
        setSelectedItemType(null);
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
            <div className="flex items-center justify-between mb-2">
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
                            : 'Ordenado por urgencia: menos tiempo restante primero'}
                    </p>
                </div>
                <button
                    onClick={() => setEmptyConfirmOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                    <Trash2 size={16} />
                    {activeFolderBinId ? 'Vaciar vista actual' : 'Vaciar papelera'}
                </button>
            </div>

            {/* Grid / List */}
            {layoutMode === 'grid' ? (
                <div className="grid gap-6" style={gridStyle}>
                    {visibleTrashedItems.map((item: any) => {
                        const isSelected = selectedItemId === item.id && selectedItemType === item.itemType;
                        const hasSelection = Boolean(selectedItemId);

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
                                onSelect={() => handleSelectItem(item.id, item.itemType)}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="space-y-2">
                    {visibleTrashedItems.map((item: any) => {
                        const isSelected = selectedItemId === item.id && selectedItemType === item.itemType;
                        const daysRemaining = getDaysRemaining(item);
                        const trashedDate = toJsDate(item.trashedAt);
                        const isFolderItem = item.itemType === 'folder';

                        return (
                            <div
                                key={`${item.itemType}-${item.id}`}
                                className={`rounded-xl transition-all ${isSelected ? 'ring-2 ring-blue-400 bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
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
                                />
                                <div className="px-3 pb-2">
                                    <p className={`text-xs font-semibold ${getDaysRemainingTextClass(daysRemaining)}`}>
                                        {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} restantes
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Eliminada: {trashedDate ? trashedDate.toLocaleDateString() : 'Fecha no disponible'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Selection overlay (grid mode) ────────────────────────────────── */}
            {selectedItem && layoutMode === 'grid' && (
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
                        ? () => handleShowDescription(selectedItem)
                        : () => handleOpenFolderTrashView(selectedItem)}
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
                        onSelect={() => {
                            setSelectedItemId(null);
                            setSelectedItemType(null);
                        }}
                    />
                </BinSelectionOverlay>
            )}

            {/* List-mode inline panel (below the list, unchanged) */}
            {selectedItem && layoutMode !== 'grid' && (
                <aside className="mt-4 h-fit rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-4">
                    <div className="space-y-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Elemento seleccionado</p>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedItem.name}</h4>
                        <div className="space-y-2">
                            {selectedItem.itemType === 'folder' && (
                                <button onClick={() => handleOpenFolderTrashView(selectedItem)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all">
                                    Abrir contenido de carpeta
                                </button>
                            )}
                            {selectedItem.itemType === 'subject' && (
                                <button onClick={() => handleShowDescription(selectedItem)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all">
                                    Ver contenido
                                </button>
                            )}
                            <button onClick={() => handleRestore(selectedItem.id, selectedItem.itemType)}
                                disabled={actionLoading === buildActionKey(selectedItem.id, selectedItem.itemType)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all">
                                {actionLoading === buildActionKey(selectedItem.id, selectedItem.itemType)
                                    ? <Loader2 className="animate-spin" size={18} />
                                    : (selectedItem.itemType === 'folder' ? 'Restaurar carpeta completa' : 'Restaurar')}
                            </button>
                            <button onClick={() => setDeleteConfirm({ id: selectedItem.id, itemType: selectedItem.itemType })}
                                disabled={actionLoading === buildActionKey(selectedItem.id, selectedItem.itemType)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all">
                                Eliminar permanentemente
                            </button>
                        </div>
                    </div>
                </aside>
            )}

            {/* ── Modals ──────────────────────────────────────────────────────── */}
            <BinDescriptionModal
                descriptionModal={descriptionModal}
                loadingDescription={loadingDescription}
                expandedTopics={expandedTopics}
                onClose={() => setDescriptionModal(null)}
                onToggleTopic={toggleTopic}
            />

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
        </div>
    );
};

export default BinView;