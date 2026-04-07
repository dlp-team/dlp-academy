// src/pages/Home/components/HomeSelectionToolbar.tsx
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

    const hasSelection = selectedCount > 0;
    const containerTone = selectMode && hasSelection
        ? 'border-sky-300 dark:border-sky-700 bg-sky-50/70 dark:bg-sky-950/25'
        : selectMode
            ? 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/80'
            : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70';
    const toggleTone = selectMode && hasSelection
        ? 'bg-sky-600 hover:bg-sky-700 text-white border border-sky-600'
        : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800';
    const activeSelectionBorderTone = selectMode
        ? 'border-2 border-[var(--color-primary-600)] dark:border-[var(--color-primary-400)]'
        : '';

    return (
        <div className={`mt-4 mb-6 rounded-xl border p-3 flex flex-col gap-3 ${containerTone}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onToggleSelectMode}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${toggleTone} ${activeSelectionBorderTone}`}
                        title={selectMode ? 'Salir de la selección' : 'Modo selección'}
                    >
                        {selectMode ? <CheckSquare size={16} /> : <Square size={16} />}
                        <span>{selectMode ? 'Salir de la selección' : 'Modo selección'}</span>
                    </button>

                    {selectMode && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            hasSelection
                                ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                            {selectedCount} seleccionados
                        </span>
                    )}
                </div>

                {selectMode && (
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={onCreateFolderFromSelection}
                            disabled={!hasSelection}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Crear carpeta con selección"
                        >
                            <FolderPlus size={16} /> Crear carpeta
                        </button>

                        <div className="inline-flex flex-wrap items-center gap-2 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
                            <FolderInput size={16} className="text-slate-500 dark:text-slate-300" />
                            <select
                                value={bulkMoveTargetFolderId}
                                onChange={(event) => onMoveTargetChange(event.target.value)}
                                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 max-w-[170px] sm:max-w-none"
                                aria-label="Destino para mover selección"
                            >
                                <option value="">Mover a inicio</option>
                                {folders.map((folder: any) => (
                                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={onMoveSelection}
                                disabled={!hasSelection}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Mover selección"
                            >
                                <MoveRight size={16} /> Mover a...
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={onDeleteSelected}
                            disabled={!hasSelection}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Mover selección a papelera"
                        >
                            <Trash2 size={16} /> Mover a papelera
                        </button>

                        <button
                            type="button"
                            onClick={onClearSelection}
                            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Limpiar selección"
                        >
                            Limpiar
                        </button>
                    </div>
                )}
            </div>

            {selectMode && (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                    Modo seguro: esta acción mueve elementos a la papelera. La eliminación permanente se gestiona dentro de la pestaña Papelera.
                </p>
            )}
        </div>
    );
};

export default HomeSelectionToolbar;
