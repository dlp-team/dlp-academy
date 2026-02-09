// src/components/home/HomeContent.jsx
import React, { useState } from 'react';
import { 
    Plus, ChevronDown, Folder as FolderIcon, Tag, ArrowUp, ArrowUpCircle
} from 'lucide-react';
import SubjectIcon from '../modals/SubjectIcon';
import SubjectCard from '../home/SubjectCard';
import FolderCard from '../home/FolderCard'; 
import SubjectListItem from '../home/SubjectListItem';
import ListViewItem from '../home/ListViewItem'; 

const HomeContent = ({
    viewMode = 'grid',
    layoutMode = 'grid',
    cardScale = 100,
    groupedContent = {}, 
    collapsedGroups = {},
    toggleGroup,
    currentFolder = null,
    orderedFolders = [],
    flippedSubjectId,
    setFlippedSubjectId,
    activeMenu,
    setActiveMenu,
    
    setSubjectModalConfig,
    setFolderModalConfig,
    setDeleteConfig,
    
    handleSelectSubject,
    handleOpenFolder,
    handleDropOnFolder, 
    handleNestFolder, // <--- Using this for Folder moves (Same as TreeModal)
    handlePromoteSubject,
    handlePromoteFolder,
    handleShowFolderContents,
    handleMoveSubjectWithSource, // <--- Using this for Subject moves (Same as TreeModal)
    
    isDragAndDropEnabled,
    draggedItem,
    draggedItemType,
    handleDragStartSubject,
    handleDragStartFolder,
    handleDragEnd,
    handleDragOverSubject,
    handleDragOverFolder,
    handleDropReorderSubject,
    handleDropReorderFolder,
    
    subjects = [], 
    folders = [],  
    
    navigate
}) => {
    const [isPromoteZoneHovered, setIsPromoteZoneHovered] = useState(false);
    const [isRootZoneHovered, setIsRootZoneHovered] = useState(false);

    const showCollapsibleGroups = ['courses', 'tags', 'shared'].includes(viewMode);

    // --- GRID VIEW HANDLERS ---
    const handlePromoteZoneDragOver = (e) => {
        if (currentFolder && (draggedItemType === 'subject' || draggedItemType === 'folder')) {
            e.preventDefault(); e.stopPropagation(); setIsPromoteZoneHovered(true);
        }
    };
    const handlePromoteZoneDragLeave = (e) => { e.preventDefault(); setIsPromoteZoneHovered(false); };
    const handlePromoteZoneDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setIsPromoteZoneHovered(false);
        if (!currentFolder || !draggedItem) return;
        if (draggedItemType === 'subject') handlePromoteSubject(draggedItem.id);
        else if (draggedItemType === 'folder') handlePromoteFolder(draggedItem.id);
    };

    // --- LIST VIEW: "MOVE TO CURRENT LAYER" ZONE ---
    // Mirrors the "Root" behavior in TreeModal
    const handleRootZoneDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setIsRootZoneHovered(false);

        const treeDataString = e.dataTransfer.getData('treeItem');
        if (!treeDataString) return;
        const draggedData = JSON.parse(treeDataString);

        // TARGET: The folder currently being viewed (or null if root)
        const targetId = currentFolder ? currentFolder.id : null;

        // Prevent dropping if we are already in this folder
        if (draggedData.parentId === targetId) return;

        if (draggedData.type === 'subject') {
            // Use existing handler passed from Home.jsx
            handleMoveSubjectWithSource(draggedData.id, targetId, draggedData.parentId);
        } else if (draggedData.type === 'folder') {
            // Use existing handler passed from Home.jsx (mapped to moveFolderToParent)
            handleNestFolder(targetId, draggedData.id); 
        }
        
        if (handleDragEnd) handleDragEnd();
    };

    // --- LIST VIEW: ITEM ON ITEM DROP ---
    // Mirrors FolderTreeModal logic exactly
    const handleListDropAction = (dragged, target) => {
        // dragged: { id, type, parentId }
        // target: { id, type, parentId }

        // 1. Drop ON a Folder (Nest)
        if (target.type === 'folder') {
            if (dragged.id === target.id) return;
            if (dragged.parentId === target.id) return; // Already inside

            if (dragged.type === 'subject') {
                // Move Subject INTO Target Folder
                handleMoveSubjectWithSource(dragged.id, target.id, dragged.parentId);
            } else if (dragged.type === 'folder') {
                // Move Folder INTO Target Folder
                handleNestFolder(target.id, dragged.id);
            }
        }
        // 2. Drop ON a Subject (Sibling Move)
        else if (target.type === 'subject') {
            const targetParentId = target.parentId;
            
            if (dragged.parentId !== targetParentId) {
                // Moving from Folder A to Folder B (Target's Folder)
                if (dragged.type === 'subject') {
                    handleMoveSubjectWithSource(dragged.id, targetParentId, dragged.parentId);
                } else if (dragged.type === 'folder') {
                    handleNestFolder(targetParentId, dragged.id);
                }
            }
        }
        
        if (handleDragEnd) handleDragEnd();
    };

    return (
        <>
            {groupedContent && Object.entries(groupedContent).map(([groupName, groupSubjects]) => {
                const isCollapsed = collapsedGroups[groupName];

                return (
                    <div key={groupName} className="mb-10">
                        {showCollapsibleGroups && (
                            <button onClick={() => toggleGroup(groupName)} className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-slate-700 pb-2 transition-colors w-full text-left group hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer">
                                <ChevronDown size={20} className={`text-gray-400 dark:text-gray-500 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                                {viewMode === 'courses' && <FolderIcon className="text-indigo-500 dark:text-indigo-400" size={20} />}
                                {viewMode === 'tags' && <Tag className="text-pink-500 dark:text-pink-400" size={20} />}
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{groupName}</h3>
                                <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded-full transition-colors">{groupSubjects.length}</span>
                            </button>
                        )}

                        {!isCollapsed && (
                            <>
                                {layoutMode === 'grid' && (
                                    <div className="mb-10">
                                        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${(320 * cardScale) / 100}px, 1fr))` }}>
                                            {/* Promote Zone (Grid) */}
                                            {viewMode === 'grid' && (
                                                 <div>
                                                    {currentFolder && draggedItem && (draggedItemType === 'subject' || draggedItemType === 'folder') ? (
                                                        <div
                                                            onDragOver={handlePromoteZoneDragOver}
                                                            onDragLeave={handlePromoteZoneDragLeave}
                                                            onDrop={handlePromoteZoneDrop}
                                                            className={`group relative w-full border-3 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center ${
                                                                isPromoteZoneHovered ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20 scale-105' : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                                            }`}
                                                            style={{ aspectRatio: '16 / 10', gap: `${16 * (cardScale / 100)}px` }}
                                                        >
                                                            <div className={`rounded-full flex items-center justify-center transition-colors ${
                                                                isPromoteZoneHovered ? 'bg-amber-200 dark:bg-amber-800/60' : 'bg-amber-100 dark:bg-amber-900/40 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/60'
                                                            }`} style={{ width: `${80 * (cardScale / 100)}px`, height: `${80 * (cardScale / 100)}px` }}>
                                                                <ArrowUp className={`transition-colors ${isPromoteZoneHovered ? 'text-amber-700 dark:text-amber-300' : 'text-amber-600 dark:text-amber-400'}`} size={40 * (cardScale / 100)} />
                                                            </div>
                                                            <span className={`font-semibold transition-colors px-4 text-center ${
                                                                isPromoteZoneHovered ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400'
                                                            }`} style={{ fontSize: `${18 * (cardScale / 100)}px` }}>
                                                                {isPromoteZoneHovered ? `Mover a carpeta superior` : 'Arrastra aquí para mover a la carpeta anterior'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setSubjectModalConfig({ isOpen: true, isEditing: false, data: null, currentFolder: currentFolder })} className="group relative w-full border-3 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center justify-center cursor-pointer" style={{ aspectRatio: '16 / 10', gap: `${16 * (cardScale / 100)}px` }}>
                                                            <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/60 flex items-center justify-center transition-colors" style={{ width: `${80 * (cardScale / 100)}px`, height: `${80 * (cardScale / 100)}px` }}>
                                                                <Plus className="text-indigo-600 dark:text-indigo-400" size={40 * (cardScale / 100)} />
                                                            </div>
                                                            <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors px-4 text-center" style={{ fontSize: `${18 * (cardScale / 100)}px` }}>Crear Nueva Asignatura</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {/* (Existing Grid Logic...) */}
                                            {viewMode === 'grid' && orderedFolders.map((folder, index) => (
                                                <div key={`folder-${folder.id}`}>
                                                    <FolderCard folder={folder} onOpen={handleOpenFolder} activeMenu={activeMenu} onToggleMenu={setActiveMenu} onEdit={(f) => setFolderModalConfig({ isOpen: true, isEditing: true, data: f })} onDelete={(f) => setDeleteConfig({ isOpen: true, type: 'folder', item: f })} onShare={(f) => setFolderModalConfig({ isOpen: true, isEditing: true, data: f })} onShowContents={handleShowFolderContents} cardScale={cardScale} onDrop={handleDropOnFolder} onDropFolder={handleNestFolder} canDrop={isDragAndDropEnabled} draggable={isDragAndDropEnabled} onDragStart={handleDragStartFolder} onDragEnd={handleDragEnd} onDragOver={handleDragOverFolder} onDropReorder={handleDropReorderFolder} position={index} isDragging={draggedItem?.id === folder.id} />
                                                </div>
                                            ))}
                                            {groupSubjects.map((subject, index) => (
                                                <div key={`${groupName}-${subject.id}`}>
                                                    <SubjectCard subject={subject} isFlipped={flippedSubjectId === subject.id} onFlip={(id) => setFlippedSubjectId(flippedSubjectId === id ? null : id)} activeMenu={activeMenu} onToggleMenu={setActiveMenu} onSelect={handleSelectSubject} onSelectTopic={(sid, tid) => navigate(`/home/subject/${sid}/topic/${tid}`)} onEdit={(e, s) => { e.stopPropagation(); setSubjectModalConfig({ isOpen: true, isEditing: true, data: s }); setActiveMenu(null); }} onDelete={(e, s) => { e.stopPropagation(); setDeleteConfig({ isOpen: true, type: 'subject', item: s }); setActiveMenu(null); }} cardScale={cardScale} isDragging={draggedItem?.id === subject.id} onDragStart={handleDragStartSubject} onDragEnd={handleDragEnd} onDragOver={handleDragOverSubject} onDrop={handleDropReorderSubject} draggable={isDragAndDropEnabled} position={index} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* LIST VIEW (Corrected Logic) */}
                                {layoutMode === 'list' && (
                                     <div className="space-y-2 relative">
                                        
                                        {/* MOVE TO CURRENT LAYER ZONE */}
                                        {/* Shows when dragging any item if D&D is enabled */}
                                        {isDragAndDropEnabled && draggedItem && (
                                            <div 
                                                onDragOver={(e) => { e.preventDefault(); setIsRootZoneHovered(true); }}
                                                onDragLeave={() => setIsRootZoneHovered(false)}
                                                onDrop={handleRootZoneDrop}
                                                className={`mb-6 rounded-xl border-3 border-dashed transition-all duration-200 flex items-center justify-center gap-3 py-8 font-bold text-lg animate-in fade-in slide-in-from-top-4 ${
                                                    isRootZoneHovered 
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 scale-[1.02] shadow-lg ring-2 ring-indigo-200 dark:ring-indigo-800' 
                                                        : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-500 bg-slate-50/50 dark:bg-slate-900/50'
                                                }`}
                                            >
                                                <ArrowUpCircle size={32} />
                                                {currentFolder ? `Mover aquí (${currentFolder.name})` : "Mover al inicio (Root)"}
                                            </div>
                                        )}

                                        {/* Render Folders */}
                                        {orderedFolders.map((folder) => (
                                            <ListViewItem 
                                                key={folder.id}
                                                item={folder}
                                                type="folder"
                                                parentId={currentFolder ? currentFolder.id : null} // Current View Root
                                                allFolders={folders}
                                                allSubjects={subjects}
                                                onNavigate={handleOpenFolder}
                                                onNavigateSubject={handleSelectSubject}
                                                onEdit={(f) => setFolderModalConfig({ isOpen: true, isEditing: true, data: f })}
                                                onDelete={(f) => setDeleteConfig({ isOpen: true, type: 'folder', item: f })}
                                                cardScale={cardScale}
                                                onDragStart={handleDragStartFolder} 
                                                onDragEnd={handleDragEnd} 
                                                onDropAction={handleListDropAction}
                                            />
                                        ))}

                                        {/* Render Subjects */}
                                        {groupSubjects.map((subject) => (
                                            <ListViewItem
                                                key={subject.id}
                                                item={subject}
                                                type="subject"
                                                parentId={currentFolder ? currentFolder.id : null} // Current View Root
                                                allFolders={folders}
                                                allSubjects={subjects}
                                                onNavigateSubject={handleSelectSubject}
                                                onEdit={(s) => setSubjectModalConfig({ isOpen: true, isEditing: true, data: s })}
                                                onDelete={(s) => setDeleteConfig({ isOpen: true, type: 'subject', item: s })}
                                                cardScale={cardScale}
                                                onDragStart={handleDragStartSubject}
                                                onDragEnd={handleDragEnd}
                                                onDropAction={handleListDropAction}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            })}
        </>
    );
};

export default HomeContent;