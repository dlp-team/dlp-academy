// src/pages/Home/components/HomeSelectionToolbar.jsx
import React from 'react';
import { CheckSquare, Square, Trash2, FolderPlus, FolderInput, MoveRight } from 'lucide-react';

const HomeSelectionToolbar = ({
    visible = false,
    selectMode = false,
    selectedCount = 0,
    bulkMoveTargetFolderId = '',
    folders = [],
    onToggleSelectMode = () => {},
    onDeleteSelected = () => {},
    onCreateFolderFromSelection = () => {},
    onMoveTargetChange = () => {},
    onMoveSelection = () => {},
    onClearSelection = () => {},
}: any) => {
    if (!visible) return null;

    return (
        <div className="mt-4 mb-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 p-3 flex flex-wrap items-center gap-2">
            <button
                type="button"
                onClick={onToggleSelectMode}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                title={selectMode ? 'Salir de selección' : 'Modo selección'}
            >
                {selectMode ? <CheckSquare size={16} /> : <Square size={16} />}
                <span className="hidden sm:inline">{selectMode ? 'Salir de selección' : 'Modo selección'}</span>
            </button>

            {selectMode && (
                <>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                        {selectedCount} <span className="hidden sm:inline">elemento(s) seleccionado(s)</span>
                    </span>
                    <button
                        type="button"
                        onClick={onDeleteSelected}
                        disabled={selectedCount === 0}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Eliminar seleccionados"
                    >
                        <Trash2 size={16} /> <span className="hidden sm:inline">Eliminar seleccionados</span>
                    </button>
                    <button
                        type="button"
                        onClick={onCreateFolderFromSelection}
                        disabled={selectedCount === 0}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Nueva carpeta con selección"
                    >
                        <FolderPlus size={16} /> <span className="hidden sm:inline">Nueva carpeta con selección</span>
                    </button>
                    <div className="inline-flex flex-wrap items-center gap-2">
                        <FolderInput size={16} className="text-slate-500 dark:text-slate-300" />
                        <select
                            value={bulkMoveTargetFolderId}
                            onChange={(event) => onMoveTargetChange(event.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 max-w-[150px] sm:max-w-none"
                        >
                            <option value="">Mover al inicio</option>
                            {folders.map((folder: any) => (
                                <option key={folder.id} value={folder.id}>{folder.name}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={onMoveSelection}
                            disabled={selectedCount === 0}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Mover selección"
                        >
                            <MoveRight size={16} /> <span className="hidden sm:inline">Mover selección</span>
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={onClearSelection}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Limpiar selección"
                    >
                        <span className="hidden sm:inline">Limpiar selección</span>
                        <span className="sm:hidden">Limpiar</span>
                    </button>
                </>
            )}
        </div>
    );
};

export default HomeSelectionToolbar;
