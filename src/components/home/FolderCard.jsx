// src/components/home/FolderCard.jsx
import React from 'react';
import { useFolderCardLogic } from '../../hooks/useFolderCardLogic';
import FolderCardTab from './FolderCardTab';
import FolderCardBody from './FolderCardBody';

const FolderCard = (props) => {
    // 0. Refs for the custom drag logic
    const cardRef = React.useRef(null);
    const dragGhostRef = React.useRef(null);
    const dragOffsetRef = React.useRef({ x: 0, y: 0 });


    // 1. Initialize Logic
    const { state, data, handlers } = useFolderCardLogic({
        ...props,
        allFolders: props.allFolders
    });
    
    // 2. Destructure Props for direct usage
    const { 
        folder, 
        onOpen, 
        activeMenu, 
        onToggleMenu, 
        onEdit, 
        onDelete,
        onShare,
        onShowContents,
        isDragging,
        canDrop,
        draggable
    } = props;

    // --- CUSTOM DRAG LOGIC START ---

    // A. Start Drag: Clone, Style, and Hide Native Image
    const handleDragStartWithCustomImage = (e) => {
        const cardNode = cardRef.current;

        if (cardNode) {
            // 1. Calculate offset so ghost stays under mouse
            const rect = cardNode.getBoundingClientRect();
            dragOffsetRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            // 2. Clone the card
            const ghost = cardNode.cloneNode(true);
            
            // 3. Style the ghost (Fixed position, High Z-Index, NO Pointer Events)
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
            ghost.classList.remove('opacity-0', 'transition-all', 'duration-300');

            // --- NEW: Add ID and Transition for Breadcrumb interaction ---
            ghost.id = 'active-drag-ghost';
            ghost.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease'; // bouncy ease
            ghost.dataset.originalScale = data.scaleMultiplier; // Store original scale
            // -------------------------------------------------------------

            ghost.style.position = 'fixed';
            ghost.style.zIndex = '9999';
            ghost.style.pointerEvents = 'none';
            ghost.style.opacity = '1';
            ghost.style.transform = `scale(0.9)`;
            ghost.style.transformOrigin = 'center center';
            ghost.style.left = `${rect.left}px`;
            ghost.style.top = `${rect.top}px`;
            
            document.body.appendChild(ghost);
            dragGhostRef.current = ghost;

            // 4. Set drag image to a transparent pixel (hide default)
            const emptyImg = new Image();
            emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.dataTransfer.setDragImage(emptyImg, 0, 0);
        }

        // 5. Call original handler
        handlers.handleDragStart(e);
    };

    // B. Move Ghost manually
    const handleDrag = (e) => {
        if (dragGhostRef.current && e.clientX !== 0 && e.clientY !== 0) {
            const ghost = dragGhostRef.current;
            const x = e.clientX - dragOffsetRef.current.x;
            const y = e.clientY - dragOffsetRef.current.y;
            ghost.style.left = `${x}px`;
            ghost.style.top = `${y}px`;
        }
    };

    // C. Cleanup on End
    const handleDragEnd = (e) => {
        if (dragGhostRef.current) {
            document.body.removeChild(dragGhostRef.current);
            dragGhostRef.current = null;
        }
        handlers.handleDragEnd(e);
    };


    return (
        <div 
            ref={cardRef}
            className={`group relative w-full pt-3 transition-transform cursor-pointer ${
                isDragging ? 'opacity-0 scale-95' : 'hover:scale-105'
            } ${
                state.isOver && canDrop ? 'ring-4 ring-indigo-400 rounded-2xl dark:ring-indigo-500' : ''
            }`}
            style={{ aspectRatio: '16 / 10' }}
            onClick={() => onOpen(folder)}
            
            // Drag Events
            draggable={draggable}
            onDragStart={handleDragStartWithCustomImage}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onDragOver={handlers.handleDragOver}
            onDragLeave={handlers.handleDragLeave}
            onDrop={handlers.handleDrop}
        >
            {/* Drop Zone Indicator */}
            {state.isOver && canDrop && (
                <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-400/20 rounded-2xl z-50 flex items-center justify-center pointer-events-none">
                    <div className="bg-white dark:bg-slate-900 rounded-xl px-4 py-2 shadow-lg">
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            Soltar aquí
                        </p>
                    </div>
                </div>
            )}

            {/* --- 1. FOLDER TAB --- */}
            <FolderCardTab 
                isModern={data.isModern}
                gradientClass={data.gradientClass}
                scaleMultiplier={data.scaleMultiplier}
            />

            {/* --- 2. MAIN CARD BODY --- */}
            <FolderCardBody 
                folder={folder}
                isModern={data.isModern}
                gradientClass={data.gradientClass}
                fillColor={data.fillColor}
                scaleMultiplier={data.scaleMultiplier}
                subjectCount={data.subjectCount}
                folderCount={data.folderCount}
                totalCount={data.totalCount}
                activeMenu={activeMenu}
                onToggleMenu={onToggleMenu}
                onEdit={onEdit}
                onDelete={onDelete}
                onShare={onShare}
                onShowContents={onShowContents}
            />
        </div>
    );
};

export default FolderCard;