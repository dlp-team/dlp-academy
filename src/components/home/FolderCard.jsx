// src/components/home/FolderCard.jsx
import React from 'react';
import { useFolderCardLogic } from '../../hooks/useFolderCardLogic'; // Adjust path
import FolderCardTab from './FolderCardTab';
import FolderCardBody from './FolderCardBody';

const FolderCard = (props) => {
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

    return (
        <div 
            className={`group relative w-full pt-3 transition-all cursor-pointer ${
                isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'
            } ${
                state.isOver && canDrop ? 'ring-4 ring-indigo-400 dark:ring-indigo-500' : ''
            }`}
            style={{ aspectRatio: '16 / 10' }}
            onClick={() => onOpen(folder)}
            onDragOver={handlers.handleDragOver}
            onDragLeave={handlers.handleDragLeave}
            onDrop={handlers.handleDrop}
            draggable={draggable}
            onDragStart={handlers.handleDragStart}
            onDragEnd={handlers.handleDragEnd}
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