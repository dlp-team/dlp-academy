// src/components/modals/FolderTreeModal.jsx
import React, { useState } from 'react';
import { X, Folder, ChevronRight, FileText, CornerDownRight, GripVertical, ArrowUpCircle } from 'lucide-react';
import SubjectIcon from './SubjectIcon';

const getGradient = (color) => color || 'from-indigo-500 to-purple-500';

const TreeItem = ({ 
    item, 
    type, 
    index,            
    parentId,         
    allFolders, 
    allSubjects, 
    onNavigateFolder, 
    onNavigateSubject, 
    depth = 0,
    onDragStart,
    onDropItem
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    let childFolders = [];
    let childSubjects = [];

    if (type === 'folder') {
        if (item.folderIds && item.folderIds.length > 0) {
            childFolders = allFolders.filter(f => item.folderIds.includes(f.id));
            // Keep original order from folderIds array
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
        const dragData = { id: item.id, type: type, parentId: parentId, index: index };
        e.dataTransfer.setData('treeItem', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'move';
        if (onDragStart) onDragStart(dragData);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
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

        const treeDataString = e.dataTransfer.getData('treeItem');
        
        // 1. Internal Drop
        if (treeDataString) {
            const draggedData = JSON.parse(treeDataString);
            if (draggedData.id === item.id) return;
            onDropItem(draggedData, { id: item.id, type: type, parentId: parentId, index: index });
            return;
        }

        // 2. External Drop (Home -> Tree)
        const subjectId = e.dataTransfer.getData('subjectId');
        const folderId = e.dataTransfer.getData('folderId');

        if (subjectId) {
            onDropItem({ id: subjectId, type: 'subject', parentId: undefined }, { id: item.id, type: type, parentId: parentId, index: index });
        } else if (folderId) {
            if (folderId === item.id) return;
            onDropItem({ id: folderId, type: 'folder', parentId: undefined }, { id: item.id, type: type, parentId: parentId, index: index });
        }
    };

    const handleClick = (e) => {
        e.stopPropagation();
        if (type === 'folder') onNavigateFolder(item);
        else onNavigateSubject(item);
    };

    return (
        <div className="select-none">
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
                <div className={`text-gray-300 dark:text-gray-600 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <GripVertical size={14} />
                </div>

                {depth > 0 && <CornerDownRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0 -ml-1" />}

                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-gradient-to-br ${getGradient(item.color)}`}>
                    {type === 'folder' ? (
                        item.icon ? <SubjectIcon iconName={item.icon} className="w-5 h-5 text-white" /> : <Folder size={16} className="text-white" />
                    ) : (
                        item.icon ? <SubjectIcon iconName={item.icon} className="w-5 h-5 text-white" /> : <FileText size={16} className="text-white" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${type === 'folder' ? 'font-semibold' : 'font-medium'}`}>
                        {item.name}
                    </p>
                    {type === 'subject' && <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{item.topics?.length || 0} temas</p>}
                </div>

                {type === 'folder' && (
                    <span className="text-xs bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-gray-400 group-hover:text-indigo-500 group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors">
                        {childFolders.length + childSubjects.length}
                    </span>
                )}
            </div>

            {hasChildren && (
                <div className="border-l-2 border-gray-100 dark:border-slate-800 ml-[2.25rem] my-1 pl-1">
                    {childFolders.map((folder, idx) => (
                        <TreeItem key={folder.id} item={folder} type="folder" index={idx} parentId={item.id} allFolders={allFolders} allSubjects={allSubjects} onNavigateFolder={onNavigateFolder} onNavigateSubject={onNavigateSubject} depth={depth + 1} onDragStart={onDragStart} onDropItem={onDropItem} />
                    ))}
                    {childSubjects.map((subject, idx) => (
                        <TreeItem key={subject.id} item={subject} type="subject" index={idx} parentId={item.id} allFolders={allFolders} allSubjects={allSubjects} onNavigateFolder={onNavigateFolder} onNavigateSubject={onNavigateSubject} depth={depth + 1} onDragStart={onDragStart} onDropItem={onDropItem} />
                    ))}
                </div>
            )}
            
            {type === 'folder' && !hasChildren && (
                <div className="ml-12 py-1 text-xs text-gray-400 italic">(Vacío - Arrastra elementos aquí)</div>
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
    onMoveSubjectToFolder,
    onNestFolder,
    onReorderSubject,
    onDropWithOverlay // <-- Add this prop for overlay logic
}) => {
    
    if (!isOpen || !rootFolder) return null;

    const [isRootDropZoneActive, setIsRootDropZoneActive] = useState(false);

    const handleDropAction = (dragged, target) => {
        // 1. Drop on Folder -> Nesting
        if (target.type === 'folder') {
            if (dragged.id === target.id) return;
            if (dragged.parentId === target.id) return; // Already inside

            if (dragged.type === 'subject') {
                let overlayShown = false;
                if (onDropWithOverlay) {
                    const result = onDropWithOverlay(target.id, dragged.id, dragged.parentId);
                    if (result === true) overlayShown = true;
                }
                if (!overlayShown && onMoveSubjectToFolder) {
                    onMoveSubjectToFolder(dragged.id, target.id, dragged.parentId);
                }
            } else if (dragged.type === 'folder') {
                if (onNestFolder) onNestFolder(target.id, dragged.id); 
            }
        }
        
        // 2. Drop on Subject -> Reorder or Move to Sibling
        else if (target.type === 'subject' && dragged.type === 'subject') {
            // Determine the folder that contains the target subject
            const targetParentId = target.parentId || rootFolder.id; 
            if (dragged.parentId !== targetParentId) {
                let overlayShown = false;
                if (onDropWithOverlay) {
                    const result = onDropWithOverlay(targetParentId, dragged.id, dragged.parentId);
                    if (result === true) overlayShown = true;
                }
                if (!overlayShown && onMoveSubjectToFolder) {
                    onMoveSubjectToFolder(dragged.id, targetParentId, dragged.parentId);
                }
            } else {
                // Same folder: Reorder
                if (onReorderSubject) {
                    onReorderSubject(targetParentId, dragged.id, target.index);
                }
            }
        }
    };

    // --- ROOT ZONE DROP HANDLER ---
    const handleRootDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsRootDropZoneActive(false);

        let draggedData;
        const treeDataString = e.dataTransfer.getData('treeItem');
        
        if (treeDataString) {
            draggedData = JSON.parse(treeDataString);
        } else {
            const subjectId = e.dataTransfer.getData('subjectId');
            const folderId = e.dataTransfer.getData('folderId');
            if (subjectId) draggedData = { id: subjectId, type: 'subject' };
            else if (folderId) draggedData = { id: folderId, type: 'folder' };
        }

        if (!draggedData) return;

        // Move to rootFolder.id (The folder currently open in the modal)
        if (draggedData.parentId === rootFolder.id) return; // Already at root

        if (draggedData.type === 'subject') {
            let overlayShown = false;
            if (onDropWithOverlay) {
                const result = onDropWithOverlay(rootFolder.id, draggedData.id, draggedData.parentId);
                if (result === true) overlayShown = true;
            }
            if (!overlayShown && onMoveSubjectToFolder) {
                onMoveSubjectToFolder(draggedData.id, rootFolder.id, draggedData.parentId);
            }
        } else if (draggedData.type === 'folder') {
            if (draggedData.id === rootFolder.id) return;
            if (onNestFolder) onNestFolder(rootFolder.id, draggedData.id);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col border border-gray-100 dark:border-slate-700 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            >
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${getGradient(rootFolder.color)} shadow-sm`}>
                            {rootFolder.icon ? <SubjectIcon iconName={rootFolder.icon} className="w-5 h-5 text-white" /> : <Folder className="text-white w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white text-lg">{rootFolder.name}</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Estructura del contenido</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto min-h-[300px] custom-scrollbar bg-slate-50/50 dark:bg-slate-950/30 p-4 flex flex-col">
                    
                    {/* MOVE TO ROOT ZONE */}
                    <div 
                        onDragOver={(e) => { e.preventDefault(); setIsRootDropZoneActive(true); }}
                        onDragLeave={() => setIsRootDropZoneActive(false)}
                        onDrop={handleRootDrop}
                        className={`mb-4 rounded-xl border-2 border-dashed transition-all duration-200 flex items-center justify-center gap-2 py-3 text-sm font-medium ${
                            isRootDropZoneActive 
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 scale-[1.02]' 
                                : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-indigo-300 hover:text-indigo-500'
                        }`}
                    >
                        <ArrowUpCircle size={18} />
                        Mover al inicio de {rootFolder.name}
                    </div>

                    {/* Tree Items */}
                    {(() => {
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
                        
                        return (
                            <div className="space-y-1">
                                {childFolders.map((folder, idx) => (
                                    <TreeItem key={folder.id} item={folder} type="folder" index={idx} parentId={rootFolder.id} allFolders={allFolders} allSubjects={allSubjects} onNavigateFolder={onNavigateFolder} onNavigateSubject={onNavigateSubject} onDropItem={handleDropAction} />
                                ))}
                                {childSubjects.map((subject, idx) => (
                                    <TreeItem key={subject.id} item={subject} type="subject" index={idx} parentId={rootFolder.id} allFolders={allFolders} allSubjects={allSubjects} onNavigateFolder={onNavigateFolder} onNavigateSubject={onNavigateSubject} onDropItem={handleDropAction} />
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