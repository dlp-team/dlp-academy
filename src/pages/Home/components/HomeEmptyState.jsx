// src/pages/Home/components/HomeEmptyState.jsx
import React from 'react';
import { LayoutGrid, Plus, Users } from 'lucide-react';
import { HOME_THEME_TOKENS } from '../../../utils/themeTokens';

const HomeEmptyState = ({
    setSubjectModalConfig,
    viewMode = 'grid',
    layoutMode = 'grid',
    canCreateSubject = true,
    cardScale = 100,
    currentFolder = null
}) => {
    if (viewMode === 'grid' && !canCreateSubject) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 transition-colors">
                    <Users className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                    No tienes permisos para crear aquí
                </h3>
                <p className={`${HOME_THEME_TOKENS.mutedTextClass} max-w-sm text-center`}>
                    Solo los editores de esta carpeta compartida pueden crear nuevas asignaturas.
                </p>
            </div>
        );
    }

    if (viewMode === 'grid' && layoutMode === 'list') {
        const scale = cardScale / 100;
        return (
            <div className="space-y-2 relative mb-4">
                <button
                    onClick={() => setSubjectModalConfig({ isOpen: true, isEditing: false, data: null, currentFolder })}
                    className={HOME_THEME_TOKENS.dashedCreateCardIndigoClass}
                    style={{
                        minHeight: `${(48 + 32) * scale}px`,
                        gap: `${16 * scale}px`
                    }}
                >
                    <div className="flex flex-row items-center justify-center w-full h-full gap-3">
                        <Plus
                            className="text-indigo-600 dark:text-indigo-400"
                            style={{ width: `${18 * scale}px`, height: `${18 * scale}px` }}
                        />
                        <span
                            className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-center"
                            style={{ fontSize: `${18 * scale}px` }}
                        >
                            Crear Nueva Asignatura
                        </span>
                    </div>
                </button>
            </div>
        );
    }

    if (viewMode === 'grid') {
        return (
            <div className="mb-10">
                <div
                    className="grid gap-6"
                    style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${(320 * cardScale) / 100}px, 1fr))` }}
                >
                    <button
                        onClick={() => setSubjectModalConfig({ isOpen: true, isEditing: false, data: null, currentFolder })}
                        className={HOME_THEME_TOKENS.dashedCreateCardIndigoClass}
                        style={{ aspectRatio: '16 / 10', gap: `${16 * (cardScale / 100)}px` }}
                    >
                        <div
                            className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/60 flex items-center justify-center transition-colors"
                            style={{ width: `${80 * (cardScale / 100)}px`, height: `${80 * (cardScale / 100)}px` }}
                        >
                            <Plus className="text-indigo-600 dark:text-indigo-400" size={40 * (cardScale / 100)} />
                        </div>
                        <span
                            className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors px-4 text-center"
                            style={{ fontSize: `${18 * (cardScale / 100)}px` }}
                        >
                            Crear Nueva Asignatura
                        </span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
                <LayoutGrid className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No hay contenido todavía</h3>
            <p className={`${HOME_THEME_TOKENS.mutedTextClass} mb-6`}>No hay elementos en esta vista.</p>
        </div>
    );
};

export default HomeEmptyState;