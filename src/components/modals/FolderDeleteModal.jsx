// src/components/modals/FolderDeleteModal.jsx
import React, { useState } from 'react';
import { AlertTriangle, Trash2, FolderOpen, X, ArrowLeft } from 'lucide-react';

const FolderDeleteModal = ({ isOpen, onClose, onDeleteAll, onDeleteFolderOnly, folderName, itemCount }) => {
    const [confirmationType, setConfirmationType] = useState(null);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            if (confirmationType) {
                setConfirmationType(null);
            } else {
                onClose();
            }
        }
    };

    const handleConfirmDelete = () => {
        if (confirmationType === 'all') {
            onDeleteAll();
        } else if (confirmationType === 'folderOnly') {
            onDeleteFolderOnly();
        }
        setConfirmationType(null);
    };

    const handleCancel = () => {
        setConfirmationType(null);
    };

    // Confirmation Screen
    if (confirmationType) {
        return (
            <div 
                onClick={handleBackdropClick}
                className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors"
            >
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
                    {/* Confirmation Header */}
                    <div className={`p-6 relative ${confirmationType === 'all' ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'}`}>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleCancel}
                                className="flex-shrink-0 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white">
                                    Confirmar Acción
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Content */}
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${confirmationType === 'all' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                {confirmationType === 'all' ? (
                                    <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                                ) : (
                                    <FolderOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                )}
                            </div>
                            {confirmationType === 'all' ? (
                                <>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        ¿Eliminar todo permanentemente?
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Se eliminará la carpeta <strong>"{folderName}"</strong> {itemCount === 1
                                            ? 'y su elemento'
                                            : <>y todos sus <strong>{itemCount}</strong> elementos</>
                                        }. Esta acción no se puede deshacer.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        ¿Mover contenido al nivel superior?
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        La carpeta <strong>"{folderName}"</strong> se eliminará, {itemCount === 1
                                            ? 'pero su elemento se moverá'
                                            : <>pero sus <strong>{itemCount}</strong> elementos se moverán</>
                                        } a la carpeta anterior.
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-5 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className={`flex-1 px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                                    confirmationType === 'all' 
                                        ? 'bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white' 
                                        : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white'
                                }`}
                            >
                                {confirmationType === 'all' ? (
                                    <>
                                        <Trash2 className="w-4 h-4" /> Sí, Eliminar Todo
                                    </>
                                ) : (
                                    <>
                                        <FolderOpen className="w-4 h-4" /> Sí, Mover Contenido
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main Selection Screen
    return (
        <div 
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors"
        >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 relative">
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
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span>
                                Esta carpeta contiene <strong>{itemCount}</strong> {itemCount === 1 ? 'elemento' : 'elementos'}.
                            </span>
                        </p>
                    </div>

                    <div className="space-y-3">
                        {/* Option 1: Delete Everything */}
                        <button
                            onClick={() => setConfirmationType('all')}
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
                            onClick={() => setConfirmationType('folderOnly')}
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
                                    Mover el contenido a la carpeta anterior
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
