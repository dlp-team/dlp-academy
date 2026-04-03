// src/pages/Home/components/bin/BinSelectionPanel.tsx
import React from 'react';
import { Info, RotateCcw, Trash2, Loader2, PanelRightClose } from 'lucide-react';
import { getDaysRemaining } from '../../utils/binViewUtils';

const BinSelectionPanel = ({
    item,
    itemType = 'subject',
    actionLoading,
    onClose,
    onShowDescription,
    onRestore,
    onDeleteConfirm,
}: any) => {
    const daysRemaining = getDaysRemaining(item);
    const isUrgent = daysRemaining <= 3;
    const isMedium = !isUrgent && daysRemaining <= 7;

    // Colores dinámicos adaptados a light/dark mode usando clases Tailwind
    const theme = isUrgent 
        ? {
            text: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-900/20',
            hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900/40',
            border: 'border-red-200 dark:border-red-900/50'
        }
        : isMedium
        ? {
            text: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            hoverBg: 'hover:bg-orange-100 dark:hover:bg-orange-900/40',
            border: 'border-orange-200 dark:border-orange-900/50'
        }
        : {
            text: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/40',
            border: 'border-emerald-200 dark:border-emerald-900/50'
        };

    const actionKey = `${itemType}:${item?.id}`;
    const isLoading = actionLoading === actionKey;
    const isFolderItem = itemType === 'folder';
    const isShortcutItem = itemType === 'shortcut-subject' || itemType === 'shortcut-folder';

    return (
        <div
            className="w-[360px] flex-shrink-0 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl space-y-4"
            onClick={e => e.stopPropagation()}
        >
            {/* ── Header ─────────────────────────────── */}
            <div className="flex items-start justify-between gap-3 p-5 pb-0">
                <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-bold">
                        Elemento seleccionado
                    </p>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                        {item?.name}
                    </h4>
                </div>
                <button
                    onClick={onClose}
                    title="Cerrar panel"
                    className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <PanelRightClose size={20} />
                </button>
            </div>

            {/* ── Acciones principales ────────────────────────── */}
            <div className="px-5 space-y-2">
                {typeof onShowDescription === 'function' && (
                    <ActionButton
                        onClick={onShowDescription}
                        disabled={isLoading}
                        icon={<Info size={18} />}
                        label={isFolderItem ? 'Abrir contenido de carpeta' : 'Ver contenido'}
                        themeClasses={{
                            text: 'text-gray-700 dark:text-gray-200',
                            bg: 'bg-gray-100 dark:bg-slate-800',
                            hoverBg: 'hover:bg-gray-200 dark:hover:bg-slate-700',
                            border: 'border-transparent dark:border-slate-700'
                        }}
                    />
                )}

                <ActionButton
                    onClick={() => onRestore(item?.id, itemType)}
                    disabled={isLoading}
                    icon={isLoading ? <Loader2 className="animate-spin" size={18} /> : <RotateCcw size={18} />}
                    label={isFolderItem
                        ? 'Restaurar carpeta completa'
                        : isShortcutItem
                            ? 'Restaurar acceso directo'
                            : 'Restaurar asignatura'}
                    themeClasses={theme} // Usa el tema verde/naranja/rojo de antes
                />

                <ActionButton
                    onClick={() => onDeleteConfirm(item?.id, itemType)}
                    disabled={isLoading}
                    icon={<Trash2 size={18} />}
                    label="Eliminar permanentemente"
                    themeClasses={{
                        text: 'text-red-700 dark:text-red-400',
                        bg: 'bg-red-50 dark:bg-red-900/20',
                        hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900/40',
                        border: 'border-red-200 dark:border-red-900/50'
                    }}
                />
            </div>

            {/* ── Hint inferior ────────────────────────── */}
            <div className="px-5 pb-4">
                <p className="text-[11px] text-center text-gray-400 dark:text-slate-500">
                    Pulsa fuera para deseleccionar
                </p>
            </div>
        </div>
    );
};

// ─── Botón reutilizable ──────────────────────────────────────────────
const ActionButton = ({ onClick, disabled, icon, label, themeClasses }: any) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 border disabled:opacity-50 disabled:cursor-not-allowed ${themeClasses.text} ${themeClasses.bg} ${themeClasses.hoverBg} ${themeClasses.border}`}
    >
        {icon}
        {label}
    </button>
);

export default BinSelectionPanel;