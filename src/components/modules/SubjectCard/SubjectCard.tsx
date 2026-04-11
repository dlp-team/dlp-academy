// src/components/modules/SubjectCard/SubjectCard.jsx
import React from 'react';
import { useSubjectCardLogic } from './useSubjectCardLogic';
import SubjectCardFront from './SubjectCardFront';
import { useGhostDrag } from '../../../hooks/useGhostDrag';
import { buildDragPayload, writeDragPayloadToDataTransfer } from '../../../utils/dragPayloadUtils';
import { withDarkGradientVariant } from '../../../utils/subjectConstants';
import { getNormalizedRole } from '../../../utils/permissionUtils';
import { getEndedSubjectBadge } from '../../../utils/academicYearLifecycleUtils';
import { SHARED_SELECTION_RING_CLASS } from '../../../utils/selectionVisualUtils';

const SubjectCard = (props: any) => {

    const { 
        topicCount, 
        isModern, 
        fillColor, 
        scaleMultiplier, 
        handlers 
    } = useSubjectCardLogic(props);

    const { 
        subject,
        user, 
        onSelect, 
        activeMenu, 
        onToggleMenu, 
        onEdit, 
        onDelete,
        draggable = false,
        isDragging = false,
        cardScale = 100,
        onOpenTopics,
        filterOverlayOpen = false,
        isSelected = false,
        selectMode = false,
        selectedItemKeys = new Set(),
        disableAllActions = false,
        disableDeleteActions = false,
        disableUnshareActions = false
    } = props;

    const selectionKey = `subject:${subject?.shortcutId || subject?.id}`;
    const hasMultiSelectionDrag = Boolean(
        selectMode
        && isSelected
        && selectedItemKeys instanceof Set
        && selectedItemKeys.size > 1
    );
    const multiDragCount = hasMultiSelectionDrag ? selectedItemKeys.size : 1;

    const gradientClass = withDarkGradientVariant(subject?.color || 'from-slate-500 to-slate-700');
    const normalizedRole = getNormalizedRole(user);
    const isPassedShortcut = subject?.hiddenInManual === true && subject?.targetType === 'subject' && normalizedRole === 'student';
    const endedBadge = isPassedShortcut
        ? null
        : getEndedSubjectBadge({ subject, user });
    const modernShellClass = isPassedShortcut
        ? 'bg-gradient-to-br from-emerald-400 via-cyan-400 to-teal-500 dark:from-emerald-300 dark:via-cyan-300 dark:to-teal-400'
        : `bg-gradient-to-br ${gradientClass}`;

    const handleLocalDragStart = (e: any) => {
        if (draggable) {
            const subjectParentId = subject.shortcutParentId ?? subject.folderId ?? null;
            e.dataTransfer.effectAllowed = 'move';
            const dragData = buildDragPayload({
                id: subject.id,
                type: 'subject',
                parentId: subjectParentId,
                shortcutId: subject.shortcutId || null
            });
            writeDragPayloadToDataTransfer(e.dataTransfer, dragData);
            
            // Trigger the parent's event (for UI state)
            if (props.onDragStart) {
                props.onDragStart(e, subject);
            }
        }
    };


    const { isDragging: isGhostDragging, itemRef, dragHandlers } = useGhostDrag({
        item: subject,
        type: 'subject',
        cardScale: cardScale,
        multiDragCount,
        onDragStart: handleLocalDragStart,
        onDragEnd: props.onDragEnd
    });


    return (
        <div 
            ref={itemRef}
            data-selection-key={selectionKey}
            className={`group relative w-full rounded-2xl shadow-lg dark:shadow-slate-900/50 transition-transform ${
                (isDragging || isGhostDragging) ? 'opacity-0 scale-95' : (!filterOverlayOpen ? 'hover:scale-105' : '')
            } ${
                isModern 
                    ? `${modernShellClass} p-[4px]` 
                    : ''
            } ${
                isSelected ? SHARED_SELECTION_RING_CLASS : ''
            }`}
            style={{ aspectRatio: '16 / 10' }}
            draggable={draggable}
            {...dragHandlers}
            onDragOver={handlers.handleDragOver}
            onDrop={handlers.handleDrop}
        >
            {/* INNER CONTENT */}
            <div className={`h-full w-full rounded-xl overflow-hidden relative ${
                isModern 
                    ? 'bg-white dark:bg-slate-950' 
                    : ''
            }`}>
                <SubjectCardFront 
                    subject={subject}
                    user={user}
                    isCompleted={Boolean(props.isCompleted)}
                    onToggleCompletion={props.onToggleCompletion}
                    onSelect={onSelect}
                    activeMenu={activeMenu}
                    onToggleMenu={onToggleMenu}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onShare={props.onShare}
                    isModern={isModern}
                    fillColor={fillColor}
                    scaleMultiplier={scaleMultiplier}
                    topicCount={topicCount}
                    onOpenTopics={onOpenTopics}
                    onOpenClasses={props.onOpenClasses}
                    onGoToFolder={props.onGoToFolder}
                    filterOverlayOpen={filterOverlayOpen}
                    disableAllActions={disableAllActions}
                    disableDeleteActions={disableDeleteActions}
                    disableUnshareActions={disableUnshareActions}
                    hideSharedIndicator={props.hideSharedIndicator}
                    isPassedShortcut={isPassedShortcut}
                    endedBadge={endedBadge}
                />
            </div>
        </div>
    );
};

export default SubjectCard;