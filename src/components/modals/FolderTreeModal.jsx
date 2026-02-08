// src/components/modals/FolderTreeModal.jsx
import React, { useState } from 'react';
import { X, Folder, ChevronRight, FileText, CornerDownRight, GripVertical } from 'lucide-react';
import SubjectIcon from '../modals/SubjectIcon';

// Helper to get gradient class or default
const getGradient = (color) => color || 'from-indigo-500 to-purple-500';

const TreeItem = ({ 
    item, 
    type, 
    index,            // Current index in parent's array
    parentId,         // ID of the parent folder
    allFolders, 
    allSubjects, 
    onNavigateFolder, 
    onNavigateSubject, 
    depth = 0,
    // D&D Handlers
    onDragStart,
    onDropItem
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // Determine children if it's a folder
    let childFolders = [];
    let childSubjects = [];

    if (type === 'folder') {
        if (item.folderIds && item.folderIds.length > 0) {
            childFolders = allFolders.filter(f => item.folderIds.includes(f.id));
            // Sort by index in the array to ensure order matches
            childFolders.sort((a, b) => item.folderIds.indexOf(a.id) - item.folderIds.indexOf(b.id));
        }
        if (item.subjectIds && item.subjectIds.length > 0) {
            childSubjects = allSubjects.filter(s => item.subjectIds.includes(s.id));
            childSubjects.sort((a, b) => item.subjectIds.indexOf(a.id) - item.subjectIds.indexOf(b.id));
        }
    }

    const hasChildren = childFolders.length > 0 || childSubjects.length > 0;
    
    // --- DRAG HANDLERS ---
    const handleDragStart = (e) => {
        e.stopPropagation();
        // Data payload for the operation
        const dragData = {
            id: item.id,
            type: type,
            parentId: parentId,
            index: index
        };
        e.dataTransfer.setData('treeItem', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'move';
        
        // Call parent handler for any global state if needed
        if (onDragStart) onDragStart(dragData);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Visual feedback
        if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const dataString = e.dataTransfer.getData('treeItem');
        if (!dataString) return;

        const draggedData = JSON.parse(dataString);

        // Prevent dropping on itself
        if (draggedData.id === item.id) return;

        // Trigger action via prop
        // We pass: Dragged Item info, and "Target" (this item) info
        onDropItem(draggedData, { id: item.id, type: type, parentId: parentId, index: index });
    };

    // --- NAVIGATION HANDLER ---
    const handleClick = (e) => {
        e.stopPropagation();
        if (type === 'folder') {
            onNavigateFolder(item);
        } else {
            onNavigateSubject(item);
        }
    };

    return (
        <div className="select-none">
            {/* The Item Row */}
            <div 
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 border border-transparent ${
                    isDragOver 
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-500 scale-[1.02] shadow-sm'
                        : type === 'folder' 
                            ? 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-800 dark:text-gray-100' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300'
                }`}
                style={{ marginLeft: `${depth * 20}px` }}
            >
                {/* Drag Handle (Visible on hover) */}
                <div className={`text-gray-300 dark:text-gray-600 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <GripVertical size={14} />
                </div>

                {/* Visual Connector for hierarchy */}
                {depth > 0 && (
                    <CornerDownRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0 -ml-1" />
                )}

                {/* COLORED ICON CONTAINER */}
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-gradient-to-br ${getGradient(item.color)}`}>
                    {type === 'folder' ? (
                        item.icon ? (
                            <SubjectIcon iconName={item.icon} className="w-5 h-5 text-white" />
                        ) : (
                            <Folder size={16} className="text-white" />
                        )
                    ) : (
                        item.icon ? (
                            <SubjectIcon iconName={item.icon} className="w-5 h-5 text-white" />
                        ) : (
                            <FileText size={16} className="text-white" />
                        )
                    )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${type === 'folder' ? 'font-semibold' : 'font-medium'}`}>
                        {item.name}
                    </p>
                    {/* Optional: Show small subtitle or topics count */}
                    {type === 'subject' && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                            {item.topics?.length || 0} temas
                        </p>
                    )}
                </div>

                {/* Count Badge for Folders */}
                {type === 'folder' && (
                    <span className="text-xs bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-gray-400 group-hover:text-indigo-500 group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors">
                        {childFolders.length + childSubjects.length}
                    </span>
                )}
            </div>

            {/* Recursively render children */}
            {hasChildren && (
                <div className="border-l-2 border-gray-100 dark:border-slate-800 ml-[2.25rem] my-1 pl-1">
                    {childFolders.map((folder, idx) => (
                        <TreeItem 
                            key={folder.id} 
                            item={folder} 
                            type="folder"
                            index={idx}
                            parentId={item.id}
                            allFolders={allFolders} 
                            allSubjects={allSubjects}
                            onNavigateFolder={onNavigateFolder}
                            onNavigateSubject={onNavigateSubject}
                            depth={depth + 1} 
                            onDragStart={onDragStart}
                            onDropItem={onDropItem}
                        />
                    ))}
                    {childSubjects.map((subject, idx) => (
                        <TreeItem 
                            key={subject.id} 
                            item={subject} 
                            type="subject" 
                            index={idx}
                            parentId={item.id}
                            allFolders={allFolders} 
                            allSubjects={allSubjects}
                            onNavigateFolder={onNavigateFolder}
                            onNavigateSubject={onNavigateSubject}
                            depth={depth + 1} 
                            onDragStart={onDragStart}
                            onDropItem={onDropItem}
                        />
                    ))}
                </div>
            )}
            
            {/* Empty State for Folders */}
            {type === 'folder' && !hasChildren && (
                <div className="ml-12 py-1 text-xs text-gray-400 italic">
                    (Vacío - Arrastra elementos aquí)
                </div>
            )}
        </div>
    );
};

