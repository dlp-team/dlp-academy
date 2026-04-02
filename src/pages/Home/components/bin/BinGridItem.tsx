// src/pages/Home/components/bin/BinGridItem.jsx
import React from 'react';
import { Folder } from 'lucide-react';
import SubjectCard from '../../../../components/modules/SubjectCard/SubjectCard';
import { getDaysRemaining, getDaysRemainingTextClass, toJsDate } from '../../utils/binViewUtils';

const BinGridItem = React.forwardRef<any, any>(({ item, itemType = 'subject', user, cardScale, isSelected, hasSelection, onSelect }, ref: any) => {
    const daysRemaining = getDaysRemaining(item);
    const trashedDate   = toJsDate(item.trashedAt);

    return (
        <div
            ref={ref}
            className={`transition-all duration-200 ${
                isSelected    ? 'relative'
                : hasSelection ? 'opacity-30 pointer-events-none'
                : 'hover:scale-[1.02]'
            }`}
        >
            <div
                data-testid={`bin-${itemType}-card-${item.id}`}
                className="rounded-2xl cursor-pointer"
                onClick={onSelect}
            >
                {itemType === 'folder' ? (
                    <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 p-5 min-h-[180px] flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                <Folder size={20} />
                            </div>
                            <span className="text-[11px] uppercase tracking-wide text-amber-700 dark:text-amber-300 font-semibold">
                                Carpeta
                            </span>
                        </div>
                        <div className="mt-4">
                            <h4 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2">
                                {item?.name || 'Carpeta sin nombre'}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                                Incluye subcarpetas y asignaturas eliminadas con esta carpeta.
                            </p>
                        </div>
                    </div>
                ) : (
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