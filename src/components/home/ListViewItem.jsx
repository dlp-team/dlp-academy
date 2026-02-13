// src/components/home/ListViewItem.jsx
import React, { useState, useRef } from 'react';
import { GripVertical } from 'lucide-react';
import SubjectListItem from './SubjectListItem';
import FolderListItem from './FolderListItem';

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
    const [isDragging, setIsDragging] = useState(false);

    
    const scale = cardScale / 100;
    const indent = depth * (100 * scale);

    // 1. ADD REFS FOR GHOST DRAGGING
    const itemRef = useRef(null);
    const dragGhostRef = useRef(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    // 2. ADD CUSTOM DRAG HANDLERS
    const handleDragStartWithCustomImage = (e) => {
        setIsDragging(true);
        const cardNode = itemRef.current; // The DOM element of the list item

        if (cardNode) {
            // A. Calculate offset
            const rect = cardNode.getBoundingClientRect();
            dragOffsetRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            // B. Clone the card
            const ghost = cardNode.cloneNode(true);

            // C. Style the ghost (Fixed position, High Z-Index, NO Pointer Events)
            Object.assign(ghost.style, {
                position: 'fixed',
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                opacity: '1',            // <--- FORCE 100% OPACITY
                zIndex: '10000',         // On top of everything
                pointerEvents: 'none',   // Let clicks pass through to drop zones
                transition: 'none',      // No laggy animations
                transform: 'none',       // Reset transforms
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' // Optional: add shadow for depth
            });

            // Remove any classes that might hide it or interfere
            // Added 'scale-95' to ensure the ghost doesn't start shrunk
            ghost.classList.remove('opacity-0', 'transition-all', 'duration-300', 'scale-95');

            // --- NEW: Add ID and Transition for Breadcrumb interaction ---
            ghost.id = 'active-drag-ghost';
            ghost.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease'; // bouncy ease
            
            // Calculate scale multiplier from ListViewItem props
            const scaleMultiplier = cardScale ? cardScale / 100 : 1; 
            ghost.dataset.originalScale = scaleMultiplier; // Store original scale
            // -------------------------------------------------------------

            ghost.style.position = 'fixed';
            ghost.style.zIndex = '9999';
            ghost.style.pointerEvents = 'none';
            ghost.style.opacity = '1';
            ghost.style.transform = `scale(0.9)`;
            ghost.style.transformOrigin = 'center center';
            ghost.style.left = `${rect.left}px`;
            ghost.style.top = `${rect.top}px`;

            // D. Add to body
            document.body.appendChild(ghost);
            dragGhostRef.current = ghost;

            // E. HIDE the native browser drag image (The semi-transparent one)
            const emptyImg = new Image();
            emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.dataTransfer.setDragImage(emptyImg, 0, 0);
        }

        if (onDragStart) onDragStart(e, item, 'subject');
    };

    const handleDrag = (e) => {
        // e.clientX/Y drop to 0 at the very end of the drag cycle, ignore those frames
        if (dragGhostRef.current && e.clientX !== 0 && e.clientY !== 0) {
            const x = e.clientX - dragOffsetRef.current.x;
            const y = e.clientY - dragOffsetRef.current.y;
            
            // Use fixed coordinates to follow the cursor exactly
            dragGhostRef.current.style.left = `${x}px`;
            dragGhostRef.current.style.top = `${y}px`;
        }
    };

    const handleDragEndCustom = (e) => {
        setIsDragging(false);
        // Remove ghost from DOM
        if (dragGhostRef.current && dragGhostRef.current.parentNode) {
            dragGhostRef.current.parentNode.removeChild(dragGhostRef.current);
            dragGhostRef.current = null;
        }
        if (onDragEnd) onDragEnd(e);
    };

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
                onDragStart={handleDragStartWithCustomImage}
                onDrag={handleDrag}
                onDragEnd={handleDragEndCustom}
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