const FolderTreeModal = ({ 
    isOpen, 
    onClose, 
    rootFolder, 
    allFolders, 
    allSubjects, 
    onNavigateFolder,
    onNavigateSubject,
    // Actions passed from Home
    onMoveSubjectToFolder,
    onNestFolder,
    onReorderSubject
}) => {
    
    if (!isOpen || !rootFolder) return null;

    // --- MAIN LOGIC FOR TREE DROPPING ---
    const handleDropAction = (dragged, target) => {
        // dragged: { id, type, parentId, index }
        // target: { id, type, parentId, index } (The item being dropped ON)

        console.log('Tree Drop:', { dragged, target });

        // SCENARIO 1: Drop ON a Folder (Nesting / Moving into)
        if (target.type === 'folder') {
            // Prevent nesting into itself or immediate parent (redundant)
            if (dragged.id === target.id) return;
            if (dragged.parentId === target.id) return; // Already inside

            if (dragged.type === 'subject') {
                onMoveSubjectToFolder(dragged.id, target.id); // target.id is the new parent folder
            } else if (dragged.type === 'folder') {
                onNestFolder(target.id, dragged.id); // target.id is parent, dragged.id is child
            }
        }
        
        // SCENARIO 2: Drop ON a Subject (Reordering within same folder)
        else if (target.type === 'subject' && dragged.type === 'subject') {
            // Must be in the same folder to reorder simply by index swapping
            // If dragging from another folder onto a subject, we interpret that as "Move to this subject's parent"
            
            const targetParentId = target.parentId || rootFolder.id; // Fallback if direct child of root view
            
            if (dragged.parentId !== targetParentId) {
                // Moving from Folder A to Folder B (placing next to a subject)
                onMoveSubjectToFolder(dragged.id, targetParentId);
            } else {
                // Same folder: Reorder
                // We pass the parent ID, the subject ID, and the NEW index (target's index)
                onReorderSubject(targetParentId, dragged.id, target.index);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col border border-gray-100 dark:border-slate-700 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${getGradient(rootFolder.color)} shadow-sm`}>
                            {rootFolder.icon ? (
                                <SubjectIcon iconName={rootFolder.icon} className="w-5 h-5 text-white" />
                            ) : (
                                <Folder className="text-white w-5 h-5" />
                            )}
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                                {rootFolder.name}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Estructura del contenido
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tree Content (Scrollable) */}
                <div className="p-4 overflow-y-auto min-h-[300px] custom-scrollbar bg-slate-50/50 dark:bg-slate-950/30">
                    
                    {(() => {
                        // Prepare root children
                        let childFolders = [];
                        let childSubjects = [];

                        if (rootFolder.folderIds) {
                            childFolders = allFolders.filter(f => rootFolder.folderIds.includes(f.id));
                            childFolders.sort((a, b) => rootFolder.folderIds.indexOf(a.id) - rootFolder.folderIds.indexOf(b.id));
                        }
                        if (rootFolder.subjectIds) {
                            childSubjects = allSubjects.filter(s => rootFolder.subjectIds.includes(s.id));
                            childSubjects.sort((a, b) => rootFolder.subjectIds.indexOf(a.id) - rootFolder.subjectIds.indexOf(b.id));
                        }
                        
                        if (childFolders.length === 0 && childSubjects.length === 0) {
                            return (
                                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                    <Folder size={48} className="mb-2 opacity-20" />
                                    <p>Esta carpeta está vacía</p>
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-1">
                                {childFolders.map((folder, idx) => (
                                    <TreeItem 
                                        key={folder.id} 
                                        item={folder} 
                                        type="folder"
                                        index={idx}
                                        parentId={rootFolder.id}
                                        allFolders={allFolders} 
                                        allSubjects={allSubjects} 
                                        onNavigateFolder={onNavigateFolder}
                                        onNavigateSubject={onNavigateSubject}
                                        onDropItem={handleDropAction}
                                    />
                                ))}
                                {childSubjects.map((subject, idx) => (
                                    <TreeItem 
                                        key={subject.id} 
                                        item={subject} 
                                        type="subject"
                                        index={idx}
                                        parentId={rootFolder.id}
                                        allFolders={allFolders} 
                                        allSubjects={allSubjects} 
                                        onNavigateFolder={onNavigateFolder}
                                        onNavigateSubject={onNavigateSubject}
                                        onDropItem={handleDropAction}
                                    />
                                ))}
                            </div>
                        );
                    })()}
                </div>
                
                <div className="p-3 border-t border-gray-100 dark:border-slate-800 text-center text-xs text-gray-400">
                    Arrastra los elementos para organizarlos
                </div>
            </div>
        </div>
    );
};

export default FolderTreeModal;