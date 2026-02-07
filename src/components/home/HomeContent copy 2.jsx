// src/components/home/HomeContent.jsx
import React, { useState } from 'react';
import { 
    Plus, ChevronDown, Folder as FolderIcon, Tag, ArrowUp
} from 'lucide-react';
import SubjectIcon from '..//modals/SubjectIcon'; // Adjust path
import SubjectCard from '..//home/SubjectCard';   // Adjust path
import FolderCard from '..//home/FolderCard';     // Adjust path
import SubjectListItem from '..//home/SubjectListItem'; // Adjust path

const HomeContent = ({
    viewMode,
    layoutMode,
    cardScale,
    groupedContent,
    collapsedGroups,
    toggleGroup,
    currentFolder,
    orderedFolders,
    flippedSubjectId,
    setFlippedSubjectId,
    activeMenu,
    setActiveMenu,
    
    // Config Handlers
    setSubjectModalConfig,
    setFolderModalConfig,
    setDeleteConfig,
    
    // Action Handlers
    handleSelectSubject,
    handleOpenFolder,
    handleDropOnFolder,
    handlePromoteSubject,
    handlePromoteFolder,
    
    // Drag & Drop
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
    
    navigate
}) => {
    const [isPromoteZoneHovered, setIsPromoteZoneHovered] = useState(false);
    const [dropIndicator, setDropIndicator] = useState(null); // { type: 'subject'|'folder', position: number }

    // Show collapsible groups only in certain modes
    const showCollapsibleGroups = ['courses', 'tags', 'shared'].includes(viewMode);

    // Handle drag over promote zone
    const handlePromoteZoneDragOver = (e) => {
        if (currentFolder && draggedItem && (draggedItemType === 'subject' || draggedItemType === 'folder')) {
            e.preventDefault();
            e.stopPropagation();
            setIsPromoteZoneHovered(true);
        }
    };

    const handlePromoteZoneDragLeave = (e) => {
        e.preventDefault();
        setIsPromoteZoneHovered(false);
    };

    const handlePromoteZoneDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPromoteZoneHovered(false);

        if (!currentFolder || !draggedItem) return;

        if (draggedItemType === 'subject') {
            handlePromoteSubject(draggedItem.id);
        } else if (draggedItemType === 'folder') {
            handlePromoteFolder(draggedItem.id);
        }
    };

    // Enhanced drag over handlers with drop indicator
    const handleEnhancedDragOverSubject = (e, position) => {
        handleDragOverSubject(e, position);
        if (draggedItemType === 'subject') {
            setDropIndicator({ type: 'subject', position });
        }
    };

    const handleEnhancedDragOverFolder = (e, position) => {
        handleDragOverFolder(e, position);
        if (draggedItemType === 'folder') {
            setDropIndicator({ type: 'folder', position });
        }
    };

    const handleEnhancedDragLeave = () => {
        setDropIndicator(null);
    };

    const handleEnhancedDrop = (e, position, isFolder = false) => {
        setDropIndicator(null);
        if (isFolder) {
            handleDropReorderFolder(e, position);
        } else {
            handleDropReorderSubject(e, position);
        }
    };

    return (
        <>
            {Object.entries(groupedContent).map(([groupName, groupSubjects]) => {
                const isCollapsed = collapsedGroups[groupName];
                const showGroupHeader = showCollapsibleGroups;

                return (
                    <div key={groupName} className="mb-10">
                        {/* Group Header */}
                        {showGroupHeader && (
                            <button
                                onClick={() => toggleGroup(groupName)}
                                className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-slate-700 pb-2 transition-colors w-full text-left group hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer"
                            >
                                <ChevronDown 
                                    size={20} 
                                    className={`text-gray-400 dark:text-gray-500 transition-transform ${
                                        isCollapsed ? '-rotate-90' : ''
                                    }`}
                                />
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

                        {/* Content Area */}
                        {!isCollapsed && (
                            <>
                                {/* GRID LAYOUT */}
                                {layoutMode === 'grid' && (
                                    <div key={groupName} className="mb-10">
                                        <div 
                                            className="grid gap-6"
                                            style={{ 
                                                gridTemplateColumns: `repeat(auto-fill, minmax(${(320 * cardScale) / 100}px, 1fr))` 
                                            }}
                                        >
                                            {/* Create Button OR Promote Zone */}
                                            {viewMode === 'grid' && (
                                                <div>
                                                    {currentFolder && draggedItem && (draggedItemType === 'subject' || draggedItemType === 'folder') ? (
                                                        /* Promote Zone - only visible when dragging inside a folder */
                                                        <div
                                                            onDragOver={handlePromoteZoneDragOver}
                                                            onDragLeave={handlePromoteZoneDragLeave}
                                                            onDrop={handlePromoteZoneDrop}
                                                            className={`group relative w-full border-3 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center ${
                                                                isPromoteZoneHovered
                                                                    ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20 scale-105'
                                                                    : 'border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-900/10'
                                                            }`}
                                                            style={{ 
                                                                aspectRatio: '16 / 10',
                                                                gap: `${16 * (cardScale / 100)}px`
                                                            }}
                                                        >
                                                            <div 
                                                                className={`rounded-full flex items-center justify-center transition-colors ${
                                                                    isPromoteZoneHovered
                                                                        ? 'bg-amber-200 dark:bg-amber-800/60'
                                                                        : 'bg-amber-100 dark:bg-amber-900/40'
                                                                }`}
                                                                style={{
                                                                    width: `${80 * (cardScale / 100)}px`,
                                                                    height: `${80 * (cardScale / 100)}px`
                                                                }}
                                                            >
                                                                <ArrowUp 
                                                                    className={`transition-colors ${
                                                                        isPromoteZoneHovered
                                                                            ? 'text-amber-700 dark:text-amber-300'
                                                                            : 'text-amber-600 dark:text-amber-400'
                                                                    }`}
                                                                    size={40 * (cardScale / 100)}
                                                                />
                                                            </div>
                                                            <span 
                                                                className={`font-semibold transition-colors px-4 text-center ${
                                                                    isPromoteZoneHovered
                                                                        ? 'text-amber-700 dark:text-amber-300'
                                                                        : 'text-amber-600 dark:text-amber-400'
                                                                }`}
                                                                style={{ fontSize: `${18 * (cardScale / 100)}px` }}
                                                            >
                                                                Suelta para subir nivel
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        /* Create Subject button - always visible when not dragging */
                                                        <button 
                                                            onClick={() => setSubjectModalConfig({ 
                                                                isOpen: true, 
                                                                isEditing: false, 
                                                                data: currentFolder ? { folderId: currentFolder.id } : null 
                                                            })} 
                                                            className="group relative w-full border-3 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center justify-center cursor-pointer"
                                                            style={{ 
                                                                aspectRatio: '16 / 10',
                                                                gap: `${16 * (cardScale / 100)}px`
                                                            }}
                                                        >
                                                            <div 
                                                                className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/60 flex items-center justify-center transition-colors"
                                                                style={{
                                                                    width: `${80 * (cardScale / 100)}px`,
                                                                    height: `${80 * (cardScale / 100)}px`
                                                                }}
                                                            >
                                                                <Plus 
                                                                    className="text-indigo-600 dark:text-indigo-400"
                                                                    size={40 * (cardScale / 100)}
                                                                />
                                                            </div>
                                                            <span 
                                                                className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors px-4 text-center"
                                                                style={{ fontSize: `${18 * (cardScale / 100)}px` }}
                                                            >
                                                                {currentFolder ? 'Crear Asignatura Aquí' : 'Crear Nueva Asignatura'}
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Folders (Manual mode) - DRAGGABLE */}
                                            {viewMode === 'grid' && orderedFolders.map((folder, index) => (
                                                <React.Fragment key={`folder-${folder.id}`}>
                                                    {/* Drop indicator before folder */}
                                                    {dropIndicator?.type === 'folder' && dropIndicator.position === index && (
                                                        <div 
                                                            className="w-full border-4 border-dashed border-indigo-500 dark:border-indigo-400 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/20 animate-pulse"
                                                            style={{ aspectRatio: '16 / 10' }}
                                                        />
                                                    )}
                                                    
                                                    <div
                                                        onDragOver={(e) => handleEnhancedDragOverFolder(e, index)}
                                                        onDragLeave={handleEnhancedDragLeave}
                                                        onDrop={(e) => handleEnhancedDrop(e, index, true)}
                                                    >
                                                        <FolderCard
                                                            folder={folder}
                                                            onOpen={handleOpenFolder}
                                                            activeMenu={activeMenu}
                                                            onToggleMenu={setActiveMenu}
                                                            onEdit={(f) => setFolderModalConfig({ isOpen: true, isEditing: true, data: f })}
                                                            onDelete={(f) => setDeleteConfig({ isOpen: true, type: 'folder', item: f })}
                                                            onShare={(f) => setFolderModalConfig({ isOpen: true, isEditing: true, data: f })}
                                                            cardScale={cardScale}
                                                            onDrop={handleDropOnFolder}
                                                            canDrop={isDragAndDropEnabled && (draggedItemType === 'subject' || draggedItemType === 'folder')}
                                                            draggable={isDragAndDropEnabled}
                                                            onDragStart={handleDragStartFolder}
                                                            onDragEnd={handleDragEnd}
                                                            position={index}
                                                            isDragging={draggedItem?.id === folder.id}
                                                        />
                                                    </div>
                                                    
                                                    {/* Drop indicator after last folder */}
                                                    {dropIndicator?.type === 'folder' && dropIndicator.position === orderedFolders.length && index === orderedFolders.length - 1 && (
                                                        <div 
                                                            className="w-full border-4 border-dashed border-indigo-500 dark:border-indigo-400 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/20 animate-pulse"
                                                            style={{ aspectRatio: '16 / 10' }}
                                                            onDragOver={(e) => handleEnhancedDragOverFolder(e, orderedFolders.length)}
                                                            onDragLeave={handleEnhancedDragLeave}
                                                            onDrop={(e) => handleEnhancedDrop(e, orderedFolders.length, true)}
                                                        />
                                                    )}
                                                </React.Fragment>
                                            ))}

                                            {/* Subject Cards - DRAGGABLE */}
                                            {groupSubjects.map((subject, index) => (
                                                <React.Fragment key={`${groupName}-${subject.id}`}>
                                                    {/* Drop indicator before subject */}
                                                    {dropIndicator?.type === 'subject' && dropIndicator.position === index && (
                                                        <div 
                                                            className="w-full border-4 border-dashed border-indigo-500 dark:border-indigo-400 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/20 animate-pulse"
                                                            style={{ aspectRatio: '16 / 10' }}
                                                        />
                                                    )}
                                                    
                                                    <div
                                                        onDragOver={(e) => handleEnhancedDragOverSubject(e, index)}
                                                        onDragLeave={handleEnhancedDragLeave}
                                                        onDrop={(e) => handleEnhancedDrop(e, index, false)}
                                                    >
                                                        <SubjectCard
                                                            subject={subject}
                                                            isFlipped={flippedSubjectId === subject.id}
                                                            onFlip={(id) => setFlippedSubjectId(flippedSubjectId === id ? null : id)}
                                                            activeMenu={activeMenu}
                                                            onToggleMenu={setActiveMenu}
                                                            onSelect={handleSelectSubject}
                                                            onSelectTopic={(sid, tid) => navigate(`/home/subject/${sid}/topic/${tid}`)}
                                                            onEdit={(e, s) => { 
                                                                e.stopPropagation(); 
                                                                setSubjectModalConfig({ isOpen: true, isEditing: true, data: s }); 
                                                                setActiveMenu(null); 
                                                            }}
                                                            onDelete={(e, s) => { 
                                                                e.stopPropagation(); 
                                                                setDeleteConfig({ isOpen: true, type: 'subject', item: s }); 
                                                                setActiveMenu(null); 
                                                            }}
                                                            cardScale={cardScale}
                                                            isDragging={draggedItem?.id === subject.id}
                                                            onDragStart={handleDragStartSubject}
                                                            onDragEnd={handleDragEnd}
                                                            position={index}
                                                        />
                                                    </div>
                                                    
                                                    {/* Drop indicator after last subject */}
                                                    {dropIndicator?.type === 'subject' && dropIndicator.position === groupSubjects.length && index === groupSubjects.length - 1 && (
                                                        <div 
                                                            className="w-full border-4 border-dashed border-indigo-500 dark:border-indigo-400 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/20 animate-pulse"
                                                            style={{ aspectRatio: '16 / 10' }}
                                                            onDragOver={(e) => handleEnhancedDragOverSubject(e, groupSubjects.length)}
                                                            onDragLeave={handleEnhancedDragLeave}
                                                            onDrop={(e) => handleEnhancedDrop(e, groupSubjects.length, false)}
                                                        />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* LIST LAYOUT */}
                                {layoutMode === 'list' && (
                                    <div className="space-y-2">
                                        {groupSubjects.map((subject) => (
                                            <SubjectListItem
                                                key={subject.id}
                                                subject={subject}
                                                onSelect={handleSelectSubject}
                                                onEdit={(s) => setSubjectModalConfig({ isOpen: true, isEditing: true, data: s })}
                                                onDelete={(s) => setDeleteConfig({ isOpen: true, type: 'subject', item: s })}
                                                cardScale={cardScale}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* FOLDERS LAYOUT */}
                                {layoutMode === 'folders' && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {groupSubjects.map((subject) => (
                                            <button
                                                key={subject.id}
                                                onClick={() => handleSelectSubject(subject.id)}
                                                className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer"
                                            >
                                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${subject.color} flex items-center justify-center mb-3 mx-auto`}>
                                                    <SubjectIcon iconName={subject.icon} className="w-6 h-6 text-white" />
                                                </div>
                                                <h4 className="font-medium text-gray-900 dark:text-white text-center truncate">
                                                    {subject.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                                                    {subject.topics?.length || 0} temas
                                                </p>
                                            </button>
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