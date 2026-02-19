// src/pages/Home/components/HomeEmptyState.jsx
import React from 'react';
import { LayoutGrid, Plus, FolderPlus } from 'lucide-react';

const HomeEmptyState = ({ setSubjectModalConfig, setFolderModalConfig }) => {
    return (
        <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
                <LayoutGrid className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No hay contenido todavía</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Crea tu primera asignatura o carpeta para empezar</p>
            <div className="flex gap-3 justify-center">
                <button
                    onClick={() => setSubjectModalConfig({ isOpen: true, isEditing: false, data: null })}
                    className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                    <Plus size={20} />
                    Crear Asignatura
                </button>
                <button
                    onClick={() => setFolderModalConfig({ isOpen: true, isEditing: false, data: null })}
                    className="px-6 py-3 bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-600 text-white rounded-xl font-medium shadow-lg transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                    <FolderPlus size={20} />
                    Crear Carpeta
                </button>
            </div>
        </div>
    );
};

export default HomeEmptyState;