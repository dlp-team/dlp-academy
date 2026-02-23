// src/components/modules/SubjectCard/useSubjectCardLogic.js

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
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('subjectId', subject.id);
            e.dataTransfer.setData('subjectType', 'subject');
            e.dataTransfer.setData('subjectParentId', subject.folderId || '');
            e.dataTransfer.setData('treeItem', JSON.stringify({
                id: subject.id,
                type: 'subject',
                parentId: subject.folderId || null
            }));
            e.dataTransfer.setData('position', position.toString());
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
            const draggedSubjectId = e.dataTransfer.getData('subjectId');
            const draggedPosition = parseInt(e.dataTransfer.getData('position'));
            onDrop(draggedSubjectId, draggedPosition, position);
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