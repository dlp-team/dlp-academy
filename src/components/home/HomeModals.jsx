// src/components/home/HomeModals.jsx
import React from 'react';
import { Trash2 } from 'lucide-react';
import SubjectFormModal from '../modals/SubjectFormModal'; // Adjust path
import FolderManager from '../home/FolderManager';         // Adjust path

const HomeModals = ({
    subjectModalConfig, setSubjectModalConfig,
    folderModalConfig, setFolderModalConfig,
    deleteConfig, setDeleteConfig,
    handleSaveSubject,
    handleSaveFolder,
    onShare,
    onUnshare,
    handleDelete,
    currentFolder = null,
    allFolders = []
}) => {
    return (
        <>
            <SubjectFormModal 
                isOpen={subjectModalConfig.isOpen}
                isEditing={subjectModalConfig.isEditing}
                initialData={subjectModalConfig.data}
                onClose={() => setSubjectModalConfig({ ...subjectModalConfig, isOpen: false })}
                onSave={handleSaveSubject}
            />

            <FolderManager
                isOpen={folderModalConfig.isOpen}
                onClose={() => setFolderModalConfig({ ...folderModalConfig, isOpen: false })}
                onSave={handleSaveFolder}
                initialData={folderModalConfig.data}
                isEditing={folderModalConfig.isEditing}
                onShare={onShare}
                onUnshare={onUnshare}
                currentFolder={folderModalConfig.currentFolder || currentFolder}
                allFolders={allFolders}
            />

            {/* Delete Confirmation */}
            {deleteConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                            <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            ¿Eliminar {deleteConfig.type === 'folder' ? 'Carpeta' : 'Asignatura'}?
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {deleteConfig.type === 'folder' 
                                ? `Se eliminará la carpeta "${deleteConfig.item?.name}" pero las asignaturas y subcarpetas se moverán al nivel superior.`
                                : `Se eliminarán "${deleteConfig.item?.name}" y sus temas.`
                            }
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
            )}
        </>
    );
};

export default HomeModals;