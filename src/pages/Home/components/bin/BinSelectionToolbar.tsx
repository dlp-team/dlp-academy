// src/pages/Home/components/bin/BinSelectionToolbar.tsx
import React from 'react';
import { Loader2, CheckSquare, Square, RotateCcw, Trash2 } from 'lucide-react';

interface BinSelectionToolbarProps {
    selectionMode: boolean;
    selectedBulkCount: number;
    visibleCount: number;
    bulkActionLoading: boolean;
    onToggleSelectionMode: () => void;
    onSelectAll: () => void;
    onClearSelection: () => void;
    onBulkRestore: () => void;
    onBulkDelete: () => void;
}

const BinSelectionToolbar: React.FC<BinSelectionToolbarProps> = ({
    selectionMode,
    selectedBulkCount,
    visibleCount,
    bulkActionLoading,
    onToggleSelectionMode,
    onSelectAll,
    onClearSelection,
    onBulkRestore,
    onBulkDelete,
}) => (
    <div className={`mt-4 mb-6 rounded-xl border p-3 flex flex-col gap-3 ${
        selectionMode && selectedBulkCount > 0
            ? 'border-sky-300 dark:border-sky-700 bg-sky-50/70 dark:bg-sky-950/25'
            : selectionMode
                ? 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/80'
                : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70'
    }`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onToggleSelectionMode}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectionMode && selectedBulkCount > 0
                            ? 'bg-sky-600 hover:bg-sky-700 text-white border border-sky-600'
                            : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    } ${selectionMode ? 'border-2 border-[var(--color-primary-600)] dark:border-[var(--color-primary-400)]' : ''}`}
                    aria-pressed={selectionMode}
                >
                    {selectionMode ? <CheckSquare size={16} /> : <Square size={16} />}
                    <span>{selectionMode ? 'Salir de la selección' : 'Modo selección'}</span>
                </button>

                {selectionMode && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        selectedBulkCount > 0
                            ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                        {selectedBulkCount} seleccionados
                    </span>
                )}
            </div>

            {selectionMode && (
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={onSelectAll}
                        disabled={visibleCount === 0}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                    >
                        {selectedBulkCount === visibleCount && visibleCount > 0
                            ? 'Quitar todo'
                            : 'Seleccionar todo'}
                    </button>
                    <button
                        type="button"
                        onClick={onClearSelection}
                        disabled={selectedBulkCount === 0}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                    >
                        Limpiar
                    </button>
                    <button
                        type="button"
                        onClick={onBulkRestore}
                        disabled={selectedBulkCount === 0 || bulkActionLoading}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        {bulkActionLoading ? <Loader2 className="animate-spin" size={16} /> : <RotateCcw size={16} />}
                        Restaurar selección
                    </button>
                    <button
                        type="button"
                        onClick={onBulkDelete}
                        disabled={selectedBulkCount === 0 || bulkActionLoading}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        {bulkActionLoading ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                        Eliminar selección
                    </button>
                </div>
            )}
        </div>

        {selectionMode && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
                Modo seguro: selecciona elementos y confirma antes de eliminar permanentemente.
            </p>
        )}
    </div>
);

export default BinSelectionToolbar;
