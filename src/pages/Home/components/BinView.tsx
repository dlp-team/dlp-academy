// src/pages/Home/components/BinView.tsx
import React, { useRef } from 'react';
import { Trash2, Loader2, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import useBinData from '../../../hooks/useBinData';
import useBinActions from '../../../hooks/useBinActions';

import BinGridItem          from './bin/BinGridItem';
import BinSelectionOverlay  from './bin/BinSelectionOverlay';
import BinToolbar           from './bin/BinToolbar';
import BinSelectionToolbar  from './bin/BinSelectionToolbar';
import BinListItem          from './bin/BinListItem';
import { DeleteConfirmModal, EmptyBinConfirmModal } from './bin/BinConfirmModals';

// ─────────────────────────────────────────────────────────────────────────────

const BinView = ({ user, cardScale = 100, layoutMode = 'grid' }: any) => {
    const navigate = useNavigate();
    const getPreviewSafePath = (path: any) => {
        if (user?.__previewLock === true && typeof path === 'string' && path.startsWith('/home')) {
            return `/theme-preview${path}`;
        }
        return path;
    };

    const selectedCardRef = useRef<any>(null);

    const binData = useBinData(user);
    const actions = useBinActions(binData, navigate, getPreviewSafePath);

    const {
        loading, actionLoading, errorMessage, deleteConfirm, emptyConfirmOpen,
        selectedItemId, selectedItemType, sortMode, selectionMode,
        bulkDeleteConfirmOpen, bulkActionLoading,
        isStudent, activeFolderBinId, visibleTrashedItems, selectedItem,
        topLevelTrashedSubjects, topLevelTrashedFolders,
        nestedFolderItems, nestedFolderSubjectItems,
        selectedBulkCount, selectedBulkKeys,
        activeFolderPathLabel, folderBackButtonLabel,
        setErrorMessage, setDeleteConfirm, setEmptyConfirmOpen, setSortMode,
        setBulkDeleteConfirmOpen, buildActionKey,
    } = binData;

    const {
        toggleBulkSelectionMode, handleSelectAllVisible, clearBulkSelection,
        handleBulkRestore, handleBulkPermanentDelete,
        handleRestore, handlePermanentDelete, handleEmptyBin,
        handleOpenReadOnlySubject, handleSelectItem,
        handleOpenFolderTrashView, handleCloseFolderTrashView,
    } = actions;

    // ── Student guard ──────────────────────────────────────────────────────────
    if (isStudent) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-16">
                <XCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-2">Acceso denegado</h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg">La papelera no está disponible para alumnos.</p>
            </div>
        );
    }

    // ── Loading state ──────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    // ── Empty state ────────────────────────────────────────────────────────────
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
        gridTemplateColumns: `repeat(auto-fill, minmax(${(320 * cardScale) / 100}px, 1fr))`,
    };

    // ── Main render ────────────────────────────────────────────────────────────
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
            <BinToolbar
                activeFolderBinId={activeFolderBinId}
                activeFolderPathLabel={activeFolderPathLabel}
                folderBackButtonLabel={folderBackButtonLabel}
                visibleCount={visibleTrashedItems.length}
                sortMode={sortMode}
                onSortChange={setSortMode}
                onEmptyBin={() => setEmptyConfirmOpen(true)}
                onCloseFolderView={handleCloseFolderTrashView}
            />

            {/* Selection toolbar */}
            <BinSelectionToolbar
                selectionMode={selectionMode}
                selectedBulkCount={selectedBulkCount}
                visibleCount={visibleTrashedItems.length}
                bulkActionLoading={bulkActionLoading}
                onToggleSelectionMode={toggleBulkSelectionMode}
                onSelectAll={handleSelectAllVisible}
                onClearSelection={clearBulkSelection}
                onBulkRestore={handleBulkRestore}
                onBulkDelete={() => setBulkDeleteConfirmOpen(true)}
            />

            {/* Grid / List */}
            {layoutMode === 'grid' ? (
                <div className="grid gap-6" style={gridStyle}>
                    {visibleTrashedItems.map((item: any) => {
                        const isSelected = selectionMode
                            ? selectedBulkKeys.has(buildActionKey(item.id, item.itemType))
                            : (selectedItemId === item.id && selectedItemType === item.itemType);
                        const hasSelection = selectionMode ? selectedBulkCount > 0 : false;
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
                        const actionKey = buildActionKey(item.id, item.itemType);

                        return (
                            <BinListItem
                                key={`${item.itemType}-${item.id}`}
                                item={item}
                                user={user}
                                cardScale={cardScale}
                                isSelected={isSelected}
                                hasSelection={hasSelection}
                                selectionMode={selectionMode}
                                actionLoading={actionLoading}
                                actionKey={actionKey}
                                nestedFolderItems={nestedFolderItems}
                                nestedFolderSubjectItems={nestedFolderSubjectItems}
                                topLevelTrashedFolders={topLevelTrashedFolders}
                                topLevelTrashedSubjects={topLevelTrashedSubjects}
                                activeFolderBinId={activeFolderBinId}
                                onSelect={() => handleSelectItem(item.id, item.itemType)}
                                onRestore={handleRestore}
                                onDeleteConfirm={(id: any, type: any) => setDeleteConfirm({ id, itemType: type })}
                                onOpenFolder={handleOpenFolderTrashView}
                                onOpenReadOnlySubject={handleOpenReadOnlySubject}
                            />
                        );
                    })}
                </div>
            )}

            {/* Selection overlay (grid mode) */}
            {selectedItem && layoutMode === 'grid' && !selectionMode && (
                <BinSelectionOverlay
                    item={selectedItem}
                    itemType={selectedItem.itemType}
                    selectedCardRef={selectedCardRef}
                    actionLoading={actionLoading}
                    onClose={() => {
                        binData.setSelectedItemId(null);
                        binData.setSelectedItemType(null);
                    }}
                    onShowDescription={selectedItem.itemType === 'subject'
                        ? () => handleOpenReadOnlySubject(selectedItem.id)
                        : selectedItem.itemType === 'folder'
                            ? () => handleOpenFolderTrashView(selectedItem)
                            : undefined}
                    onRestore={handleRestore}
                    onDeleteConfirm={(itemId: any, itemType: any) => setDeleteConfirm({ id: itemId, itemType })}
                >
                    <BinGridItem
                        item={selectedItem}
                        itemType={selectedItem.itemType}
                        user={user}
                        cardScale={cardScale}
                        isSelected={true}
                        hasSelection={false}
                        selectionMode={false}
                        onSelect={() => {
                            binData.setSelectedItemId(null);
                            binData.setSelectedItemType(null);
                        }}
                    />
                </BinSelectionOverlay>
            )}

            {/* Modals */}
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