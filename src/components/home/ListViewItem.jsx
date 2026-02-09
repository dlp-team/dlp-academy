// src/components/home/ListViewItem.jsx
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, GripVertical } from 'lucide-react';
import SubjectIcon from '../modals/SubjectIcon';
import SubjectListItem from './SubjectListItem';

const ListViewItem = ({ 
    item, 
    type, 
    depth = 0, 
    allFolders, 
    allSubjects, 
    onNavigate, 
    onNavigateSubject,
    onEdit,
    onDelete,
    cardScale = 100, 
    onDragStart,
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
        
        // FIX: Subjects use 'folderId', Folders use 'parentId'. 
        // We must capture the correct field to remove it from the old parent in Firestore.
        const sourceParentId = item.parentId || item.folderId || null;

        const dragData = {
            id: item.id,
            type: type,
            parentId: sourceParentId 
        };
        
        if (type === 'subject') e.dataTransfer.setData('subjectId', item.id);
        else e.dataTransfer.setData('folderId', item.id);
        
        e.dataTransfer.setData('treeItem', JSON.stringify(dragData));
        
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
        let draggedData;

        if (treeDataString) {
            draggedData = JSON.parse(treeDataString);
        } else {
            const sId = e.dataTransfer.getData('subjectId');
            const fId = e.dataTransfer.getData('folderId');
            if (sId) draggedData = { id: sId, type: 'subject' };
            else if (fId) draggedData = { id: fId, type: 'folder' };
        }

        if (!draggedData) return;
        if (draggedData.id === item.id) return;

        // Pass explicit SOURCE info so Firestore knows where to remove it from
        const myParentId = item.parentId || item.folderId || null;
        onDropAction(draggedData, { id: item.id, type: type, parentId: myParentId });
        
        if (type === 'folder' && !isExpanded) setIsExpanded(true);
    };

    // --- CLICK HANDLERS ---
    const handleToggle = (e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const handleClickFolder = (e) => {
        e.stopPropagation();
        handleToggle(e); 
    };

    // --- STYLES & SCALING ---
    // UPDATED: Increased indentation from 42 to 64 for better hierarchy visibility
    const indent = depth * (64 * scale); 

    const fontSizeTitle = 16 * scale;
    const fontSizeMeta = 12 * scale;
    const iconBoxSize = 32 * scale;
    const paddingY = 12 * scale;
    const paddingX = 12 * scale;

    return (
        <div className="select-none animate-in fade-in duration-200">
            {/* --- ROW CONTENT --- */}
            <div 
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative group rounded-xl transition-all duration-200 border border-transparent ${
                    isDragOver 
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-500 z-10 scale-[1.01] shadow-md'
                        : ''
                }`}
                style={{ marginLeft: `${indent}px` }}
            >
                {/* Visual Guide Line (Tree) */}
                {depth > 0 && (
                    <div className="absolute left-[-32px] top-0 bottom-0 w-px bg-gray-200 dark:bg-slate-700 -z-10" />
                )}
                {depth > 0 && (
                    <div className="absolute left-[-32px] top-1/2 w-8 h-px bg-gray-200 dark:bg-slate-700 -z-10" />
                )}

                {/* --- RENDER BASED ON TYPE --- */}
                {type === 'folder' ? (
                    // FOLDER ROW
                    <div 
                        onClick={handleClickFolder}
                        className={`flex items-center gap-3 rounded-xl cursor-pointer transition-colors ${
                            isDragOver ? '' : 'bg-white dark:bg-slate-900 shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'
                        }`}
                        style={{ padding: `${paddingY}px ${paddingX}px` }}
                    >
                        {/* Drag Handle */}
                        <div 
                            className={`text-gray-300 cursor-grab active:cursor-grabbing ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                            style={{ transform: `scale(${scale})` }}
                        >
                            <GripVertical size={16} />
                        </div>

                        {/* Chevron */}
                        <div 
                            className="text-gray-400 dark:text-gray-500 transition-transform duration-200"
                            style={{ transform: `scale(${scale})` }}
                        >
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </div>

                        {/* Folder Icon */}
                        <div 
                            className={`flex items-center justify-center rounded-lg bg-gradient-to-br ${item.color || 'from-indigo-500 to-purple-500'}`}
                            style={{ width: `${iconBoxSize}px`, height: `${iconBoxSize}px` }}
                        >
                            {item.icon ? (
                                <SubjectIcon iconName={item.icon} className="text-white" style={{ width: `${20 * scale}px`, height: `${20 * scale}px` }} />
                            ) : (
                                <Folder className="text-white" style={{ width: `${20 * scale}px`, height: `${20 * scale}px` }} />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h4 
                                className="font-semibold text-gray-800 dark:text-gray-200"
                                style={{ fontSize: `${fontSizeTitle}px` }}
                            >
                                {item.name}
                            </h4>
                            <div 
                                className="flex items-center gap-2 text-gray-500"
                                style={{ fontSize: `${fontSizeMeta}px` }}
                            >
                                <span>{(childFolders.length + childSubjects.length)} elementos</span>
                                {item.tags && item.tags.length > 0 && (
                                    <div className="flex gap-1">
                                        {item.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="bg-gray-100 dark:bg-slate-800 px-1.5 rounded">#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Hint */}
                        <button 
                             onClick={(e) => { e.stopPropagation(); onNavigate(item); }}
                             className="text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                             style={{ padding: `${8 * scale}px` }}
                             title="Abrir carpeta completa"
                        >
                            <Folder style={{ width: `${16 * scale}px`, height: `${16 * scale}px` }} />
                        </button>
                    </div>
                ) : (
                    // SUBJECT ROW
                    <div className="flex items-center gap-2">
                        {/* Drag Handle Wrapper */}
                        <div 
                            className={`absolute left-2 z-20 text-gray-300 cursor-grab active:cursor-grabbing ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                            style={{ transform: `scale(${scale})` }}
                        >
                            <GripVertical size={16} />
                        </div>
                        
                        <div className="flex-1">
                            <SubjectListItem 
                                subject={item}
                                onSelect={() => onNavigateSubject(item.id)}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                cardScale={cardScale} 
                                className="pl-8" 
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* --- RECURSIVE CHILDREN --- */}
            {isExpanded && type === 'folder' && (
                <div className="mt-2 flex flex-col gap-2">
                    {hasChildren ? (
                        <>
                            {childFolders.map(folder => (
                                <ListViewItem
                                    key={folder.id}
                                    item={folder}
                                    type="folder"
                                    depth={depth + 1}
                                    allFolders={allFolders}
                                    allSubjects={allSubjects}
                                    onNavigate={onNavigate}
                                    onNavigateSubject={onNavigateSubject}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    cardScale={cardScale}
                                    onDragStart={onDragStart}
                                    onDropAction={onDropAction}
                                />
                            ))}
                            {childSubjects.map(subject => (
                                <ListViewItem
                                    key={subject.id}
                                    item={subject}
                                    type="subject"
                                    depth={depth + 1}
                                    allFolders={allFolders}
                                    allSubjects={allSubjects}
                                    onNavigate={onNavigate}
                                    onNavigateSubject={onNavigateSubject}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    cardScale={cardScale}
                                    onDragStart={onDragStart}
                                    onDropAction={onDropAction}
                                />
                            ))}
                        </>
                    ) : (
                        <div 
                            className="text-gray-400 italic py-2 pl-4 border-l border-dashed border-gray-300 dark:border-slate-700"
                            style={{ 
                                marginLeft: `${indent + (32 * scale)}px`, // Adjusted for bigger indent
                                fontSize: `${12 * scale}px`
                            }}
                        >
                            Carpeta vacía
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ListViewItem;