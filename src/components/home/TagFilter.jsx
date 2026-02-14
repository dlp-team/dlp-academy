// src/components/home/TagFilter.jsx
import React, { useState } from 'react';
import { Filter, X, Folder, BookOpen } from 'lucide-react';

const TagFilter = ({ 
    allTags, 
    selectedTags, 
    setSelectedTags, 
    // New props from HomeControls
    activeFilter = 'all', 
    onFilterChange = () => {} 
}) => {
    const [showFilter, setShowFilter] = useState(false);

    // Helper: Determine if buttons should look "active" based on the single activeFilter string
    const isFolderOn = activeFilter === 'all' || activeFilter === 'folders';
    const isSubjectOn = activeFilter === 'all' || activeFilter === 'subjects';

    // Logic: Simulate toggles using the 3 states ('all', 'folders', 'subjects')
    const handleFolderClick = () => {
        if (activeFilter === 'all') {
            // Both are on, turning Folder OFF -> Show only Subjects
            onFilterChange('subjects');
        } else if (activeFilter === 'folders') {
            // Only Folder is on, clicking it again -> Reset to All
            onFilterChange('all');
        } else {
            // Only Subject is on, clicking Folder -> Turn Folder ON -> Show All
            onFilterChange('all');
        }
    };

    const handleSubjectClick = () => {
        if (activeFilter === 'all') {
            // Both are on, turning Subject OFF -> Show only Folders
            onFilterChange('folders');
        } else if (activeFilter === 'subjects') {
            // Only Subject is on, clicking it again -> Reset to All
            onFilterChange('all');
        } else {
            // Only Folder is on, clicking Subject -> Turn Subject ON -> Show All
            onFilterChange('all');
        }
    };

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const clearFilters = () => {
        setSelectedTags([]);
        onFilterChange('all'); // Also reset view to all
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer ${
                    selectedTags.length > 0 || activeFilter !== 'all'
                        ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300'
                        : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
            >
                <Filter size={16} />
                <span className="hidden sm:inline">Filtrar</span>
                {(selectedTags.length > 0 || activeFilter !== 'all') && (
                    <span className="bg-pink-500 dark:bg-pink-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {selectedTags.length + (activeFilter !== 'all' ? 1 : 0)}
                    </span>
                )}
            </button>

            {showFilter && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setShowFilter(false)}
                    />
                    
                    {/* Filter Panel */}
                    <div className="absolute top-full mt-2 left-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl p-4 z-[60] w-80 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 custom-scrollbar">
                        <div className="flex items-center justify-between mb-3 relative">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Filtrar por Etiquetas</span>
                            {/* Type filter icons */}
                            <div className="absolute top-0 right-0 flex gap-2">
                                <button
                                    onClick={handleFolderClick}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
                                        isFolderOn 
                                            ? 'bg-indigo-100 border-indigo-400 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-500 dark:text-indigo-300' 
                                            : 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-500'
                                    }`}
                                    style={{ zIndex: 30 }}
                                    title={isFolderOn ? "Ocultar carpetas" : "Mostrar carpetas"}
                                >
                                    <Folder size={18} />
                                </button>
                                <button
                                    onClick={handleSubjectClick}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
                                        isSubjectOn 
                                            ? 'bg-indigo-100 border-indigo-400 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-500 dark:text-indigo-300' 
                                            : 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-500'
                                    }`}
                                    style={{ zIndex: 30 }}
                                    title={isSubjectOn ? "Ocultar asignaturas" : "Mostrar asignaturas"}
                                >
                                    <BookOpen size={18} />
                                </button>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            Selecciona múltiples etiquetas para filtrar
                        </p>


                        {/* Tag List */}
                        <div className="space-y-1.5">
                            {allTags.map(tag => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500 dark:ring-pink-400'
                                                : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <span className="font-medium">#{tag}</span>
                                        {isSelected && (
                                            <div className="w-5 h-5 bg-pink-500 dark:bg-pink-600 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Limpiar button moved below tag list */}
                        {(selectedTags.length > 0 || activeFilter !== 'all') && (
                            <div className="flex justify-end mt-3">
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium cursor-pointer"
                                >
                                    Borrar filtros
                                </button>
                            </div>
                        )}

                        {allTags.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                No hay etiquetas disponibles
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TagFilter;