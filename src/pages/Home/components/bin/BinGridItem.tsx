// src/pages/Home/components/bin/BinGridItem.tsx
import React from 'react';
import { Folder, Link2 } from 'lucide-react';
import SubjectCard from '../../../../components/modules/SubjectCard/SubjectCard';
import { getDaysRemaining, getDaysRemainingTextClass, toJsDate } from '../../utils/binViewUtils';

const BinGridItem = React.forwardRef<any, any>(({ item, itemType = 'subject', user, cardScale, isSelected, hasSelection, selectionMode = false, onSelect }, ref: any) => {
    const daysRemaining = getDaysRemaining(item);
    const trashedDate   = toJsDate(item.trashedAt);
    const isShortcutItem = itemType === 'shortcut-subject' || itemType === 'shortcut-folder';
    const isFolderItem = itemType === 'folder' || itemType === 'shortcut-folder';

    return (
        <div
            ref={ref}
            className={`transition-all duration-200 ${
                isSelected    ? 'relative'
                : hasSelection && !selectionMode ? 'opacity-30 pointer-events-none'
                : 'hover:scale-[1.02]'
            }`}
        >
            <div
                data-testid={`bin-${itemType}-card-${item.id}`}
                className={`rounded-2xl cursor-pointer transition-shadow ${
                    isSelected ? 'ring-2 ring-sky-500/70 shadow-[0_0_0_3px_rgba(14,165,233,0.15)]' : ''
                }`}
                onClick={onSelect}
            >
                {isFolderItem ? (
                    <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 p-5 min-h-[180px] flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                <Folder size={20} />
                            </div>
                            <span className="text-[11px] uppercase tracking-wide text-amber-700 dark:text-amber-300 font-semibold">
                                {isShortcutItem ? 'Acceso directo' : 'Carpeta'}
                            </span>
                        </div>
                        <div className="mt-4">
                            <h4 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2">
                                {item?.name || 'Carpeta sin nombre'}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                                {isShortcutItem
                                    ? 'Acceso directo eliminado por el usuario.'
                                    : 'Incluye subcarpetas y asignaturas eliminadas con esta carpeta.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        {isShortcutItem && (
                            <span className="absolute z-10 right-3 top-3 inline-flex items-center gap-1 rounded-full bg-sky-100/95 dark:bg-sky-900/70 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                                <Link2 size={12} />
                                Acceso directo
                            </span>
                        )}
                        <SubjectCard
                            subject={item}
                            user={user}
                            onSelect={() => {}}
                            activeMenu={null}
                            onToggleMenu={() => {}}
                            onEdit={() => {}}
                            onDelete={() => {}}
                            onShare={() => {}}
                            draggable={false}
                            cardScale={cardScale}
                            filterOverlayOpen={true}
                            disableAllActions={true}
                            onOpenTopics={null}
                        />
                    </div>
                )}
            </div>

            <div className="mt-2 px-1">
                <p className={`text-xs font-semibold ${getDaysRemainingTextClass(daysRemaining)}`}>
                    {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} restantes
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Eliminada: {trashedDate ? trashedDate.toLocaleDateString() : 'Fecha no disponible'}
                </p>
            </div>
        </div>
    );
});

BinGridItem.displayName = 'BinGridItem';
export default BinGridItem;