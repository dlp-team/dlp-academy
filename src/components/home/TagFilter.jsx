// src/components/home/TagFilter.jsx
import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

const TagFilter = ({ allTags, selectedTags, setSelectedTags }) => {
    const [showFilter, setShowFilter] = useState(false);

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const clearFilters = () => {
        setSelectedTags([]);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer ${
                    selectedTags.length > 0
                        ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300'
                        : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
            >
                <Filter size={16} />
                <span className="hidden sm:inline">Filtrar</span>
                {selectedTags.length > 0 && (
                    <span className="bg-pink-500 dark:bg-pink-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {selectedTags.length}
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
                    <div className="absolute top-full mt-2 left-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl p-4 z-20 w-80 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 custom-scrollbar">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Filtrar por Etiquetas</span>
                            {selectedTags.length > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium cursor-pointer"
                                >
                                    Limpiar
                                </button>
                            )}
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