// src/pages/Home/components/bin/BinListItem.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import ListViewItem from '../../../../components/modules/ListViewItem';
import {
    getDaysRemaining,
    getDaysRemainingTextClass,
    toJsDate,
} from '../../utils/binViewUtils';
import { getBinUnselectedDimmingClass } from '../../../../utils/selectionVisualUtils';
import { isFolderItemType, isShortcutItemType } from '../../../../hooks/useBinData';

const ListViewItemComponent: any = ListViewItem;

interface BinListItemProps {
    item: any;
    user: any;
    cardScale: number;
    isSelected: boolean;
    hasSelection: boolean;
    selectionMode: boolean;
    actionLoading: string | null;
    actionKey: string;
    nestedFolderItems: any[];
    nestedFolderSubjectItems: any[];
    topLevelTrashedFolders: any[];
    topLevelTrashedSubjects: any[];
    activeFolderBinId: string | null;
    onSelect: () => void;
    onRestore: (id: string, type: string) => void;
    onDeleteConfirm: (id: string, type: string) => void;
    onOpenFolder: (item: any) => void;
    onOpenReadOnlySubject: (id: string) => void;
}

const BinListItem: React.FC<BinListItemProps> = ({
    item,
    user,
    cardScale,
    isSelected,
    hasSelection,
    selectionMode,
    actionLoading,
    actionKey,
    nestedFolderItems,
    nestedFolderSubjectItems,
    topLevelTrashedFolders,
    topLevelTrashedSubjects,
    activeFolderBinId,
    onSelect,
    onRestore,
    onDeleteConfirm,
    onOpenFolder,
    onOpenReadOnlySubject,
}) => {
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

    const showPressedState = !selectionMode && isSelected;

    return (
        <div
            data-testid={`bin-list-wrapper-${item.itemType}-${item.id}`}
            className={`rounded-xl transition-transform duration-200 ease-in-out ${!isSelected ? dimmingClass : ''} ${showPressedState ? 'relative scale-[1.01] shadow-[0_14px_30px_rgba(15,23,42,0.18)]' : ''}`}
        >
            <ListViewItemComponent
                user={user}
                item={item}
                type={isFolderItem ? 'folder' : 'subject'}
                onNavigate={onSelect}
                onNavigateSubject={onSelect}
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
                                <button
                                    onClick={() => onOpenFolder(item)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors"
                                >
                                    Abrir contenido de carpeta
                                </button>
                            )}
                            {item.itemType === 'subject' && (
                                <button
                                    onClick={() => onOpenReadOnlySubject(item.id)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors"
                                >
                                    Ver contenido
                                </button>
                            )}
                            <button
                                onClick={() => onRestore(item.id, item.itemType)}
                                disabled={actionLoading === actionKey}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-colors disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:text-gray-600 dark:disabled:text-slate-300 ${restoreActionClass}`}
                            >
                                {actionLoading === actionKey
                                    ? <Loader2 className="animate-spin" size={18} />
                                    : (item.itemType === 'folder'
                                        ? 'Restaurar carpeta completa'
                                        : isShortcutItemType(item.itemType)
                                            ? 'Restaurar acceso directo'
                                            : 'Restaurar')}
                            </button>
                            <button
                                onClick={() => onDeleteConfirm(item.id, item.itemType)}
                                disabled={actionLoading === actionKey}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:text-gray-600 dark:disabled:text-slate-300 font-semibold transition-colors"
                            >
                                Eliminar permanentemente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BinListItem;
