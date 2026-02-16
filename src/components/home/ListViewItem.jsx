// src/components/home/ListViewItem.jsx
import React, { useState } from 'react';
import { GripVertical } from 'lucide-react';
import SubjectListItem from './SubjectListItem';
import FolderListItem from './FolderListItem';
import { useGhostDrag } from '../../hooks/useGhostDrag'; // Adjust path if needed

const ListViewItem = ({ 
    item, 
    type, 
    parentId,
    depth = 0,
    allFolders, 
    allSubjects, 
    onNavigate, 
    onNavigateSubject,
    onEdit,
    onDelete,
    cardScale = 100, 
    onDragStart,
    onDragEnd,
    onDropAction
}) => {
    
    // Delegate to FolderListItem component if the item is a folder
    if (type === 'folder') {
        return (
            <FolderListItem
                item={item}
                parentId={parentId}
                depth={depth}
                allFolders={allFolders}
                allSubjects={allSubjects}
                onNavigate={onNavigate}
                onNavigateSubject={onNavigateSubject}
                onEdit={onEdit}
                onDelete={onDelete}
                cardScale={cardScale}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDropAction={onDropAction}
            />
        );
    }

    // Otherwise, treat the item as a Subject
    const [isHovered, setIsHovered] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    
    // Ensure dataTransfer payload is correctly set before delegating to the ghost hook
    const handleLocalDragStart = (e) => {
        e.stopPropagation();
        
        const dragData = {
            id: item.id,
            type: 'subject',
            parentId: parentId 
        };
        
        // Set dataTransfer payloads for drop zones to read!
        e.dataTransfer.setData('subjectId', item.id);
        e.dataTransfer.setData('treeItem', JSON.stringify(dragData));
        
        // Trigger the external prop if provided
        if (onDragStart) onDragStart(item); 
    };

    // Initialize custom ghost drag hook
    const { 
        isDragging, 
        itemRef, 
        dragHandlers 
    } = useGhostDrag({ 
        item, 
        type: 'subject', 
        cardScale, 
        onDragStart: handleLocalDragStart, // Pass the local interceptor here
        onDragEnd 
    });

    const scale = cardScale / 100;
    const indent = depth * (100 * scale);

    // Drop Zone Handlers
    const handleDragOver = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault(); e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setIsDragOver(false);

        const treeDataString = e.dataTransfer.getData('treeItem');
        let draggedData;

        if (treeDataString) {
            draggedData = JSON.parse(treeDataString);
        } else {
            const sId = e.dataTransfer.getData('subjectId');
            const fId = e.dataTransfer.getData('folderId');
            if (sId) draggedData = { id: sId, type: 'subject' };
            else if (fId) draggedData = { id: fId, type: 'folder' };
        }

        if (!draggedData || draggedData.id === item.id) return;

        onDropAction(draggedData, { id: item.id, type: type, parentId: parentId });
    };

    return (
        <div className="select-none animate-in fade-in duration-200">
            {/* ROW CONTAINER - Apply indentation here via margin */}
            <div 
                ref={itemRef}
                draggable
                onDragStart={dragHandlers.onDragStart}
                onDrag={dragHandlers.onDrag}
                onDragEnd={dragHandlers.onDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative group rounded-xl transition-all duration-200 border border-transparent z-10 ${
                    isDragOver 
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-500 scale-[1.01] shadow-md'
                        : ''
                } ${isDragging ? 'opacity-0 scale-95 transition-none' : ''}`}
                style={{ marginLeft: `${indent}px` }}
            >
                <div className="flex items-center gap-2">
                    <div className={`absolute left-2 z-20 text-gray-300 cursor-grab active:cursor-grabbing ${isHovered ? 'opacity-100' : 'opacity-0'}`} style={{ transform: `scale(${scale})` }}>
                        <GripVertical size={16} />
                    </div>
                    <div className="flex-1">
                        <SubjectListItem 
                            subject={item} 
                            onSelect={() => onNavigateSubject(item.id)} 
                            onEdit={onEdit} 
                            onDelete={onDelete} 
                            cardScale={cardScale} 
                            className="pl-8" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListViewItem;