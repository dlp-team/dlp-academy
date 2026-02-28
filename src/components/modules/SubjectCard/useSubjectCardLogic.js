// src/components/modules/SubjectCard/useSubjectCardLogic.js

import { buildDragPayload, writeDragPayloadToDataTransfer, readDragPayloadFromDataTransfer } from '../../../utils/dragPayloadUtils';

export const useSubjectCardLogic = ({ 
    subject, 
    cardScale, 
    draggable, 
    onDragStart, 
    onDragEnd, 
    onDragOver, 
    onDrop, 
    position 
}) => {
    
    // Derived State Calculations
    const topicCount = subject.topics ? subject.topics.length : 0;
    
    // Check if the Modern style is active
    const isModern = subject.cardStyle === 'modern';
    
    // Use modernFillColor if available
    const fillColor = subject.modernFillColor || subject.fillColor;

    // Calculate scaled sizes based on cardScale
    const scaleMultiplier = cardScale / 100;
    
    // Handle drag events
    const handleDragStart = (e) => {
        if (draggable && onDragStart) {
            const subjectParentId = subject.shortcutParentId ?? subject.folderId ?? null;
            e.dataTransfer.effectAllowed = 'move';
            const dragData = buildDragPayload({
                id: subject.id,
                type: 'subject',
                parentId: subjectParentId,
                shortcutId: subject.shortcutId || null,
                position
            });
            writeDragPayloadToDataTransfer(e.dataTransfer, dragData);
            onDragStart(subject, position);
        }
    };

    const handleDragEnd = (e) => {
        if (draggable && onDragEnd) {
            onDragEnd();
        }
    };

    const handleDragOver = (e) => {
        if (draggable && onDragOver) {
            e.preventDefault();
            onDragOver(e, position);
        }
    };

    const handleDrop = (e) => {
        if (draggable && onDrop) {
            e.preventDefault();
            e.stopPropagation();
            const draggedData = readDragPayloadFromDataTransfer(e.dataTransfer);
            if (!draggedData || draggedData.type !== 'subject') return;
            onDrop(draggedData.shortcutId || draggedData.id, draggedData.position, position);
        }
    };

    return {
        topicCount,
        isModern,
        fillColor,
        scaleMultiplier,
        handlers: {
            handleDragStart,
            handleDragEnd,
            handleDragOver,
            handleDrop
        }
    };
};