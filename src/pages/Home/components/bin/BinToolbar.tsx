// src/pages/Home/components/bin/BinToolbar.tsx
import React from 'react';
import { Trash2, ArrowLeft } from 'lucide-react';
import { BIN_SORT_MODES } from '../../utils/binViewUtils';

const BIN_SORT_OPTIONS = [
    { id: BIN_SORT_MODES.URGENCY_ASC, label: 'Urgencia: Ascendente' },
    { id: BIN_SORT_MODES.URGENCY_DESC, label: 'Urgencia: Descendente' },
    { id: BIN_SORT_MODES.ALPHA_ASC, label: 'Nombre: A-Z' },
    { id: BIN_SORT_MODES.ALPHA_DESC, label: 'Nombre: Z-A' },
];

const BIN_SORT_DESCRIPTIONS: Record<string, string> = {
    [BIN_SORT_MODES.URGENCY_ASC]: 'Ordenado por urgencia: menos tiempo restante primero.',
    [BIN_SORT_MODES.URGENCY_DESC]: 'Ordenado por urgencia: más tiempo restante primero.',
    [BIN_SORT_MODES.ALPHA_ASC]: 'Ordenado alfabéticamente de A a Z.',
    [BIN_SORT_MODES.ALPHA_DESC]: 'Ordenado alfabéticamente de Z a A.',
};

interface BinToolbarProps {
    activeFolderBinId: string | null;
    activeFolderPathLabel: string;
    folderBackButtonLabel: string;
    visibleCount: number;
    sortMode: string;
    onSortChange: (mode: string) => void;
    onEmptyBin: () => void;
    onCloseFolderView: () => void;
}

const BinToolbar: React.FC<BinToolbarProps> = ({
    activeFolderBinId,
    activeFolderPathLabel,
    folderBackButtonLabel,
    visibleCount,
    sortMode,
    onSortChange,
    onEmptyBin,
    onCloseFolderView,
}) => (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-2">
        <div>
            {activeFolderBinId && (
                <button
                    onClick={onCloseFolderView}
                    className="inline-flex items-center gap-2 mb-2 text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                >
                    <ArrowLeft size={15} />
                    {folderBackButtonLabel}
                </button>
            )}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {activeFolderBinId
                    ? `Papelera / ${activeFolderPathLabel} (${visibleCount})`
                    : `Papelera (${visibleCount})`}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {activeFolderBinId
                    ? 'Contenido interno de la carpeta eliminada. Puedes abrir subcarpetas y restaurar o eliminar elementos individuales.'
                    : BIN_SORT_DESCRIPTIONS[sortMode]}
            </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
            <label
                className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide"
                htmlFor="bin-sort-select"
            >
                Ordenar
            </label>
            <select
                id="bin-sort-select"
                value={sortMode}
                onChange={(event) => onSortChange(event.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-700 dark:text-gray-200"
                aria-label="Ordenar elementos de la papelera"
            >
                {BIN_SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                ))}
            </select>

            <button
                onClick={onEmptyBin}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
            >
                <Trash2 size={16} />
                {activeFolderBinId ? 'Vaciar vista actual' : 'Vaciar papelera'}
            </button>
        </div>
    </div>
);

export default BinToolbar;
