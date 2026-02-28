// src/components/home/TagFilter.jsx
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Filter, Users } from 'lucide-react';

const TagFilter = ({ 
    allTags, 
    selectedTags, 
    setSelectedTags, 
    activeFilter = 'all', 
    onFilterChange = () => {} ,
    onOverlayToggle,
    sharedScopeSelected = true,
    onSharedScopeChange = () => {}
}) => {
    const [showFilter, setShowFilter] = useState(false);
    const triggerRef = useRef(null);
    const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
    const PANEL_WIDTH = 320;
    const VIEWPORT_MARGIN = 8;


    const handleSetShowFilter = (newState) => {
        setShowFilter(newState);
        if (onOverlayToggle) onOverlayToggle(newState);
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
        onSharedScopeChange(true);
        onFilterChange('all'); // Also reset view to all
    };

    const sharedScopeFilterActive = sharedScopeSelected === false;
    const filterCount = selectedTags.length + (sharedScopeFilterActive ? 1 : 0);
    const hasActiveFilters = filterCount > 0 || activeFilter !== 'all';

    useLayoutEffect(() => {
        if (!showFilter || !triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const panelHeight = 420;

        const defaultLeft = rect.left;
        const oppositeLeft = rect.right - PANEL_WIDTH;

        let left = defaultLeft;
        if (left + PANEL_WIDTH > window.innerWidth - VIEWPORT_MARGIN) {
            left = oppositeLeft;
        }
        left = Math.min(
            Math.max(left, VIEWPORT_MARGIN),
            Math.max(VIEWPORT_MARGIN, window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN)
        );

        const defaultTop = rect.bottom + 8;
        const oppositeTop = rect.top - panelHeight - 8;

        let top = defaultTop;
        if (top + panelHeight > window.innerHeight - VIEWPORT_MARGIN) {
            top = oppositeTop;
        }
        top = Math.min(
            Math.max(top, VIEWPORT_MARGIN),
            Math.max(VIEWPORT_MARGIN, window.innerHeight - panelHeight - VIEWPORT_MARGIN)
        );

        setPanelPos({ top, left });
    }, [showFilter]);

    return (
        <div className="relative" ref={triggerRef}>
            <button
                onClick={() => handleSetShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium shadow-sm cursor-pointer ${
                    hasActiveFilters
                        ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300'
                        : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
            >
                <Filter size={16} />
                <span className="hidden sm:inline">Filtrar</span>
                {filterCount > 0 && (
                    <span className="bg-pink-500 dark:bg-pink-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {filterCount}
                    </span>
                )}
            </button>

            {/* Pass showFilter as a prop to parent (HomeControls) if needed */}
            {showFilter && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-10"
                        onClick={() => handleSetShowFilter(false)}
                    />
                    
                    {/* Filter Panel */}
                    <div
                        className="fixed bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl p-4 z-[60] w-80 max-h-96 overflow-y-auto custom-scrollbar"
                        style={{ top: panelPos.top, left: panelPos.left }}
                    >
                        <div className="flex items-center justify-between mb-3 relative">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Filtrar por Etiquetas</span>
                            <button
                                onClick={() => onSharedScopeChange(!sharedScopeSelected)}
                                className={`absolute top-0 right-0 inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors cursor-pointer ${
                                    sharedScopeSelected
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400'
                                        : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                                }`}
                                title={sharedScopeSelected ? 'Incluir compartidos' : 'Excluir compartidos'}
                                aria-label="Alternar filtro de compartidos"
                            >
                                <Users size={16} />
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            Selecciona múltiples etiquetas para filtrar
                        </p>

                        {/* Tag List */}
                        <div className="space-y-1.5" style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            maxHeight: 'calc(2.5rem * 4 + 0.375rem * 3)', // 4 rows of 2.5rem height + 3 gaps (0.375rem = 6px)
                            overflowY: allTags.length > 0 ? 'auto' : 'unset',
                        }}>
                            {allTags.map(tag => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`flex-1 min-w-[45%] max-w-[48%] flex items-center justify-between p-2.5 rounded-lg text-sm transition-all cursor-pointer m-0.5
                                            ${isSelected
                                                ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500 dark:ring-pink-400'
                                                : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}
                                        `}
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
                        {hasActiveFilters && (
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