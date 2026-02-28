// src/pages/Home/components/HomeEmptyState.jsx
import React from 'react';
import { LayoutGrid, Plus, Users } from 'lucide-react';

const HomeEmptyState = ({
    setSubjectModalConfig,
    viewMode = 'grid',
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
                <p className="text-gray-500 dark:text-gray-400 max-w-sm text-center">
                    Solo los editores de esta carpeta compartida pueden crear nuevas asignaturas.
                </p>
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
                        className="group relative w-full border-3 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center justify-center cursor-pointer"
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
            <p className="text-gray-500 dark:text-gray-400 mb-6">No hay elementos en esta vista.</p>
        </div>
    );
};

export default HomeEmptyState;