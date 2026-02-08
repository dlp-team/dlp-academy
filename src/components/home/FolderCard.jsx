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
    const { state, data, handlers } = useFolderCardLogic(props);
    
    // 2. Destructure Props for direct usage
    const { 
        folder, 
        onOpen, 
        activeMenu, 
        onToggleMenu, 
        onEdit, 
        onDelete,
        onShare,
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

            // 3. Style the ghost (Force Opacity 1)
            Object.assign(ghost.style, {
                position: 'fixed',
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                opacity: '1',            // <--- CRITICAL
                zIndex: '10000',         
                pointerEvents: 'none',   
                transition: 'none',      
                transform: 'none',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' // Nice shadow while dragging
            });

            // 4. Remove conflicting classes
            ghost.classList.remove('opacity-0', 'transition-all', 'hover:scale-105', 'cursor-pointer');

            // 5. Mount to body
            document.body.appendChild(ghost);
            dragGhostRef.current = ghost;

            // 6. Hide the native browser drag image
            const emptyImg = new Image();
            emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.dataTransfer.setDragImage(emptyImg, 0, 0);
        }

        // Call original logic
        handlers.handleDragStart(e);
    };

    // B. Move Ghost manually
    const handleDragMove = (e) => {
        if (dragGhostRef.current) {
            // Ignore the (0,0) event that fires on drop
            if (e.clientX === 0 && e.clientY === 0) return;

            const x = e.clientX - dragOffsetRef.current.x;
            const y = e.clientY - dragOffsetRef.current.y;

            dragGhostRef.current.style.left = `${x}px`;
            dragGhostRef.current.style.top = `${y}px`;
        }
    };

    // C. Cleanup on End
    const handleDragEndWithCleanup = (e) => {
        if (dragGhostRef.current) {
            dragGhostRef.current.remove();
            dragGhostRef.current = null;
        }
        handlers.handleDragEnd(e);
    };

    // --- CUSTOM DRAG LOGIC END ---

    return (
        <div 
            ref={cardRef} // Attach Ref
            className={`group relative w-full pt-3 transition-transform cursor-pointer ${
                isDragging ? 'opacity-0 scale-95' : 'hover:scale-105'
            } ${
                state.isOver && canDrop ? 'ring-4 ring-indigo-400 rounded-2xl dark:ring-indigo-500' : ''
            }`}
            style={{ aspectRatio: '16 / 10' }}
            onClick={() => onOpen(folder)}
            
            // Drag Events
            draggable={draggable}
            onDragStart={handleDragStartWithCustomImage} // Custom Handler
            onDrag={handleDragMove}                      // Custom Handler
            onDragEnd={handleDragEndWithCleanup}         // Custom Handler
            
            // Drop Events (Keep original)
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
                activeMenu={activeMenu}
                onToggleMenu={onToggleMenu}
                onEdit={onEdit}
                onDelete={onDelete}
                onShare={onShare}
            />
        </div>
    );
};

export default FolderCard;