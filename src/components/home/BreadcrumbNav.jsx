// src/components/home/BreadcrumbNav.jsx
import React, { useState } from 'react';
import { ChevronRight, Home } from 'lucide-react';

const BreadcrumbNav = ({ 
    currentFolder, 
    allFolders, 
    onNavigate,
    onDropOnBreadcrumb, 
    draggedItem 
}) => {
    const [hoveredId, setHoveredId] = useState(null);

    // --- GHOST MANIPULATION HELPERS ---
    
    const shrinkGhost = () => {
        const ghost = document.getElementById('active-drag-ghost');
        if (ghost) {
            // Scale down to 0.4 (40%) and fade slightly
            ghost.style.transform = 'scale(0.4)';
            ghost.style.opacity = '0.7'; 
        }
    };

    const restoreGhost = () => {
        const ghost = document.getElementById('active-drag-ghost');
        if (ghost) {
            // Restore to original scale (stored in dataset) or default 1
            const originalScale = ghost.dataset.originalScale || 1;
            ghost.style.transform = `scale(${originalScale})`;
            ghost.style.opacity = '0.9';
        }
    };

    // --- HANDLERS ---

    const handleDragOver = (e, targetFolderId) => {
        e.preventDefault();
        e.stopPropagation();

        const currentId = currentFolder ? currentFolder.id : 'root';
        if (targetFolderId === currentId) return;
        if (draggedItem && draggedItem.id === targetFolderId) return;

        setHoveredId(targetFolderId);

        // TRIGGER THE GHOST SHRINK
        if (draggingCanDropHere(targetFolderId)) {
            shrinkGhost();
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setHoveredId(null);
        
        // RESTORE THE GHOST SIZE
        restoreGhost();
    };

    const handleDrop = (e, targetFolderId) => {
        e.preventDefault();
        e.stopPropagation();
        setHoveredId(null);
        
        // Restore ghost immediately (though it will likely be removed by dragEnd)
        restoreGhost();

        const currentId = currentFolder ? currentFolder.id : 'root';
        if (targetFolderId === currentId) return;

        const subjectId = e.dataTransfer.getData('subjectId');
        const folderId = e.dataTransfer.getData('folderId');
        const finalTargetId = targetFolderId === 'root' ? null : targetFolderId;

        if (onDropOnBreadcrumb) {
            onDropOnBreadcrumb(finalTargetId, subjectId, folderId);
        }
    };

    // --- RENDER LOGIC ---

    // 1. Build path
    const breadcrumbPath = [];
    let tempFolder = currentFolder;
    while (tempFolder) {
        breadcrumbPath.unshift(tempFolder);
        if (tempFolder.parentId) {
            tempFolder = allFolders.find(f => f.id === tempFolder.parentId);
        } else {
            tempFolder = null;
        }
    }

    const getContainerClasses = (id) => {
        const isHovered = hoveredId === id;
        const canDrop = draggingCanDropHere(id);
        
        let classes = "relative inline-flex items-center px-3 py-1.5 rounded-lg transition-all duration-300 ease-out ";

        if (canDrop) {
            if (isHovered) {
                // Docking visual: Scale Up Breadcrumb, Change Color
                classes += "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 scale-110 -translate-y-0.5 z-10 font-semibold ring-2 ring-indigo-300 dark:ring-indigo-500 cursor-copy";
            } else {
                classes += "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 border-dashed hover:scale-105";
            }
        } else {
            classes += "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100";
        }
        return classes;
    };

    const draggingCanDropHere = (id) => {
         const currentId = currentFolder ? currentFolder.id : 'root';
         return draggedItem && id !== currentId && draggedItem.id !== id;
    }

    if (!currentFolder) return null;

    return (
        <nav className="flex mt-1 mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 flex-wrap">
                
                {/* ROOT */}
                <li>
                    <button 
                        onClick={() => onNavigate(null)}
                        onDragOver={(e) => handleDragOver(e, 'root')}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'root')}
                        className={getContainerClasses('root')}
                    >
                        <Home size={16} className="me-2" />
                        <span className="text-sm font-medium">Inicio</span>
                    </button>
                </li>

                {/* DYNAMIC PATH */}
                {breadcrumbPath.map((folder, index) => {
                    const isLast = index === breadcrumbPath.length - 1;
                    
                    return (
                        <li key={folder.id} className="inline-flex items-center">
                            <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 mx-1" />
                            {isLast ? (
                                <span className="px-3 py-1.5 ms-1 text-sm font-bold text-gray-900 dark:text-white bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                                    {folder.name}
                                </span>
                            ) : (
                                <button 
                                    onClick={() => onNavigate(folder)}
                                    onDragOver={(e) => handleDragOver(e, folder.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, folder.id)}
                                    className={`ms-1 text-sm ${getContainerClasses(folder.id)}`}
                                >
                                    {folder.name}
                                </button>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default BreadcrumbNav;