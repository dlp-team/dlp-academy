// src/pages/Home/components/HomeControls.jsx
import React from 'react';
import { 
    LayoutGrid, Clock, Folder as FolderIcon, Users, FolderPlus, Move 
} from 'lucide-react';
import ViewLayoutSelector from '../../../components/ui/ViewLayoutSelector';
import CardScaleSlider from '../../../components/ui/CardScaleSlider';
import TagFilter from '../../../components/ui/TagFilter';
import SearchBar from '../../../components/ui/SearchBar';
import useHomeControlsHandlers, { HOME_VIEW_MODES } from '../hooks/useHomeControlsHandlers';

const VIEW_MODE_ICONS = {
    grid: Move,
    usage: Clock,
    courses: FolderIcon,
    shared: Users
};

const HomeControls = ({
    viewMode, setViewMode,
    layoutMode, setLayoutMode,
    cardScale, setCardScale,
    allTags,
    selectedTags, setSelectedTags,
    currentFolder,
    setFolderModalConfig,
    setCollapsedGroups = () => {},
    setCurrentFolder,
    isDragAndDropEnabled,
    draggedItem,
    draggedItemType,
    onPreferenceChange,
    searchQuery = '',
    setSearchQuery = () => {},
    activeFilter,
    onFilterOverlayChange,
    onScaleOverlayChange,
    sharedScopeSelected = true,
    onSharedScopeChange = () => {},
    canCreateFolder = true,
    showSharedTab = true,
}) => {
    const {
        handleViewModeChange,
        handleLayoutModeChange,
        handleCardScaleChange,
        handleTagsChange
    } = useHomeControlsHandlers({
        setViewMode,
        setSelectedTags,
        setCollapsedGroups,
        setCurrentFolder,
        setLayoutMode,
        setCardScale,
        onPreferenceChange
    });

    const visibleViewModes = React.useMemo(
        () => (showSharedTab ? HOME_VIEW_MODES : HOME_VIEW_MODES.filter(mode => mode.id !== 'shared')),
        [showSharedTab]
    );

    return (
        <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mis Asignaturas</h2>
                    <p className="text-gray-600 dark:text-gray-400">Gestiona tu contenido educativo</p>
                </div>
                
                {/* View Mode Switcher */}
                <div className="bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 inline-flex transition-colors">
                    {visibleViewModes.map(mode => {
                        const Icon = VIEW_MODE_ICONS[mode.id];
                        return (
                        <button 
                            key={mode.id}
                            onClick={() => handleViewModeChange(mode.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                viewMode === mode.id 
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' 
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer'
                            }`}
                        >
                            <Icon size={16} /> 
                            <span className="hidden sm:inline">{mode.label}</span>
                        </button>
                        );
                    })}
                </div>
            </div>

            {/* Secondary Controls Row */}
            <div className="flex flex-wrap items-center gap-3 w-full">
                {/* Layout Mode Selector */}
                <ViewLayoutSelector 
                    layoutMode={layoutMode} 
                    setLayoutMode={handleLayoutModeChange}
                    viewMode={viewMode}
                />

                {/* Card Scale Slider */}
                <CardScaleSlider 
                    cardScale={cardScale} 
                    setCardScale={handleCardScaleChange}
                    onOverlayToggle={onScaleOverlayChange}
                />

                {/* Tag Filter - Now available in Manual (grid) mode */}
                <TagFilter 
                    allTags={allTags}
                    selectedTags={selectedTags}
                    setSelectedTags={handleTagsChange}
                    onOverlayToggle={onFilterOverlayChange}
                    activeFilter={activeFilter}
                    sharedScopeSelected={sharedScopeSelected}
                    onSharedScopeChange={onSharedScopeChange}
                />

                {/* Create Folder Button and Search Bar (Manual mode only) */}
                {viewMode === 'grid' && canCreateFolder && (
                    <>
                        <div className="flex items-center gap-2 flex-grow">
                            <button
                                onClick={() => setFolderModalConfig({ 
                                    isOpen: true, 
                                    isEditing: false, 
                                    data: null,
                                    currentFolder: currentFolder 
                                })}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
                            >
                                <FolderPlus size={16} />
                                <span>{currentFolder ? 'Nueva Subcarpeta' : 'Nueva Carpeta'}</span>
                            </button>
                        </div>
                    </>
                )}
                
                {/* Drag and Drop Hint */}
                {isDragAndDropEnabled && draggedItem && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-indigo-700 dark:text-indigo-300">
                        <span className="font-medium">
                            {draggedItemType === 'subject' && currentFolder 
                                ? 'Arrastra sobre carpeta, zona de promoción o reordena'
                                : draggedItemType === 'subject' 
                                    ? 'Arrastra sobre carpeta o reordena'
                                    : draggedItemType === 'folder' && currentFolder
                                        ? 'Arrastra sobre carpeta, zona de promoción o reordena'
                                        : 'Arrastra para reordenar o sobre carpeta para anidar'
                            }
                        </span>
                    </div>
                )}

                
                {/* 3. Search Bar */}
                <div 
                    className="relative flex justify-end flex-1 min-w-0 margin-0 padding ml-auto"
                    style={{ maxWidth: 380 }}
                >
                    <SearchBar 
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Buscar..."
                    />
                </div>
            </div>
        </div>
    );
};

export default HomeControls;