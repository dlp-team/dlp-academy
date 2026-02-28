// src/pages/Home/components/HomeDeleteConfirmModal.jsx
import React from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { OVERLAY_TOP_OFFSET_STYLE } from '../../../utils/layoutConstants';

const HomeDeleteConfirmModal = ({ deleteConfig, setDeleteConfig, handleDelete }) => {
    if (!deleteConfig.isOpen) return null;

    const isShortcutSubject = deleteConfig.type === 'shortcut-subject';
    const isShortcutFolder = deleteConfig.type === 'shortcut-folder';
    const isShortcut = isShortcutSubject || isShortcutFolder;
    const isUnshareShortcut = isShortcut && deleteConfig.action === 'unshare';
    const isUnhideShortcut = isShortcut && deleteConfig.action === 'unhide';
    const isDeleteShortcut = isShortcut && deleteConfig.action === 'deleteShortcut';
    const isManualVisibilityAction = isShortcut && !isUnshareShortcut && !isDeleteShortcut;

    const accent = isManualVisibilityAction
        ? {
            circleBg: 'bg-amber-100 dark:bg-amber-900/30',
            iconColor: 'text-amber-600 dark:text-amber-400',
            buttonBg: 'bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-600'
        }
        : {
            circleBg: 'bg-red-100 dark:bg-red-900/30',
            iconColor: 'text-red-600 dark:text-red-400',
            buttonBg: 'bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600'
        };

    const ActionIcon = isUnhideShortcut ? RotateCcw : Trash2;

    const title = isShortcut
        ? isUnshareShortcut
            ? `¿Eliminar ${isShortcutFolder ? 'carpeta' : 'asignatura'}?`
            : isDeleteShortcut
                ? `¿Eliminar este acceso directo?`
            : isUnhideShortcut
                ? `¿Mostrar ${isShortcutFolder ? 'carpeta' : 'asignatura'} en la sección manual?`
                : `¿Quitar ${isShortcutFolder ? 'carpeta' : 'asignatura'} de la sección manual?`
        : `¿Eliminar ${deleteConfig.type === 'folder' ? 'Carpeta' : 'Asignatura'}?`;

    const description = isShortcut
        ? isUnshareShortcut
            ? `No se eliminará el contenido original. Se quitará tu acceso a "${deleteConfig.item?.name}" y ya no podrás acceder a sus archivos.`
            : isDeleteShortcut
                ? `Se eliminará este acceso directo de tu cuenta.`
            : isUnhideShortcut
                ? `"${deleteConfig.item?.name}" volverá a mostrarse en tu sección manual.`
                : `Se ocultará "${deleteConfig.item?.name}" en tu sección manual. Seguirá visible en otras vistas.`
        : deleteConfig.type === 'folder'
            ? `Se eliminará la carpeta "${deleteConfig.item?.name}" pero las asignaturas y subcarpetas se moverán al nivel superior.`
            : `Se eliminarán "${deleteConfig.item?.name}" y sus temas.`;

    const confirmLabel = isShortcut
        ? isUnshareShortcut
            ? 'Sí, eliminar'
            : isDeleteShortcut
                ? 'Sí, eliminar acceso directo'
            : isUnhideShortcut
                ? 'Sí, mostrar'
                : 'Sí, ocultar'
        : 'Sí, Eliminar';

    const onClose = () => setDeleteConfig({ isOpen: false, type: null, item: null });

    return (
        <div className="fixed inset-0 z-50" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 dark:bg-black/70 transition-colors" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4" style={OVERLAY_TOP_OFFSET_STYLE}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md max-h-[calc(100vh-10rem)] overflow-y-auto shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors" onClick={(e) => e.stopPropagation()}>
                <div className={`w-16 h-16 ${accent.circleBg} rounded-full flex items-center justify-center mx-auto mb-4 transition-colors`}>
                    <ActionIcon className={`w-8 h-8 ${accent.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {description}
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleDelete}
                        className={`px-5 py-2.5 ${accent.buttonBg} text-white rounded-xl font-medium flex items-center gap-2 transition-colors cursor-pointer`}
                    >
                        <ActionIcon className="w-4 h-4" /> {confirmLabel}
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
};

export default HomeDeleteConfirmModal;