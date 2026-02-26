// src/pages/Home/components/HomeContent.jsx
import React, { useMemo, useRef } from 'react';
import { 
    Plus, ChevronDown, Folder as FolderIcon, Tag, ArrowUp, ArrowUpCircle
} from 'lucide-react';
import SubjectIcon from '../../../components/ui/SubjectIcon';
import SubjectCard from '../../../components/modules/SubjectCard/SubjectCard';
import FolderCard from '../../../components/modules/FolderCard/FolderCard'; 
import SubjectListItem from '../../../components/modules/ListItems/SubjectListItem';
import ListViewItem from '../../../components/modules/ListViewItem';
import useHomeContentDnd from '../hooks/useHomeContentDnd';
import useAutoScrollOnDrag from '../../../hooks/useAutoScrollOnDrag';
import { isShortcutItem, getPermissionLevel } from '../../../utils/permissionUtils';

const HomeContent = ({
    user,
    viewMode = 'grid',
    layoutMode = 'grid',
    cardScale = 100,
    groupedContent = {}, 
    collapsedGroups = {},
    toggleGroup = () => {},
    currentFolder = null,
    orderedFolders = [],
    activeMenu,
    setActiveMenu,
    
    setSubjectModalConfig,
    setFolderModalConfig,
    setDeleteConfig,
    onDeleteShortcut,
    
    handleSelectSubject,
    handleOpenFolder,
    handleDropOnFolder, 
    handleNestFolder, 
    handlePromoteSubject,
    handlePromoteFolder,
    handleShowFolderContents,
    handleMoveSubjectWithSource, 
    handleMoveFolderWithSource,

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
    resolvedShortcuts = [],
    
    navigate,
    activeFilter,
    selectedTags = [],
    filterOverlayOpen = false,
    onCloseFilterOverlay = () => {},
}) => {
    const contentRef = useRef(null);
    const sharedFolderPermission = currentFolder?.isShared && user?.uid
        ? getPermissionLevel(currentFolder, user.uid)
        : 'none';
    const isViewerInSharedFolder = currentFolder?.isShared === true && sharedFolderPermission === 'viewer';
    const isEditorInSharedFolder = currentFolder?.isShared === true && sharedFolderPermission === 'editor';
    const disableAllActionsInShared = isViewerInSharedFolder;
    const disableFolderDeleteActionsInShared = isViewerInSharedFolder || isEditorInSharedFolder;
    const disableSubjectDeleteActionsInShared = isViewerInSharedFolder;
    const dndEnabledInContext = isDragAndDropEnabled && !disableAllActionsInShared;
    const canCreateInCurrentContext = !disableAllActionsInShared;

    // Auto-scroll is always enabled for both grid and list modes
    useAutoScrollOnDrag({
        containerRef: contentRef,
        enabled: dndEnabledInContext,
        scrollContainer: 'window',
        edgeThreshold: 160
    });

    const {
        isPromoteZoneHovered,
        isRootZoneHovered,
        setIsRootZoneHovered,
        handlePromoteZoneDragOver,
        handlePromoteZoneDragLeave,
        handlePromoteZoneDrop,
        handleRootZoneDrop,
        handleListDrop
    } = useHomeContentDnd({
        currentFolder,
        draggedItem,
        draggedItemType,
        handlePromoteSubject,
        handlePromoteFolder,
        handleDropOnFolder,
        handleMoveSubjectWithSource,
        handleNestFolder,
        handleMoveFolderWithSource,
        handleDragEnd
    });

    const showCollapsibleGroups = ['courses', 'tags', 'shared'].includes(viewMode);

    // --- FILTER FOLDERS IF TAG FILTER IS ACTIVE ---
    let filteredFolders = orderedFolders;
    if (selectedTags && selectedTags.length > 0) {
        // Only show folders that have at least one of the selected tags
        filteredFolders = orderedFolders.filter(folder =>
            Array.isArray(folder.tags) && folder.tags.some(tag => selectedTags.includes(tag))
        );
    }

    // --- FILTERING LOGIC ---
    // No folder filter logic anymore

    const allShortcutFolders = useMemo(
        () => (Array.isArray(resolvedShortcuts) ? resolvedShortcuts.filter(s => s?.targetType === 'folder') : []),
        [resolvedShortcuts]
    );

    const allShortcutSubjects = useMemo(
        () => (Array.isArray(resolvedShortcuts) ? resolvedShortcuts.filter(s => s?.targetType === 'subject') : []),
        [resolvedShortcuts]
    );

    const allFoldersForTree = useMemo(() => {
        const merged = [];
        const seen = new Set();

        (folders || []).forEach(folder => {
            const key = `source:${folder.id}`;
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(folder);
            }
        });

        allShortcutFolders.forEach(folder => {
            const key = `shortcut:${folder.shortcutId || folder.id}`;
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(folder);
            }
        });

        return merged;
    }, [folders, allShortcutFolders]);

    const allSubjectsForTree = useMemo(() => {
        const merged = [];
        const seen = new Set();

        (subjects || []).forEach(subject => {
            const key = `source:${subject.id}`;
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(subject);
            }
        });

        allShortcutSubjects.forEach(subject => {
            const key = `shortcut:${subject.shortcutId || subject.id}`;
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(subject);
            }
        });

        return merged;
    }, [subjects, allShortcutSubjects]);

    const handleGoToFolderFromGhost = (folderId) => {
        if (!folderId) return;

        const targetFolder =
            (allFoldersForTree || []).find(f => f.id === folderId) ||
            (folders || []).find(f => f.id === folderId) ||
            { id: folderId };

        handleOpenFolder(targetFolder);
    };

    
    return (
        <div
        ref={contentRef}
        className={`transition-opacity duration-200 ${
        filterOverlayOpen ? 'pointer-events-none opacity-100' : ''
        }`}>
            {groupedContent && Object.entries(groupedContent).map(([groupName, groupSubjects]) => {
                const isCollapsed = collapsedGroups[groupName];

                return (
                    <div key={groupName} className="mb-10">
                        {showCollapsibleGroups && (
                            <button
                                onClick={() => toggleGroup(groupName)}
                                className={`flex items-center gap-2 w-full text-left group rounded-lg py-2 px-1 mb-4 transition-colors
                                    ${viewMode === 'courses' ? 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20' : 'hover:bg-pink-50 dark:hover:bg-pink-900/20'}
                                `}
                            >
                                {viewMode === 'courses' && <FolderIcon className="text-indigo-500 dark:text-indigo-400" size={20} />}
                                {viewMode === 'tags' && <Tag className="text-pink-500 dark:text-pink-400" size={20} />}
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {groupName}
                                </h3>
                                <span className={
                                    viewMode === 'courses'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-2 py-1 rounded-full'
                                        : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-xs font-bold px-2 py-1 rounded-full'
                                }>
                                    {groupSubjects.length}
                                </span>
                                <span className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>▼</span>
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
                                            {/* Create Subject Button for courses/tags view */}
                                            {(viewMode === 'courses' || viewMode === 'tags') && canCreateInCurrentContext && (
                                                <button
                                                    onClick={() => {
                                                        let data = null;
                                                        if (viewMode === 'courses') {
                                                            // groupName comes as "6º Universidad" so swap for correct format
                                                            const parts = groupName.split(' ');
                                                            const grade = parts[0]; // e.g., "6º"
                                                            const level = parts.slice(1).join(' '); // e.g., "Universidad"
                                                            data = { course: groupName, level, grade };
                                                        }
                                                        setSubjectModalConfig({ 
                                                            isOpen: true, 
                                                            isEditing: false, 
                                                            data, 
                                                            currentFolder: null 
                                                        });
                                                    }}
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

                                            {/* Promote Zone (Grid) */}
                                                {viewMode === 'grid' && canCreateInCurrentContext && (
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
                                            {viewMode === 'grid' && activeFilter !== 'subjects' && filteredFolders.map((folder, index) => {
                                                return (
                                                <div key={`folder-${folder.id}`}>
                                                    <FolderCard
                                                        folder={folder}
                                                        user={user}
                                                        allFolders={allFoldersForTree}
                                                        allSubjects={allSubjectsForTree}
                                                        onOpen={handleOpenFolder}
                                                        activeMenu={activeMenu}
                                                        onToggleMenu={setActiveMenu}
                                                        onEdit={(f) => setFolderModalConfig({ isOpen: true, isEditing: true, data: f })}
                                                        onDelete={(f, action = 'delete') => {
                                                            if (disableAllActionsInShared || disableFolderDeleteActionsInShared) return;
                                                            if (isShortcutItem(f) && f?.shortcutId) {
                                                                setDeleteConfig({
                                                                    isOpen: true,
                                                                    type: 'shortcut-folder',
                                                                    action: action === 'unshareAndDelete'
                                                                        ? 'unshare'
                                                                        : action === 'deleteShortcut'
                                                                            ? 'deleteShortcut'
                                                                        : action === 'showInManual'
                                                                            ? 'unhide'
                                                                            : 'hide',
                                                                    item: f
                                                                });
                                                                return;
                                                            }
                                                            setDeleteConfig({ isOpen: true, type: 'folder', item: f });
                                                        }}
                                                        onShare={(f) => {
                                                            if (disableAllActionsInShared) return;
                                                            setFolderModalConfig({ isOpen: true, isEditing: true, data: f, initialTab: 'sharing' });
                                                        }}
                                                        onShowContents={handleShowFolderContents}
                                                        onGoToFolder={handleGoToFolderFromGhost}
                                                        cardScale={cardScale}
                                                        onDrop={handleDropOnFolder}
                                                        onDropFolder={handleNestFolder}
                                                        canDrop={dndEnabledInContext}
                                                        draggable={dndEnabledInContext}
                                                        onDragStart={handleDragStartFolder}
                                                        onDragEnd={handleDragEnd}
                                                        onDragOver={handleDragOverFolder}
                                                        onDropReorder={handleDropReorderFolder}
                                                        position={index}
                                                        isDragging={draggedItem?.id === folder.id}
                                                        filterOverlayOpen={filterOverlayOpen}
                                                        onCloseFilterOverlay={onCloseFilterOverlay}
                                                        disableAllActions={disableAllActionsInShared}
                                                        disableDeleteActions={disableFolderDeleteActionsInShared}
                                                    />
                                                </div>
                                            );
                                            })}

                                            {/* Subjects in Grid */}
                                            {activeFilter !== 'folders' && groupSubjects.map((subject, index) => {
                                                return (
                                                <div key={`${groupName}-${subject.id}`}>
                                                    <SubjectCard
                                                        subject={subject}
                                                        user={user}
                                                        activeMenu={activeMenu}
                                                        onToggleMenu={setActiveMenu}
                                                        onSelect={handleSelectSubject}
                                                        onSelectTopic={(sid, tid) => navigate(`/home/subject/${sid}/topic/${tid}`)}
                                                        onEdit={(e, s) => { e.stopPropagation(); setSubjectModalConfig({ isOpen: true, isEditing: true, data: s }); setActiveMenu(null); }}
                                                        onDelete={(e, s, action = 'delete') => {
                                                            if (disableAllActionsInShared || disableSubjectDeleteActionsInShared) return;
                                                            e.stopPropagation();
                                                            if (isShortcutItem(s) && s?.shortcutId) {
                                                                setDeleteConfig({
                                                                    isOpen: true,
                                                                    type: 'shortcut-subject',
                                                                    action: action === 'unshareAndDelete'
                                                                        ? 'unshare'
                                                                        : action === 'deleteShortcut'
                                                                            ? 'deleteShortcut'
                                                                        : action === 'showInManual'
                                                                            ? 'unhide'
                                                                            : 'hide',
                                                                    item: s
                                                                });
                                                            } else {
                                                                setDeleteConfig({ isOpen: true, type: 'subject', item: s });
                                                            }
                                                            setActiveMenu(null);
                                                        }}
                                                        onShare={(s) => {
                                                            if (disableAllActionsInShared) return;
                                                            setSubjectModalConfig({ isOpen: true, isEditing: true, data: s, initialTab: 'sharing' });
                                                            setActiveMenu(null);
                                                        }}
                                                        cardScale={cardScale}
                                                        isDragging={draggedItem?.id === subject.id}
                                                        onDragStart={handleDragStartSubject}
                                                        onDragEnd={handleDragEnd}
                                                        onDragOver={handleDragOverSubject}
                                                        onDrop={handleDropReorderSubject}
                                                        draggable={dndEnabledInContext}
                                                        position={index}
                                                        onOpenTopics={onOpenTopics}
                                                        onGoToFolder={handleGoToFolderFromGhost}
                                                        filterOverlayOpen={filterOverlayOpen}
                                                        disableAllActions={disableAllActionsInShared}
                                                        disableDeleteActions={disableSubjectDeleteActionsInShared}
                                                    />
                                                </div>
                                            );
                                            })}
                                        </div>
                                    </div>
                                )}
                                
                                {/* LIST VIEW (SCALABLE TREE) */}
                                {layoutMode === 'list' && (
                                     <div className="space-y-2 relative">
                                        
                                        {/* Crear Nueva Asignatura / Drop Zone for list view - only in grid/manual modes */}
                                        {(viewMode === 'grid' || viewMode === 'courses' || viewMode === 'tags') && canCreateInCurrentContext && (
                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setIsRootZoneHovered(true); }}
                                                onDragLeave={() => setIsRootZoneHovered(false)}
                                                onDrop={handleRootZoneDrop}
                                                onClick={() => { 
                                                    if (!draggedItem) {
                                                        let data = null;
                                                        if (viewMode === 'courses') {
                                                            // groupName comes as "6º Universidad" so swap for correct format
                                                            const parts = groupName.split(' ');
                                                            const grade = parts[0]; // e.g., "6º"
                                                            const level = parts.slice(1).join(' '); // e.g., "Universidad"
                                                            data = { course: groupName, level, grade };
                                                        }
                                                        setSubjectModalConfig({ 
                                                            isOpen: true, 
                                                            isEditing: false, 
                                                            data, 
                                                            currentFolder: currentFolder 
                                                        }); 
                                                    }
                                                }}
                                                className={`group relative w-full border-3 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center cursor-pointer mb-2
                                                    ${draggedItem
                                                        ? isRootZoneHovered
                                                            ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20 scale-105'
                                                            : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                                        : isRootZoneHovered
                                                            ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-105'
                                                            : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                                    }
                                                `}
                                                style={{
                                                    // Match SubjectListItem card height: padding (top+bottom) + icon size
                                                    // padding: 16 * scale (top) + 16 * scale (bottom) = 32 * scale
                                                    // iconContainerSize: 48 * scale
                                                    // total: 80 * scale
                                                    minHeight: `${(48 + 32) * (cardScale / 100)}px`,
                                                    gap: `${16 * (cardScale / 100)}px`
                                                }}
                                            >
                                                {draggedItem ? (
                                                <div className="flex flex-row items-center justify-center w-full h-full gap-3">
                                                    <ArrowUp className={`transition-colors ${isRootZoneHovered ? 'text-amber-700 dark:text-amber-300' : 'text-amber-600 dark:text-amber-400'}`} style={{ width: `${18 * (cardScale / 100)}px`, height: `${18 * (cardScale / 100)}px` }} />
                                                    <span className={`font-semibold transition-colors text-center ${isRootZoneHovered ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400'}`}
                                                        style={{ fontSize: `${18 * (cardScale / 100)}px` }}
                                                    >
                                                        {isRootZoneHovered ? (currentFolder ? `Mover al inicio de ${currentFolder.name}` : "Mover al inicio") : 'Arrastra aquí para mover al inicio'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-row items-center justify-center w-full h-full gap-3">
                                                    <Plus className="text-indigo-600 dark:text-indigo-400" style={{ width: `${18 * (cardScale / 100)}px`, height: `${18 * (cardScale / 100)}px` }} />
                                                    <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-center" style={{ fontSize: `${18 * (cardScale / 100)}px` }}>
                                                        Crear Nueva Asignatura
                                                    </span>
                                                </div>
                                            )}
                                            </div>
                                        )}
                                        
                                        {/* Render Folders */}
                                        {viewMode === 'grid' && filteredFolders.map((folder) => (
                                            <ListViewItem 
                                                key={folder.id}
                                                user={user}
                                                item={folder}
                                                type="folder"
                                                parentId={currentFolder ? currentFolder.id : null}
                                                allFolders={allFoldersForTree}
                                                allSubjects={allSubjectsForTree}
                                                onNavigate={handleOpenFolder}
                                                onNavigateSubject={handleSelectSubject}
                                                onEdit={(f) => setFolderModalConfig({ isOpen: true, isEditing: true, data: f })}
                                                onDelete={(f, action = 'delete') => {
                                                    if (disableAllActionsInShared || disableFolderDeleteActionsInShared) return;
                                                    if (isShortcutItem(f) && f?.shortcutId) {
                                                        setDeleteConfig({
                                                            isOpen: true,
                                                            type: 'shortcut-folder',
                                                            action: action === 'unshareAndDelete'
                                                                ? 'unshare'
                                                                : action === 'deleteShortcut'
                                                                    ? 'deleteShortcut'
                                                                : action === 'showInManual'
                                                                    ? 'unhide'
                                                                    : 'hide',
                                                            item: f
                                                        });
                                                        return;
                                                    }
                                                    setDeleteConfig({ isOpen: true, type: 'folder', item: f });
                                                }}
                                                onShare={(f) => {
                                                    if (disableAllActionsInShared) return;
                                                    setFolderModalConfig({ isOpen: true, isEditing: true, data: f, initialTab: 'sharing' });
                                                }}
                                                onGoToFolder={handleGoToFolderFromGhost}
                                                cardScale={cardScale}
                                                onDragStart={handleDragStartFolder} 
                                                onDragEnd={handleDragEnd}
                                                onDropAction={disableAllActionsInShared ? () => {} : handleListDrop}
                                                disableAllActions={disableAllActionsInShared}
                                                disableDeleteActions={disableFolderDeleteActionsInShared}
                                                draggable={dndEnabledInContext}
                                            />
                                        ))}

                                        {/* Render Subjects */}
                                        {groupSubjects.map((subject) => {
                                            return (
                                                <ListViewItem
                                                    key={subject.id}
                                                    user={user}
                                                    item={subject}
                                                    type="subject"
                                                    parentId={currentFolder ? currentFolder.id : null}
                                                    allFolders={allFoldersForTree}
                                                    allSubjects={allSubjectsForTree}
                                                    onNavigateSubject={handleSelectSubject}
                                                    onEdit={(s) => setSubjectModalConfig({ isOpen: true, isEditing: true, data: s })}
                                                    onDelete={(s, action = 'delete') => {
                                                        if (disableAllActionsInShared || disableSubjectDeleteActionsInShared) return;
                                                        if (isShortcutItem(s) && s?.shortcutId) {
                                                            setDeleteConfig({
                                                                isOpen: true,
                                                                type: 'shortcut-subject',
                                                                action: action === 'unshareAndDelete'
                                                                    ? 'unshare'
                                                                    : action === 'deleteShortcut'
                                                                        ? 'deleteShortcut'
                                                                    : action === 'showInManual'
                                                                        ? 'unhide'
                                                                        : 'hide',
                                                                item: s
                                                            });
                                                            return;
                                                        }
                                                        setDeleteConfig({ isOpen: true, type: 'subject', item: s });
                                                    }}
                                                    onShare={(s) => {
                                                        if (disableAllActionsInShared) return;
                                                        setSubjectModalConfig({ isOpen: true, isEditing: true, data: s, initialTab: 'sharing' });
                                                        setActiveMenu(null);
                                                    }}
                                                    onGoToFolder={handleGoToFolderFromGhost}
                                                    cardScale={cardScale}
                                                    onDragStart={handleDragStartSubject}
                                                    onDragEnd={handleDragEnd}
                                                    onDropAction={disableAllActionsInShared ? () => {} : handleListDrop}
                                                    disableAllActions={disableAllActionsInShared}
                                                    disableDeleteActions={disableSubjectDeleteActionsInShared}
                                                    draggable={dndEnabledInContext}
                                                />
                                            );
                                        })}
                                        
                                         
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
        </div>
    );
};

export default HomeContent;