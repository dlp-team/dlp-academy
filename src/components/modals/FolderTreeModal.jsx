// src/components/modals/FolderTreeModal.jsx
import React, { useState } from 'react';
import { X, Folder, ChevronRight, FileText, CornerDownRight, GripVertical, ArrowUpCircle, Users } from 'lucide-react';
import SubjectIcon, { getIconColor } from '../ui/SubjectIcon';
import { isDescendant } from '../../utils/folderUtils';

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
    onDropItem,
    path = []
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    if (path.includes(item.id)) {
        console.error("Cycle detected in folder structure! Stopping render for:", item.name);
        return null; // Stop rendering this branch immediately
    }
    const currentPath = [...path, item.id];

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

                {/* Icon logic for subject/folder: match ProfileSubjects */}
                {type === 'folder' ? (
                    <div className={`relative shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-gradient-to-br ${getGradient(item.color)}`}>
                        {item.icon ? <SubjectIcon iconName={item.icon} className="w-5 h-5 text-white" /> : <Folder size={20} className="text-white" />}
                        {/* Shared icon inside folder icon, like FolderListItem, only for folders */}
                        {(item.isShared === true || (Array.isArray(item.sharedWith) && item.sharedWith.length > 0) || (Array.isArray(item.sharedWithUids) && item.sharedWithUids.length > 0)) && (
                            <div
                                className="absolute inset-0 flex items-center justify-center z-10"
                                style={{ pointerEvents: 'none' }}
                            >
                                <div className="flex items-center justify-center rounded-full opacity-80 bg-none"
                                    style={{
                                        width: '14px',
                                        height: '14px',
                                        transform: 'translateY(2px)'
                                    }}
                                >
                                    <Users
                                        className="text-white"
                                        style={{ width: '9px', height: '9px' }}
                                        strokeWidth={2.5}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Subject: modern or classic style
                    item.cardStyle === 'modern' ? (
                        <div className={`shrink-0 w-8 h-8 flex items-center justify-center ${getIconColor(item.color)}`}>
                            <SubjectIcon iconName={item.icon} className="w-7 h-7" />
                        </div>
                    ) : (
                        <div className={`relative shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-gradient-to-br ${item.color || 'from-gray-400 to-gray-500'}`}>
                            <SubjectIcon iconName={item.icon} className="w-5 h-5 text-white" />
                        </div>
                    )
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center min-w-0 gap-1">
                        <p className={`text-sm truncate ${type === 'folder' ? 'font-semibold' : 'font-medium'}`}>{item.name}</p>
                        {/* Shared icon for subjects, right of title */}
                        {type === 'subject' && (item.isShared === true || (Array.isArray(item.sharedWith) && item.sharedWith.length > 0) || (Array.isArray(item.sharedWithUids) && item.sharedWithUids.length > 0)) && (
                            <div 
                                className="flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 ml-1"
                                style={{ width: '18px', height: '18px', minWidth: '18px' }}
                                title="Asignatura compartida"
                            >
                                <Users 
                                    className="text-indigo-600 dark:text-indigo-400"
                                    style={{ width: '11px', height: '11px' }}
                                />
                            </div>
                        )}
                    </div>
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
                    {/* CRASH FIX: PASS THE PATH PROP DOWN */}
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
                            path={currentPath} 
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
                            path={currentPath}
                        />
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
        if (!dragged || !target) return;

        // 1. Logic for moving SUBJECTS (No changes needed here)
        if (dragged.type === 'subject') {
             // ... existing subject logic ...
             if (target.type === 'folder') {
                 if (onMoveSubjectToFolder) onMoveSubjectToFolder(dragged.id, target.id);
             } else if (target.type === 'subject') {
                 if (onReorderSubject) onReorderSubject(dragged.id, target.id);
             }
        } 
        // 2. Logic for moving FOLDERS
        else if (dragged.type === 'folder' && target.type === 'folder') {
            
            // --- 🛡️ ADD THIS PROTECTION BLOCK ---
            if (isDescendant(dragged.id, target.id, allFolders)) {
                console.warn("🚫 BLOCKED: Cannot move a folder into its own subfolder.");
                return; // STOP HERE
            }
            // ------------------------------------

            if (onNestFolder) onNestFolder(target.id, dragged.id);
        }
    };

    // --- ROOT ZONE DROP HANDLER ---
    const handleRootDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsRootDropZoneActive(false);

        // ... (Keep data parsing logic) ...
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

        if (draggedData.parentId === rootFolder.id) return; 

        if (draggedData.type === 'subject') {
             // ... (Keep existing subject logic) ...
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

            // --- FIX STARTS HERE ---
            if (isDescendant(draggedData.id, rootFolder.id, allFolders)) {
                return; // Block cycle
            }
            // --- FIX ENDS HERE ---

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
                        <div className={`relative p-2 rounded-lg bg-gradient-to-br ${getGradient(rootFolder.color)} shadow-sm`}>
                            {rootFolder.icon ? <SubjectIcon iconName={rootFolder.icon} className="w-5 h-5 text-white" /> : <Folder className="text-white w-5 h-5" />}
                            {/* Shared icon inside folder icon, like in tree, only for folders */}
                            {(rootFolder.isShared === true || (Array.isArray(rootFolder.sharedWith) && rootFolder.sharedWith.length > 0) || (Array.isArray(rootFolder.sharedWithUids) && rootFolder.sharedWithUids.length > 0)) && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center z-10"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    <div className="flex items-center justify-center rounded-full opacity-80 bg-none"
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            transform: 'translateY(2px)'
                                        }}
                                    >
                                        <Users
                                            className="text-white"
                                            style={{ width: '9px', height: '9px' }}
                                            strokeWidth={2.5}
                                        />
                                    </div>
                                </div>
                            )}
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
                                        path={[rootFolder.id]}
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