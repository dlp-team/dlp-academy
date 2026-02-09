// src/components/home/ListViewItem.jsx
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, GripVertical } from 'lucide-react';
import SubjectIcon from '../modals/SubjectIcon';
import SubjectListItem from './SubjectListItem';

const ListViewItem = ({ 
    item, 
    type, 
    currentParentId, // <--- CRITICAL: The ID of the folder this item is currently inside
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

    // --- PREPARE CHILDREN ---
    let childFolders = [];
    let childSubjects = [];

    if (type === 'folder') {
        if (item.folderIds && item.folderIds.length > 0) {
            childFolders = allFolders.filter(f => item.folderIds.includes(f.id));
            // Maintain order
            childFolders.sort((a, b) => item.folderIds.indexOf(a.id) - item.folderIds.indexOf(b.id));
        }
        if (item.subjectIds && item.subjectIds.length > 0) {
            childSubjects = allSubjects.filter(s => item.subjectIds.includes(s.id));
            childSubjects.sort((a, b) => item.subjectIds.indexOf(a.id) - item.subjectIds.indexOf(b.id));
        }
    }
    
    const hasChildren = childFolders.length > 0 || childSubjects.length > 0;
    const totalChildren = childFolders.length + childSubjects.length;

    // --- DRAG HANDLERS ---
    const handleDragStart = (e) => {
        e.stopPropagation();
        
        // We use the passed prop 'currentParentId' as the source. 
        // This mirrors FolderTreeModal logic exactly.
        const dragData = {
            id: item.id,
            type: type,
            parentId: currentParentId // THIS IS THE SOURCE FOLDER ID
        };
        
        // Set data for both internal app logic and generic drag
        if (type === 'subject') e.dataTransfer.setData('subjectId', item.id);
        else e.dataTransfer.setData('folderId', item.id);
        
        e.dataTransfer.setData('treeItem', JSON.stringify(dragData));
        
        // Trigger UI state
        if (onDragStart) onDragStart(item); 
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
        let draggedData;

        if (treeDataString) {
            draggedData = JSON.parse(treeDataString);
        } else {
            // Fallback for external drops (unlikely in this specific flow but good for safety)
            const sId = e.dataTransfer.getData('subjectId');
            const fId = e.dataTransfer.getData('folderId');
            if (sId) draggedData = { id: sId, type: 'subject' };
            else if (fId) draggedData = { id: fId, type: 'folder' };
        }

        if (!draggedData) return;
        if (draggedData.id === item.id) return; // Dropped on self

        // ACTION: Target is THIS item. Source comes from draggedData.
        onDropAction(draggedData, { id: item.id, type: type, parentId: currentParentId });
        
        if (type === 'folder' && !isExpanded) setIsExpanded(true);
    };

    const handleClickFolder = (e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    // --- STYLES ---
    const indent = depth * (48 * scale); // Adjusted indentation
    const iconBoxSize = 48 * scale;
    const iconSize = 28 * scale;
    const paddingY = 16 * scale;
    const paddingX = 16 * scale;

    return (
        <div className="select-none animate-in fade-in duration-200">
            {/* ITEM ROW */}
            <div 
                draggable
                onDragStart={handleDragStart}
                onDragEnd={onDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative group rounded-xl transition-all duration-200 border border-transparent z-10 ${
                    isDragOver 
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-500 scale-[1.01] shadow-md'
                        : ''
                }`}
                style={{ marginLeft: `${indent}px` }}
            >
                {type === 'folder' ? (
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
                            <div className="text-gray-400 dark:text-gray-500 transition-transform duration-200" style={{ transform: `scale(${scale})` }}>
                                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>
                        </div>
                        <div className={`flex items-center justify-center rounded-lg bg-gradient-to-br ${item.color || 'from-indigo-500 to-purple-500'}`} style={{ width: `${iconBoxSize}px`, height: `${iconBoxSize}px`, flexShrink: 0 }}>
                            {item.icon ? <SubjectIcon iconName={item.icon} className="text-white" style={{ width: `${iconSize}px`, height: `${iconSize}px` }} /> : <Folder className="text-white" style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 truncate" style={{ fontSize: `${18 * scale}px` }}>{item.name}</h4>
                            <div className="flex items-center gap-2 text-gray-500 mt-0.5" style={{ fontSize: `${12 * scale}px` }}><span>{totalChildren} elementos</span></div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onNavigate(item); }} className="text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" style={{ padding: `${8 * scale}px` }}>
                            <Folder style={{ width: `${20 * scale}px`, height: `${20 * scale}px` }} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className={`absolute left-2 z-20 text-gray-300 cursor-grab active:cursor-grabbing ${isHovered ? 'opacity-100' : 'opacity-0'}`} style={{ transform: `scale(${scale})` }}>
                            <GripVertical size={16} />
                        </div>
                        <div className="flex-1">
                            <SubjectListItem subject={item} onSelect={() => onNavigateSubject(item.id)} onEdit={onEdit} onDelete={onDelete} cardScale={cardScale} className="pl-8" />
                        </div>
                    </div>
                )}
            </div>

            {/* CHILDREN (RECURSION) */}
            {isExpanded && type === 'folder' && (
                <div className="mt-3 flex flex-col gap-2">
                    {hasChildren ? (
                        <>
                            {childFolders.map((folder) => (
                                <ListViewItem
                                    key={folder.id}
                                    item={folder}
                                    type="folder"
                                    currentParentId={item.id} // <--- PASS THIS FOLDER'S ID AS PARENT
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
                                    currentParentId={item.id} // <--- PASS THIS FOLDER'S ID AS PARENT
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
                        <div className="text-gray-400 italic py-3 pl-4 border-l-2 border-dashed border-gray-300 dark:border-slate-700" style={{ marginLeft: `${indent + (32 * scale)}px`, fontSize: `${12 * scale}px` }}>
                            Carpeta vacía
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ListViewItem;