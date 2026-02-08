// src/components/home/BreadcrumbNav.jsx
import React, { useState } from 'react';
import { ChevronRight, Home } from 'lucide-react';

const BreadcrumbNav = ({ 
    currentFolder, 
    allFolders, 
    onNavigate,
    // NEW PROPS for Drag & Drop
    onDropOnBreadcrumb, 
    draggedItem 
}) => {
    // State to track which breadcrumb segment is being hovered over
    // Use 'root' string for Inicio, folder IDs for others, null for none.
    const [hoveredId, setHoveredId] = useState(null);

    // 1. Build the breadcrumb path chain
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

    // --- DRAG & DROP HANDLERS ---

    const handleDragOver = (e, targetFolderId) => {
        e.preventDefault();
        e.stopPropagation();

        // 1. Don't highlight if we are currently IN this folder
        const currentId = currentFolder ? currentFolder.id : 'root';
        if (targetFolderId === currentId) return;

        // 2. Don't highlight if dragging a folder over itself in the breadcrumb
        if (draggedItem && draggedItem.id === targetFolderId) return;

        setHoveredId(targetFolderId);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setHoveredId(null);
    };

    const handleDrop = (e, targetFolderId) => {
        e.preventDefault();
        e.stopPropagation();
        setHoveredId(null);

        // Don't drop onto the current folder
        const currentId = currentFolder ? currentFolder.id : 'root';
        if (targetFolderId === currentId) return;

        const subjectId = e.dataTransfer.getData('subjectId');
        const folderId = e.dataTransfer.getData('folderId');

        // Convert 'root' back to null for the actual logic handler
        const finalTargetId = targetFolderId === 'root' ? null : targetFolderId;

        if (onDropOnBreadcrumb) {
            onDropOnBreadcrumb(finalTargetId, subjectId, folderId);
        }
    };

    // Helper for highlight styles
    const getDropZoneClasses = (id) => {
        // Only show highlight if something is being dragged AND this element is hovered
        if (draggedItem && hoveredId === id) {
            return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 scale-105 shadow-sm ring-2 ring-amber-300 dark:ring-amber-700 rounded-md';
        }
        return draggingCanDropHere(id) ? "hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md" : "";
    };

    // Helper to see if the drag even *could* drop here (to show mild hover effect)
    const draggingCanDropHere = (id) => {
         const currentId = currentFolder ? currentFolder.id : 'root';
         // Can't drop on current location, and can't drop folder on itself
         return draggedItem && id !== currentId && draggedItem.id !== id;
    }


    if (!currentFolder) return null;

    return (
        <nav className="flex mt-1 mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse flex-wrap">
                {/* 1. Root (Inicio) Link - NOW A DROP ZONE */}
                <li 
                    className={`inline-flex items-center transition-all duration-200 ${getDropZoneClasses('root')}`}
                    onDragOver={(e) => handleDragOver(e, 'root')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'root')}
                >
                    <button 
                        onClick={() => onNavigate(null)}
                        className={`inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 px-2 py-1 transition-colors ${
                            !draggedItem && "hover:text-indigo-600 dark:hover:text-indigo-400"
                        }`}
                    >
                        <Home size={16} className="me-2" />
                        Inicio
                    </button>
                </li>

                {/* 2. Dynamic Path Links - NOW DROP ZONES */}
                {breadcrumbPath.map((folder, index) => {
                    const isLast = index === breadcrumbPath.length - 1;
                    
                    return (
                        <li 
                            key={folder.id} 
                            className={`inline-flex items-center transition-all duration-200 ${!isLast ? getDropZoneClasses(folder.id) : ''}`}
                             // Only enable handlers if it's NOT the last item (current folder)
                            {...(!isLast ? {
                                onDragOver: (e) => handleDragOver(e, folder.id),
                                onDragLeave: handleDragLeave,
                                onDrop: (e) => handleDrop(e, folder.id)
                            } : {})}
                        >
                            <ChevronRight size={16} className="text-gray-400 mx-1" />
                            {isLast ? (
                                <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2 px-2 py-1">
                                    {folder.name}
                                </span>
                            ) : (
                                <button 
                                    onClick={() => onNavigate(folder)}
                                    className={`ms-1 text-sm font-medium text-gray-700 dark:text-gray-300 md:ms-2 px-2 py-1 transition-colors ${
                                         !draggedItem && "hover:text-indigo-600 dark:hover:text-indigo-400"
                                    }`}
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