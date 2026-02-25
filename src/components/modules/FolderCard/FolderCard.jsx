// src/components/modules/FolderCard/FolderCard.jsx
import React from 'react';
import { useFolderCardLogic } from './useFolderCardLogic';
import FolderCardTab from './FolderCardTab';
import FolderCardBody from './FolderCardBody';
import { useGhostDrag } from '../../../hooks/useGhostDrag';

const FolderCard = (props) => {

    // 1. Initialize Logic
    const { state, data, handlers } = useFolderCardLogic({
        ...props,
        allFolders: props.allFolders,
        allSubjects: props.allSubjects
    });
    
    // 2. Destructure Props for direct usage
    const { 
        folder,
        user, 
        onOpen, 
        activeMenu, 
        onToggleMenu, 
        onEdit, 
        onDelete,
        onShare,
        onShowContents,
        isDragging,
        canDrop,
        draggable,
        cardScale = 100,
        filterOverlayOpen = false,
        onCloseFilterOverlay
    } = props;

    // --- CUSTOM DRAG LOGIC START ---
    

    const { isDragging: isGhostDragging, itemRef, dragHandlers } = useGhostDrag({
        item: folder,
        type: 'folder',
        cardScale: cardScale,
        onDragStart: handlers.handleDragStart,
        onDragEnd: handlers.handleDragEnd
    });


    return (
        <div 
            ref={itemRef}
            className={`group relative w-full pt-3 transition-transform cursor-pointer ${
                (isDragging || isGhostDragging) ? 'opacity-0 scale-95' : (!filterOverlayOpen ? 'hover:scale-105' : '')
            } ${
                state.isOver && canDrop ? 'ring-4 ring-indigo-400 rounded-2xl dark:ring-indigo-500' : ''
            }`}
            style={{ aspectRatio: '16 / 10' }}
            onClick={() => onOpen(folder)}
            // Drag Events
            draggable={draggable}
            {...dragHandlers}
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
                user={user}
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
                filterOverlayOpen={filterOverlayOpen}
                onCloseFilterOverlay={onCloseFilterOverlay}
            />
        </div>
    );
};

export default FolderCard;