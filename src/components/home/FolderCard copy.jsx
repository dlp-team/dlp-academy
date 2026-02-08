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
        activeMenu, 
        onToggleMenu, 
        onEdit, 
        onDelete,
        onShare,
        onShowContents, // NEW PROP
        isDragging,
        canDrop,
        draggable
    } = props;

    // ... (rest of the drag logic handleDragStartWithCustomImage, etc., stays exactly the same) ...
    // NOTE: Copying the Drag Logic from previous response to ensure file completeness if copied directly

    const handleDragStartWithCustomImage = (e) => {
        const cardNode = cardRef.current;
        if (cardNode) {
            const rect = cardNode.getBoundingClientRect();
            dragOffsetRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            const ghost = cardNode.cloneNode(true);
            Object.assign(ghost.style, {
                position: 'fixed',
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                opacity: '1',
                zIndex: '10000',
                pointerEvents: 'none',
                transition: 'none',
                transform: 'none',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
            });
            ghost.classList.remove('opacity-0', 'transition-all', 'duration-300');
            ghost.id = 'active-drag-ghost';
            ghost.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease';
            ghost.dataset.originalScale = data.scaleMultiplier;
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
            const emptyImg = new Image();
            emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.dataTransfer.setDragImage(emptyImg, 0, 0);
        }
        handlers.handleDragStart(e);
    };

    const handleDrag = (e) => {
        if (dragGhostRef.current && e.clientX !== 0) {
            const ghost = dragGhostRef.current;
            ghost.style.left = `${e.clientX - dragOffsetRef.current.x}px`;
            ghost.style.top = `${e.clientY - dragOffsetRef.current.y}px`;
        }
    };

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
            className={`relative w-full aspect-[1.3/1] transition-all duration-200 select-none group ${
                isDragging ? 'opacity-40 scale-95' : 'hover:-translate-y-1 hover:shadow-xl'
            }`}
            draggable={draggable}
            onDragStart={handleDragStartWithCustomImage}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onDragOver={handlers.handleDragOver}
            onDragLeave={handlers.handleDragLeave}
            onDrop={handlers.handleDrop}
        >
            {state.isOver && canDrop && (
                <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-400/20 rounded-2xl z-50 flex items-center justify-center pointer-events-none">
                    <div className="bg-white dark:bg-slate-900 rounded-xl px-4 py-2 shadow-lg">
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            Mover dentro
                        </p>
                    </div>
                </div>
            )}

            <FolderCardTab 
                isModern={data.isModern}
                gradientClass={data.gradientClass}
                scaleMultiplier={data.scaleMultiplier}
            />

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