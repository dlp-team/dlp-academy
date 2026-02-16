// src/components/home/FolderListItem.jsx
import React, { useState, useMemo } from 'react';
import { ChevronRight, Folder, GripVertical, Users } from 'lucide-react';
import SubjectIcon from '../modals/SubjectIcon';
import ListViewItem from './ListViewItem';
import { useGhostDrag } from '../../hooks/useGhostDrag';

const FolderListItem = ({ 
    item, 
    parentId,
    depth = 0,
    allFolders, 
    allSubjects, 
    onNavigate, 
    onNavigateSubject,
    onEdit,
    onDelete,
    cardScale = 100, 
    onDragStart,
    onDragEnd,
    onDropAction
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const scale = cardScale / 100;
    const type = 'folder';

    // --- CHILDREN CALCULATION ---
    // --- 1. RECURSIVE COUNTING LOGIC (Same as FolderCard) ---
    const { subjectCount, folderCount, totalCount } = useMemo(() => {
        // Fallback: If no folders list, use shallow count
        if (!allFolders || allFolders.length === 0) {
            const s = item.subjectIds?.length || 0;
            const f = item.folderIds?.length || 0;
            return { subjectCount: s, folderCount: f, totalCount: s + f };
        }

        const folderMap = new Map(allFolders.map(f => [f.id, f]));
        const visited = new Set();

        const traverse = (currentId) => {
            if (visited.has(currentId)) return { s: 0, f: 0 };
            visited.add(currentId);

            const currentFolder = folderMap.get(currentId);
            if (!currentFolder) return { s: 0, f: 0 };

            let s = currentFolder.subjectIds?.length || 0;
            const subFolderIds = currentFolder.folderIds || [];
            let f = subFolderIds.length; 

            subFolderIds.forEach(childId => {
                const childStats = traverse(childId);
                s += childStats.s;
                f += childStats.f;
            });

            return { s, f };
        };

        const stats = traverse(item.id);
        
        return {
            subjectCount: stats.s,
            folderCount: stats.f,
            totalCount: stats.s + stats.f
        };
    }, [item, allFolders]);

    // --- 2. CHILDREN CALCULATION FOR RENDERING ---
    let childFolders = [];
    let childSubjects = [];

    const folderIds = Array.isArray(item.folderIds) ? item.folderIds : [];
    const subjectIds = Array.isArray(item.subjectIds) ? item.subjectIds : [];

    const safeAllFolders = Array.isArray(allFolders) ? allFolders : [];
    const safeAllSubjects = Array.isArray(allSubjects) ? allSubjects : [];

    if (folderIds.length > 0) {
        childFolders = safeAllFolders.filter(f => folderIds.includes(f.id));
        // Keep sort order
        childFolders.sort((a, b) => folderIds.indexOf(a.id) - folderIds.indexOf(b.id));
    }
    if (subjectIds.length > 0) {
        childSubjects = safeAllSubjects.filter(s => subjectIds.includes(s.id));
        childSubjects.sort((a, b) => subjectIds.indexOf(a.id) - subjectIds.indexOf(b.id));
    }
    
    const hasChildren = childFolders.length > 0 || childSubjects.length > 0;

    // --- DRAG HANDLERS ---
    const handleLocalDragStart = (e) => {
        e.stopPropagation();
        const dragData = {
            id: item.id,
            type: type,
            parentId: parentId 
        };
        e.dataTransfer.setData('folderId', item.id);
        e.dataTransfer.setData('treeItem', JSON.stringify(dragData));
        
        if (onDragStart) onDragStart(item); 
    };

    // Initialize custom ghost drag hook
    const { 
        isDragging, 
        itemRef, 
        dragHandlers 
    } = useGhostDrag({ 
        item, 
        type: 'folder', 
        cardScale, 
        onDragStart: handleLocalDragStart,
        onDragEnd 
    });

    const handleDragOver = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault(); e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setIsDragOver(false);

        const treeDataString = e.dataTransfer.getData('treeItem');
        let draggedData;

        if (treeDataString) {
            draggedData = JSON.parse(treeDataString);
        } else {
            const sId = e.dataTransfer.getData('subjectId');
            const fId = e.dataTransfer.getData('folderId');
            if (sId) draggedData = { id: sId, type: 'subject' };
            else if (fId) draggedData = { id: fId, type: 'folder' };
        }

        if (!draggedData || draggedData.id === item.id) return;

        onDropAction(draggedData, { id: item.id, type: type, parentId: parentId });
        
        if (!isExpanded) setIsExpanded(true);
    };

    const handleClickFolder = (e) => { e.stopPropagation(); setIsExpanded(!isExpanded); };

    // --- STYLES & INDENTATION ---
    const indent = depth * (100 * scale); // 32px per level, scaled
    const iconBoxSize = 48 * scale;
    const iconSize = 28 * scale;
    const paddingY = 16 * scale;
    const paddingX = 16 * scale;

    return (
        <div className="select-none animate-in fade-in duration-200">
            {/* ROW CONTAINER */}
            <div 
                ref={itemRef}
                draggable
                onDragStart={dragHandlers.onDragStart}
                onDrag={dragHandlers.onDrag}
                onDragEnd={dragHandlers.onDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative group rounded-xl transition-all duration-200 border border-transparent z-40 ${
                    isDragOver 
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-500 scale-[1.01] shadow-md'
                        : ''
                } ${isDragging ? 'opacity-0 scale-95 transition-none' : ''}`}
                style={{ marginLeft: `${indent}px` }}
            >
                <div 
                    onClick={handleClickFolder}
                    className={`flex items-center gap-4 rounded-xl cursor-pointer transition-colors ${
                        isDragOver ? '' : 'bg-white dark:bg-slate-900 shadow-sm hover:shadow-md border border-gray-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'
                    }`}
                    style={{ padding: `${paddingY}px ${paddingX}px` }}
                >
                    <div className="flex items-center gap-1 -ml-1">
                        <div className={`text-gray-300 cursor-grab active:cursor-grabbing ${isHovered ? 'opacity-100' : 'opacity-0'}`} style={{ transform: `scale(${scale})` }}>
                            <GripVertical size={16} />
                        </div>
                        <div className={`text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} style={{ transformOrigin: 'center', transform: `scale(${scale}) ${isExpanded ? 'rotate(0deg)' : 'rotate(0deg)'}` }}>
                            <ChevronRight size={20} />
                        </div>
                    </div>
                    <div className={`relative flex items-center justify-center rounded-lg bg-gradient-to-br ${item.color || 'from-indigo-500 to-purple-500'}`} style={{ width: `${iconBoxSize}px`, height: `${iconBoxSize}px`, flexShrink: 0 }}>
                        {/* Main folder or subject icon */}
                        {item.icon ? (
                            <SubjectIcon iconName={item.icon} className="text-white" style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
                        ) : (
                            <Folder className="text-white" style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
                        )}
                        {/* Shared icon inside folder icon, like FolderCardBody, but smaller */}
                        {(item.isShared === true || (Array.isArray(item.sharedWith) && item.sharedWith.length > 0) || (Array.isArray(item.sharedWithUids) && item.sharedWithUids.length > 0)) && (
                            <div
                                className="absolute inset-0 flex items-center justify-center z-10 bottom--"
                                style={{ pointerEvents: 'none' }}
                            >
                                <div className="flex items-center justify-center rounded-full opacity-80 bg-none"
                                    style={{
                                        width: `${iconSize * 0.45}px`,
                                        height: `${iconSize * 0.45}px`,
                                        transform: 'translateY(2px)'
                                    }}
                                >
                                    <Users
                                        className="text-white"
                                        style={{ width: `${iconSize * 0.4}px`, height: `${iconSize * 0.4}px` }}
                                        strokeWidth={2.5}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 truncate" style={{ fontSize: `${18 * scale}px` }}>
                                {item.name}
                            </h4>
                            {/* Shared icon for subjects, right of title */}
                            {type === 'subject' && (
                                (item.isShared === true || (Array.isArray(item.sharedWith) && item.sharedWith.length > 0) || (Array.isArray(item.sharedWithUids) && item.sharedWithUids.length > 0)) && (
                                    <div 
                                        className={`flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 ml-2`}
                                        style={{ 
                                            width: `${24 * scale}px`, 
                                            height: `${24 * scale}px`,
                                            minWidth: `${24 * scale}px` 
                                        }}
                                        title="Asignatura compartida"
                                    >
                                        <Users 
                                            className="text-indigo-600 dark:text-indigo-400"
                                            style={{ width: `${14 * scale}px`, height: `${14 * scale}px` }}
                                        />
                                    </div>
                                )
                            )}
                            
                        </div>
                        <div className="flex items-center flex-wrap gap-x-2 text-gray-500 mt-0.5" style={{ fontSize: `${16 * scale}px` }}>
                            {/* Total Count */}
                            <span className="font-medium text-gray-600 dark:text-gray-400">
                                {totalCount} elementos
                            </span>
                            
                            <span className="text-gray-300">•</span>
                            
                            {/* Detail Counts */}
                            <span className="text-gray-400 dark:text-gray-500">
                                {subjectCount} asignaturas
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">
                                {folderCount} carpetas
                            </span>
                        </div>
                        
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onNavigate(item); }} className="text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" style={{ padding: `${8 * scale}px` }}>
                        <Folder style={{ width: `${20 * scale}px`, height: `${20 * scale}px` }} />
                    </button>
                </div>
            </div>

            {/* CHILDREN (Recursive) */}
            <div 
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="overflow-hidden">
                    <div className="mt-2 flex flex-col gap-2">
                        {hasChildren ? (
                            <>
                                {childFolders.map((folder) => (
                                    <ListViewItem
                                        key={folder.id}
                                        item={folder}
                                        type="folder"
                                        parentId={item.id} 
                                        depth={depth + 1}
                                        allFolders={allFolders}
                                        allSubjects={allSubjects}
                                        onNavigate={onNavigate}
                                        onNavigateSubject={onNavigateSubject}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        cardScale={cardScale}
                                        onDragStart={onDragStart}
                                        onDragEnd={onDragEnd}
                                        onDropAction={onDropAction}
                                    />
                                ))}
                                {childSubjects.map((subject) => (
                                    <ListViewItem
                                        key={subject.id}
                                        item={subject}
                                        type="subject"
                                        parentId={item.id} 
                                        depth={depth + 1}
                                        allFolders={allFolders}
                                        allSubjects={allSubjects}
                                        onNavigate={onNavigate}
                                        onNavigateSubject={onNavigateSubject}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        cardScale={cardScale}
                                        onDragStart={onDragStart}
                                        onDragEnd={onDragEnd}
                                        onDropAction={onDropAction}
                                    />
                                ))}
                            </>
                        ) : (
                            <div 
                                className="text-gray-400 italic py-3 pl-4 border-l-2 border-dashed border-gray-300 dark:border-slate-700" 
                                style={{ 
                                    marginLeft: `${indent + (32 * scale)}px`, 
                                    fontSize: `${12 * scale}px` 
                                }}
                            >
                                Carpeta vacía
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FolderListItem;