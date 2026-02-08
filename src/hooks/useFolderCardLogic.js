// src/hooks/useFolderCardLogic.js
import { useState } from 'react';

export const useFolderCardLogic = ({
    folder,
    cardScale,
    canDrop,
    draggable,
    onDragOver,
    onDrop,          // Handles dropping a SUBJECT
    onDropFolder,    // NEW: Handles dropping a FOLDER (nesting)
    onDropReorder,
    onDragStart,
    onDragEnd,
    position
}) => {
    const [isOver, setIsOver] = useState(false);
    
    // Derived Data
    const subjectCount = folder.subjectIds ? folder.subjectIds.length : 0;
    const isModern = folder.cardStyle === 'modern';
    const fillColor = folder.modernFillColor || folder.fillColor;
    const scaleMultiplier = cardScale / 100;
    const gradientClass = folder.color || 'from-amber-400 to-amber-600';

    // --- DRAG AND DROP HANDLERS ---
    
    const handleDragOver = (e) => {
        if (canDrop) {
            e.preventDefault();
            e.stopPropagation();
            setIsOver(true);
        } else if (draggable && onDragOver) {
            e.preventDefault();
            onDragOver(e, position);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOver(false);
        
        const subjectId = e.dataTransfer.getData('subjectId');
        const draggedPosition = e.dataTransfer.getData('position');
        const droppedFolderId = e.dataTransfer.getData('folderId');
        
        // Case 1: Dropping a SUBJECT into this folder
        if (canDrop && onDrop && subjectId && !droppedFolderId) {
            onDrop(folder.id, subjectId);
        } 
        // Case 2: Dropping a FOLDER into this folder (Nesting)
        else if (canDrop && onDropFolder && droppedFolderId && droppedFolderId !== folder.id) {
            onDropFolder(folder.id, droppedFolderId);
        }
        // Case 3: Reordering (Only if NOT nesting)
        // We prioritize nesting if dropped ON the card. Reordering usually happens via dragOver on container, 
        // but if your logic relies on drop, this 'else if' ensures we don't reorder when we meant to nest.
        else if (draggable && onDropReorder && droppedFolderId && draggedPosition !== undefined) {
            onDropReorder(droppedFolderId, parseInt(draggedPosition), position);
        }
    };

    const handleDragStart = (e) => {
        if (draggable && onDragStart) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('folderId', folder.id);
            e.dataTransfer.setData('position', position.toString());
            onDragStart(folder, position);
        }
    };

    const handleDragEnd = (e) => {
        if (draggable && onDragEnd) {
            onDragEnd();
        }
    };

    return {
        state: { isOver },
        data: {
            subjectCount,
            isModern,
            fillColor,
            scaleMultiplier,
            gradientClass
        },
        handlers: {
            handleDragOver,
            handleDragLeave,
            handleDrop,
            handleDragStart,
            handleDragEnd
        }
    };
};