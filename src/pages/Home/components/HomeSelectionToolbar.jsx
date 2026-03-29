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
}) => {
    if (!visible) return null;

    return (
        <div className="mt-4 mb-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 p-3 flex flex-wrap items-center gap-2">
            <button
                type="button"
                onClick={onToggleSelectMode}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
            >
                {selectMode ? <CheckSquare size={16} /> : <Square size={16} />}
                {selectMode ? 'Salir de selección' : 'Modo selección'}
            </button>

            {selectMode && (
                <>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                        {selectedCount} elemento(s) seleccionado(s)
                    </span>
                    <button
                        type="button"
                        onClick={onDeleteSelected}
                        disabled={selectedCount === 0}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 size={16} /> Eliminar seleccionados
                    </button>
                    <button
                        type="button"
                        onClick={onCreateFolderFromSelection}
                        disabled={selectedCount === 0}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FolderPlus size={16} /> Nueva carpeta con selección
                    </button>
                    <div className="inline-flex items-center gap-2">
                        <FolderInput size={16} className="text-slate-500 dark:text-slate-300" />
                        <select
                            value={bulkMoveTargetFolderId}
                            onChange={(event) => onMoveTargetChange(event.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200"
                        >
                            <option value="">Mover al inicio</option>
                            {folders.map((folder) => (
                                <option key={folder.id} value={folder.id}>{folder.name}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={onMoveSelection}
                            disabled={selectedCount === 0}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <MoveRight size={16} /> Mover selección
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={onClearSelection}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Limpiar selección
                    </button>
                </>
            )}
        </div>
    );
};

export default HomeSelectionToolbar;
