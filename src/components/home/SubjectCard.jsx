// src/components/home/SubjectCard.jsx
import React from 'react';
import { useSubjectCardLogic } from '../../hooks/useSubjectCardLogic';
import SubjectCardFront from './SubjectCardFront';
import { useGhostDrag } from '../../hooks/useGhostDrag';

const SubjectCard = (props) => {

    const { 
        topicCount, 
        isModern, 
        fillColor, 
        scaleMultiplier, 
        handlers 
    } = useSubjectCardLogic(props);

    const { 
        subject, 
        onSelect, 
        onSelectTopic, 
        activeMenu, 
        onToggleMenu, 
        onEdit, 
        onDelete,
        draggable = false,
        isDragging = false,
        cardScale = 100,
        onOpenTopics,
        filterOverlayOpen = false
    } = props;

    const handleLocalDragStart = (e) => {
        if (draggable) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('subjectId', subject.id); // Essential for the drop logic
            e.dataTransfer.setData('type', 'subject');
            
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
        onDragStart: handleLocalDragStart,
        onDragEnd: props.onDragEnd
    });


    return (
        <div 
            ref={itemRef}
            className={`group relative w-full rounded-2xl shadow-lg dark:shadow-slate-900/50 transition-transform ${
                (isDragging || isGhostDragging) ? 'opacity-0 scale-95' : (!filterOverlayOpen ? 'hover:scale-105' : '')
            } ${
                isModern 
                    ? `bg-gradient-to-br ${subject.color} p-[4px]` 
                    : ''
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
                    filterOverlayOpen={filterOverlayOpen}
                />
            </div>
        </div>
    );
};

export default SubjectCard;