// src/components/ui/OrphanedShortcutCard.jsx
import React from 'react';
import { Trash2, Ghost, Folder, BookOpen } from 'lucide-react';

/**
 * Ghost card component for orphaned shortcuts (deleted targets)
 * Renders a grayed-out card with "Original file deleted" message
 * and option to remove the shortcut
 */
const OrphanedShortcutCard = ({ 
    shortcut, 
    cardScale = 100, 
    onDelete,
    layoutMode = 'grid' 
}) => {
    const scaleMultiplier = cardScale / 100;
    const isFolder = shortcut.targetType === 'folder';
    const Icon = isFolder ? Folder : BookOpen;

    if (layoutMode === 'list') {
        // List view rendering
        return (
            <div className="w-full bg-slate-100/50 dark:bg-slate-800/30 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                    <Ghost className="text-slate-400 dark:text-slate-500" size={20} />
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Archivo original eliminado
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                            Acceso directo a {isFolder ? 'carpeta' : 'asignatura'} que ya no existe
                        </p>
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete && onDelete(shortcut);
                    }}
                    className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2"
                >
                    <Trash2 size={14} />
                    Eliminar acceso directo
                </button>
            </div>
        );
    }

    // Grid view rendering (card)
    return (
        <div 
            className="group relative w-full rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden opacity-60 cursor-not-allowed"
            style={{ aspectRatio: '16 / 10' }}
        >
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200/30 to-slate-300/30 dark:from-slate-700/20 dark:to-slate-800/20"></div>

            {/* Content */}
            <div 
                className="relative h-full flex flex-col items-center justify-center gap-3 p-6"
                style={{ padding: `${24 * scaleMultiplier}px` }}
            >
                {/* Ghost icon */}
                <div className="relative">
                    <Icon 
                        className="text-slate-300 dark:text-slate-600" 
                        size={48 * scaleMultiplier} 
                        strokeWidth={1.5}
                    />
                    <Ghost 
                        className="absolute -top-2 -right-2 text-slate-400 dark:text-slate-500" 
                        size={24 * scaleMultiplier} 
                    />
                </div>

                {/* Message */}
                <div className="text-center space-y-1">
                    <p 
                        className="font-semibold text-slate-600 dark:text-slate-400"
                        style={{ fontSize: `${14 * scaleMultiplier}px` }}
                    >
                        Archivo original eliminado
                    </p>
                    <p 
                        className="text-slate-500 dark:text-slate-500"
                        style={{ fontSize: `${12 * scaleMultiplier}px` }}
                    >
                        Acceso directo sin destino
                    </p>
                </div>

                {/* Delete button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete && onDelete(shortcut);
                    }}
                    className="mt-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 shadow-sm"
                    style={{ 
                        fontSize: `${13 * scaleMultiplier}px`,
                        padding: `${8 * scaleMultiplier}px ${16 * scaleMultiplier}px`
                    }}
                >
                    <Trash2 size={14 * scaleMultiplier} />
                    Eliminar
                </button>
            </div>

            {/* Indicator badge */}
            <div 
                className="absolute top-4 right-4 bg-slate-600/80 dark:bg-slate-700/80 backdrop-blur-sm text-white rounded-full px-3 py-1 text-xs font-medium shadow-sm"
                style={{ 
                    fontSize: `${11 * scaleMultiplier}px`,
                    padding: `${4 * scaleMultiplier}px ${12 * scaleMultiplier}px`
                }}
            >
                Eliminado
            </div>
        </div>
    );
};

export default OrphanedShortcutCard;
