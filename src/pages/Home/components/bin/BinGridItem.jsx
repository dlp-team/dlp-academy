// src/pages/Home/components/bin/BinGridItem.jsx
import React from 'react';
import SubjectCard from '../../../../components/modules/SubjectCard/SubjectCard';
import { getDaysRemaining, getDaysRemainingTextClass, toJsDate } from '../../utils/binViewUtils';

const BinGridItem = React.forwardRef(({ subject, user, cardScale, isSelected, hasSelection, onSelect }, ref) => {
    const daysRemaining = getDaysRemaining(subject);
    const trashedDate   = toJsDate(subject.trashedAt);

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
                data-testid={`bin-subject-card-${subject.id}`}
                className="rounded-2xl cursor-pointer"
                onClick={onSelect}
            >
                <SubjectCard
                    subject={subject}
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