// src/pages/Home/components/HomeDeleteConfirmModal.jsx
import React from 'react';
import { Trash2 } from 'lucide-react';

const HomeDeleteConfirmModal = ({ deleteConfig, setDeleteConfig, handleDelete }) => {
    if (!deleteConfig.isOpen) return null;

    const isShortcutSubject = deleteConfig.type === 'shortcut-subject';
    const isShortcutFolder = deleteConfig.type === 'shortcut-folder';
    const isShortcut = isShortcutSubject || isShortcutFolder;
    const isUnshareShortcut = isShortcut && deleteConfig.action === 'unshare';

    const title = isShortcut
        ? isUnshareShortcut
            ? `¿Eliminar acceso a ${isShortcutFolder ? 'la carpeta' : 'la asignatura'}?`
            : `¿Quitar ${isShortcutFolder ? 'carpeta' : 'asignatura'} del manual?`
        : `¿Eliminar ${deleteConfig.type === 'folder' ? 'Carpeta' : 'Asignatura'}?`;

    const description = isShortcut
        ? isUnshareShortcut
            ? `Se eliminará tu acceso a "${deleteConfig.item?.name}". También se quitará este acceso directo de tu manual.`
            : `Se quitará "${deleteConfig.item?.name}" de tu manual. El contenido original no se eliminará.`
        : deleteConfig.type === 'folder'
            ? `Se eliminará la carpeta "${deleteConfig.item?.name}" pero las asignaturas y subcarpetas se moverán al nivel superior.`
            : `Se eliminarán "${deleteConfig.item?.name}" y sus temas.`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {description}
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => setDeleteConfig({ isOpen: false, type: null, item: null })}
                        className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-5 py-2.5 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-xl font-medium flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" /> Sí, Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeDeleteConfirmModal;