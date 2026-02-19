// src/components/modals/FolderDeleteModal.jsx
import React from 'react';
import { AlertTriangle, Trash2, FolderOpen, X } from 'lucide-react';

const FolderDeleteModal = ({ isOpen, onClose, onDeleteAll, onDeleteFolderOnly, folderName, itemCount }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 relative">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">
                                Eliminar Carpeta
                            </h3>
                            <p className="text-white/90 text-sm">
                                ¿Qué deseas hacer con el contenido de "{folderName}"?
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                        <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span>
                                Esta carpeta contiene <strong>{itemCount}</strong> {itemCount === 1 ? 'elemento' : 'elementos'}.
                            </span>
                        </p>
                    </div>

                    <div className="space-y-3">
                        {/* Option 1: Delete Everything */}
                        <button
                            onClick={onDeleteAll}
                            className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-700 transition-all group"
                        >
                            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="font-semibold text-red-900 dark:text-red-100">
                                    Eliminar todo
                                </div>
                                <div className="text-xs text-red-700 dark:text-red-300">
                                    Borrar la carpeta y todos sus elementos
                                </div>
                            </div>
                        </button>

                        {/* Option 2: Delete Folder Only */}
                        <button
                            onClick={onDeleteFolderOnly}
                            className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                        >
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="font-semibold text-blue-900 dark:text-blue-100">
                                    Solo eliminar carpeta
                                </div>
                                <div className="text-xs text-blue-700 dark:text-blue-300">
                                    Mover el contenido a la carpeta padre
                                </div>
                            </div>
                        </button>

                        {/* Option 3: Cancel */}
                        <button
                            onClick={onClose}
                            className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all group"
                        >
                            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                    Cancelar
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    No eliminar nada
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FolderDeleteModal;
