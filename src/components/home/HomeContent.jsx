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
    activeMenu,
    setActiveMenu,
    
    setSubjectModalConfig,
    setFolderModalConfig,
    setDeleteConfig,
    
    handleSelectSubject,
    handleOpenFolder,
    handleDropOnFolder, 
    handleNestFolder, 
    handlePromoteSubject,
    handlePromoteFolder,
    handleShowFolderContents,
    handleMoveSubjectWithSource, 
    handleMoveFolderWithSource,
    onShareSubject,

    onOpenTopics,
    
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

    // --- GRID VIEW PROMOTE ZONE HANDLERS ---
    const handlePromoteZoneDragOver = (e) => {
        if (currentFolder && (draggedItemType === 'subject' || draggedItemType === 'folder')) {
            e.preventDefault(); e.stopPropagation(); setIsPromoteZoneHovered(true);
        }
    };
    const handlePromoteZoneDragLeave = (e) => { e.preventDefault(); setIsPromoteZoneHovered(false); };
    const handlePromoteZoneDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setIsPromoteZoneHovered(false);
        // Debug: Log promote zone drop
        console.log('[DEBUG][HomeContent] handlePromoteZoneDrop', {
            currentFolder,
            draggedItem,
            draggedItemType
        });
        if (!currentFolder || !draggedItem) return;
        if (draggedItemType === 'subject') {
            console.log('[DEBUG][HomeContent] Calling handlePromoteSubject', { subjectId: draggedItem.id });
            handlePromoteSubject(draggedItem.id);
        }
        else if (draggedItemType === 'folder') {
            console.log('[DEBUG][HomeContent] Calling handlePromoteFolder', { folderId: draggedItem.id });
            handlePromoteFolder(draggedItem.id);
        }
    };

    // --- LIST VIEW: MOVE TO CURRENT LEVEL ZONE ---
    const handleRootZoneDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsRootZoneHovered(false);

        const treeDataString = e.dataTransfer.getData('treeItem');
        let draggedData;

        if (treeDataString) draggedData = JSON.parse(treeDataString);
        else {
            const sId = e.dataTransfer.getData('subjectId');
            const fId = e.dataTransfer.getData('folderId');
            if (sId) draggedData = { id: sId, type: 'subject' };
            else if (fId) draggedData = { id: fId, type: 'folder' };
        }

        if (!draggedData) return;

        // Target is the folder currently being viewed (or null if at root)
        const targetId = currentFolder ? currentFolder.id : null;

        // Prevent moving if already there
        if (draggedData.parentId === targetId) return;

        if (draggedData.type === 'subject') {
            if (handleMoveSubjectWithSource) {
                handleMoveSubjectWithSource(draggedData.id, targetId, draggedData.parentId);
            }
        } else if (draggedData.type === 'folder') {
            if (handleMoveFolderWithSource) {
                handleMoveFolderWithSource(draggedData.id, draggedData.parentId, targetId);
            } else {
                handleNestFolder(targetId, draggedData.id); 
            }
        }
        
        // Ensure drag ends
        if (handleDragEnd) handleDragEnd();
    };

    // --- LIST VIEW ITEM DROP ---
    const handleListDrop = (dragged, target) => {
        if (target.type === 'folder') {
            if (dragged.id === target.id) return;
            if (dragged.type === 'subject') {
                if (handleMoveSubjectWithSource) handleMoveSubjectWithSource(dragged.id, target.id, dragged.parentId);
                else handleDropOnFolder(target.id, dragged.id); 
            } else if (dragged.type === 'folder') {
                if (handleMoveFolderWithSource) handleMoveFolderWithSource(dragged.id, dragged.parentId, target.id);
                else handleNestFolder(target.id, dragged.id); 
            }
        }
        else if (target.type === 'subject') {
            const targetParentId = target.parentId || (currentFolder ? currentFolder.id : null);
            if (dragged.type === 'subject') {
                if (dragged.parentId !== targetParentId) {
                    if (handleMoveSubjectWithSource) handleMoveSubjectWithSource(dragged.id, targetParentId, dragged.parentId);
                    else handleDropOnFolder(targetParentId, dragged.id); 
                }
            }
        }
        
        // Ensure drag ends
        if (handleDragEnd) handleDragEnd();
    };

    return (
        <>
            {groupedContent && Object.entries(groupedContent).map(([groupName, groupSubjects]) => {
                const isCollapsed = collapsedGroups[groupName];

                return (
                    <div key={groupName} className="mb-10">
                        {showCollapsibleGroups && (
                            <button
                                onClick={() => toggleGroup(groupName)}
                                className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-slate-700 pb-2 transition-colors w-full text-left group hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer"
                            >
                                <ChevronDown size={20} className={`text-gray-400 dark:text-gray-500 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                                {viewMode === 'courses' && <FolderIcon className="text-indigo-500 dark:text-indigo-400" size={20} />}
                                {viewMode === 'tags' && <Tag className="text-pink-500 dark:text-pink-400" size={20} />}
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {groupName}
                                </h3>
                                <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded-full transition-colors">
                                    {groupSubjects.length}
                                </span>
                            </button>
                        )}

                        {!isCollapsed && (
                            <>
                                {/* GRID LAYOUT */}
                                {layoutMode === 'grid' && (
                                    <div className="mb-10">
                                        <div 
                                            className="grid gap-6"
                                            style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${(320 * cardScale) / 100}px, 1fr))` }}
                                        >
                                            {/* Promote Zone (Grid) */}
                                            {viewMode === 'grid' && (
                                                 <div>
                                                    {currentFolder && draggedItem && (draggedItemType === 'subject' || draggedItemType === 'folder') ? (
                                                        <div
                                                            onDragOver={handlePromoteZoneDragOver}
                                                            onDragLeave={handlePromoteZoneDragLeave}
                                                            onDrop={handlePromoteZoneDrop}
                                                            className={`group relative w-full border-3 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center ${
                                                                isPromoteZoneHovered
                                                                    ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20 scale-105'
                                                                    : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                                            }`}
                                                            style={{ aspectRatio: '16 / 10', gap: `${16 * (cardScale / 100)}px` }}
                                                        >
                                                            <div className={`rounded-full flex items-center justify-center transition-colors ${
                                                                isPromoteZoneHovered ? 'bg-amber-200 dark:bg-amber-800/60' : 'bg-amber-100 dark:bg-amber-900/40 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/60'
                                                            }`}
                                                            style={{ width: `${80 * (cardScale / 100)}px`, height: `${80 * (cardScale / 100)}px` }}
                                                            >
                                                                <ArrowUp className={`transition-colors ${isPromoteZoneHovered ? 'text-amber-700 dark:text-amber-300' : 'text-amber-600 dark:text-amber-400'}`} size={40 * (cardScale / 100)} />
                                                            </div>
                                                            <span className={`font-semibold transition-colors px-4 text-center ${
                                                                isPromoteZoneHovered ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400'
                                                            }`} style={{ fontSize: `${18 * (cardScale / 100)}px` }}>
                                                                {isPromoteZoneHovered ? `Mover a carpeta superior` : 'Arrastra aquí para mover a la carpeta anterior'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setSubjectModalConfig({ isOpen: true, isEditing: false, data: null, currentFolder: currentFolder })}
                                                            className="group relative w-full border-3 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center justify-center cursor-pointer"
                                                            style={{ aspectRatio: '16 / 10', gap: `${16 * (cardScale / 100)}px` }}
                                                        >
                                                            <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/60 flex items-center justify-center transition-colors"
                                                                style={{ width: `${80 * (cardScale / 100)}px`, height: `${80 * (cardScale / 100)}px` }}
                                                            >
                                                                <Plus className="text-indigo-600 dark:text-indigo-400" size={40 * (cardScale / 100)} />
                                                            </div>
                                                            <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors px-4 text-center" style={{ fontSize: `${18 * (cardScale / 100)}px` }}>
                                                                Crear Nueva Asignatura
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Folders in Grid */}
                                            {viewMode === 'grid' && orderedFolders.map((folder, index) => (
                                                <div key={`folder-${folder.id}`}>
                                                    <FolderCard
                                                        folder={folder}
                                                        allFolders={folders}
                                                        onOpen={handleOpenFolder}
                                                        activeMenu={activeMenu}
                                                        onToggleMenu={setActiveMenu}
                                                        onEdit={(f) => setFolderModalConfig({ isOpen: true, isEditing: true, data: f })}
                                                        onDelete={(f) => setDeleteConfig({ isOpen: true, type: 'folder', item: f })}
                                                        onShare={(f) => setFolderModalConfig({ isOpen: true, isEditing: true, data: f, initialTab: 'sharing' })}
                                                        onShowContents={handleShowFolderContents}
                                                        cardScale={cardScale}
                                                        onDrop={handleDropOnFolder}
                                                        onDropFolder={handleNestFolder}
                                                        canDrop={isDragAndDropEnabled}
                                                        draggable={isDragAndDropEnabled}
                                                        onDragStart={handleDragStartFolder}
                                                        onDragEnd={handleDragEnd}
                                                        onDragOver={handleDragOverFolder}
                                                        onDropReorder={handleDropReorderFolder}
                                                        position={index}
                                                        isDragging={draggedItem?.id === folder.id}
                                                    />
                                                </div>
                                            ))}

                                            {/* Subjects in Grid */}
                                            {groupSubjects.map((subject, index) => (
                                                <div key={`${groupName}-${subject.id}`}>
                                                    <SubjectCard
                                                        subject={subject}
                                                        activeMenu={activeMenu}
                                                        onToggleMenu={setActiveMenu}
                                                        onSelect={handleSelectSubject}
                                                        onSelectTopic={(sid, tid) => navigate(`/home/subject/${sid}/topic/${tid}`)}
                                                        onEdit={(e, s) => { e.stopPropagation(); setSubjectModalConfig({ isOpen: true, isEditing: true, data: s }); setActiveMenu(null); }}
                                                        onDelete={(e, s) => { e.stopPropagation(); setDeleteConfig({ isOpen: true, type: 'subject', item: s }); setActiveMenu(null); }}
                                                        onShare={(s) => { setSubjectModalConfig({ isOpen: true, isEditing: true, data: s, initialTab: 'sharing' }); setActiveMenu(null); }}
                                                        cardScale={cardScale}
                                                        isDragging={draggedItem?.id === subject.id}
                                                        onDragStart={handleDragStartSubject}
                                                        onDragEnd={handleDragEnd}
                                                        onDragOver={handleDragOverSubject}
                                                        onDrop={handleDropReorderSubject}
                                                        draggable={isDragAndDropEnabled}
                                                        position={index}
                                                        onOpenTopics={onOpenTopics}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* LIST VIEW (SCALABLE TREE) */}
                                {layoutMode === 'list' && (
                                     <div className="space-y-2 relative">
                                        
                                        {/* Crear Nueva Asignatura card for list view */}
                                        <button
                                            onClick={() => setSubjectModalConfig({ isOpen: true, isEditing: false, data: null, currentFolder: currentFolder })}
                                            className="group flex items-center w-full border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer mb-2"
                                            style={{
                                                minHeight: `${64 * (cardScale / 100)}px`,
                                                paddingLeft: `${32 * (cardScale / 100)}px`,
                                                paddingRight: `${32 * (cardScale / 100)}px`,
                                                paddingTop: `${16 * (cardScale / 100)}px`,
                                                paddingBottom: `${16 * (cardScale / 100)}px`,
                                                gap: `${16 * (cardScale / 100)}px`
                                            }}
                                        >
                                            <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/60 flex items-center justify-center transition-colors" style={{ width: `${48 * (cardScale / 100)}px`, height: `${48 * (cardScale / 100)}px` }}>
                                                <Plus className="text-indigo-600 dark:text-indigo-400" size={24 * (cardScale / 100)} />
                                            </span>
                                            <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-lg" style={{ fontSize: `${18 * (cardScale / 100)}px` }}>
                                                Crear Nueva Asignatura
                                            </span>
                                        </button>
                                        
                                        {/* Render Folders */}
                                        {viewMode === 'grid' && orderedFolders.map((folder) => (
                                            <ListViewItem 
                                                key={folder.id}
                                                item={folder}
                                                type="folder"
                                                parentId={currentFolder ? currentFolder.id : null}
                                                allFolders={folders}
                                                allSubjects={subjects}
                                                onNavigate={handleOpenFolder}
                                                onNavigateSubject={handleSelectSubject}
                                                onEdit={(f) => setFolderModalConfig({ isOpen: true, isEditing: true, data: f })}
                                                onDelete={(f) => setDeleteConfig({ isOpen: true, type: 'folder', item: f })}
                                                cardScale={cardScale}
                                                onDragStart={handleDragStartFolder} 
                                                onDragEnd={handleDragEnd}
                                                onDropAction={handleListDrop}
                                            />
                                        ))}

                                        {/* Render Subjects */}
                                        {groupSubjects.map((subject) => (
                                            <ListViewItem
                                                key={subject.id}
                                                item={subject}
                                                type="subject"
                                                parentId={currentFolder ? currentFolder.id : null}
                                                allFolders={folders}
                                                allSubjects={subjects}
                                                onNavigateSubject={handleSelectSubject}
                                                onEdit={(s) => setSubjectModalConfig({ isOpen: true, isEditing: true, data: s })}
                                                onDelete={(s) => setDeleteConfig({ isOpen: true, type: 'subject', item: s })}
                                                cardScale={cardScale}
                                                onDragStart={handleDragStartSubject}
                                                onDragEnd={handleDragEnd}
                                                onDropAction={handleListDrop}
                                            />
                                        ))}
                                        
                                         
                                        {/* --- MOVE TO ROOT ZONE (STABLE) --- */}
                                        {/* We keep the div ALWAYS rendered but hide it via CSS to prevent DOM layout shift crashes */}
                                        <div 
                                            onDragOver={(e) => { e.preventDefault(); setIsRootZoneHovered(true); }}
                                            onDragLeave={() => setIsRootZoneHovered(false)}
                                            onDrop={handleRootZoneDrop}
                                            className={`transition-all duration-200 overflow-hidden flex items-center justify-center gap-2 rounded-xl border-dashed font-medium text-sm
                                                ${draggedItem 
                                                    ? 'h-14 mb-4 border-2 opacity-100' // EXPAND when dragging
                                                    : 'h-0 mb-0 border-0 opacity-0'    // COLLAPSE when not dragging
                                                }
                                                ${isRootZoneHovered 
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 scale-[1.02]' 
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-indigo-300 hover:text-indigo-500'
                                                }
                                            `}
                                        >
                                            <ArrowUpCircle size={18} />
                                            {currentFolder ? `Mover al inicio de ${currentFolder.name}` : "Mover al inicio"}
                                        </div>
                                        {/* ------------------------------------------- */}



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