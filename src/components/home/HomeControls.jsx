// src/components/home/HomeControls.jsx
import React from 'react';
import { 
    LayoutGrid, Clock, Folder as FolderIcon, Users, FolderPlus, Move 
} from 'lucide-react';
import ViewLayoutSelector from './ViewLayoutSelector';
import CardScaleSlider from './CardScaleSlider';
import TagFilter from './TagFilter';
import SearchBar from './SearchBar';

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
    allFolders = [],
    searchQuery = '',
    setSearchQuery = () => {}
}) => {
    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        setSelectedTags([]);
        setCollapsedGroups({});
        setCurrentFolder(null);
        if (onPreferenceChange) {
            onPreferenceChange('viewMode', mode);
        }
    };

    // Only change layoutMode, do not force viewMode to 'grid' (manual)
    const handleLayoutModeChange = (mode) => {
        // Do not change viewMode here! Only update layoutMode
        setLayoutMode(mode);
        if (onPreferenceChange) {
            onPreferenceChange('layoutMode', mode);
        }
    };

    const handleCardScaleChange = (scale) => {
        setCardScale(scale);
        if (onPreferenceChange) {
            onPreferenceChange('cardScale', scale);
        }
    };

    const handleTagsChange = (tags) => {
        setSelectedTags(tags);
        if (onPreferenceChange) {
            onPreferenceChange('selectedTags', tags);
        }
    };

    return (
        <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mis Asignaturas</h2>
                    <p className="text-gray-600 dark:text-gray-400">Gestiona tu contenido educativo</p>
                </div>
                
                {/* View Mode Switcher */}
                <div className="bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 inline-flex transition-colors">
                    {[
                        { id: 'grid', icon: Move, label: 'Manual' },
                        { id: 'usage', icon: Clock, label: 'Uso' },
                        { id: 'courses', icon: FolderIcon, label: 'Cursos' },
                        { id: 'shared', icon: Users, label: 'Compartido' }
                    ].map(mode => (
                        <button 
                            key={mode.id}
                            onClick={() => handleViewModeChange(mode.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                viewMode === mode.id 
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' 
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer'
                            }`}
                        >
                            <mode.icon size={16} /> 
                            <span className="hidden sm:inline">{mode.label}</span>
                        </button>
                    ))}
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
                />

                {/* Tag Filter - Now available in Manual (grid) mode */}
                {allTags.length > 0 && (
                    <TagFilter 
                        allTags={allTags}
                        selectedTags={selectedTags}
                        setSelectedTags={handleTagsChange}
                    />
                )}

                {/* Create Folder Button and Search Bar (Manual mode only) */}
                {viewMode === 'grid' && (
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
                {viewMode === 'grid' && (
                    <div 
                        className="relative flex justify-end"
                        style={{ minWidth: 220 }}
                    >
                        <SearchBar 
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Buscar..."
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeControls;