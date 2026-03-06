// src/pages/Home/components/BinView.jsx
import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';
import { useSubjects } from '../../../hooks/useSubjects';

const BinView = ({ user }) => {
    const [trashedSubjects, setTrashedSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    
    const { getTrashedSubjects, restoreSubject, permanentlyDeleteSubject } = useSubjects(user);

    useEffect(() => {
        loadTrashedItems();
    }, []);

    const loadTrashedItems = async () => {
        setLoading(true);
        try {
            const items = await getTrashedSubjects();
            setTrashedSubjects(items);
        } catch (error) {
            console.error("Error loading trashed items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (subjectId) => {
        setActionLoading(subjectId);
        try {
            await restoreSubject(subjectId);
            await loadTrashedItems();
        } catch (error) {
            console.error("Error restoring subject:", error);
            alert("Error al restaurar la asignatura");
        } finally {
            setActionLoading(null);
        }
    };

    const handlePermanentDelete = async (subjectId) => {
        setActionLoading(subjectId);
        try {
            await permanentlyDeleteSubject(subjectId);
            await loadTrashedItems();
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error permanently deleting subject:", error);
            alert("Error al eliminar permanentemente la asignatura");
        } finally {
            setActionLoading(null);
        }
    };

    const handleEmptyBin = async () => {
        if (!window.confirm(`¿Estás seguro de vaciar la papelera? Se eliminarán permanentemente ${trashedSubjects.length} asignatura(s) y todo su contenido (temas, documentos). Esta acción no se puede deshacer.`)) {
            return;
        }

        setLoading(true);
        try {
            await Promise.all(trashedSubjects.map(s => permanentlyDeleteSubject(s.id)));
            await loadTrashedItems();
        } catch (error) {
            console.error("Error emptying bin:", error);
            alert("Error al vaciar la papelera");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    if (trashedSubjects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <Trash2 size={64} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">La papelera está vacía</p>
                <p className="text-sm mt-1">Las asignaturas eliminadas aparecerán aquí</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with Empty Bin button */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Papelera ({trashedSubjects.length})
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Las asignaturas permanecen aquí hasta que las restaures o elimines permanentemente
                    </p>
                </div>
                {trashedSubjects.length > 0 && (
                    <button
                        onClick={handleEmptyBin}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                    >
                        <Trash2 size={16} />
                        Vaciar Papelera
                    </button>
                )}
            </div>

            {/* Trashed Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trashedSubjects.map((subject) => (
                    <div
                        key={subject.id}
                        className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                    {subject.name || 'Sin nombre'}
                                </h4>
                                {subject.course && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {subject.course}
                                    </p>
                                )}
                                {subject.trashedAt && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                        Eliminada: {new Date(subject.trashedAt.seconds * 1000).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {/* Restore Button */}
                            <button
                                onClick={() => handleRestore(subject.id)}
                                disabled={actionLoading === subject.id}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors"
                            >
                                {actionLoading === subject.id ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <RotateCcw size={16} />
                                )}
                                Restaurar
                            </button>

                            {/* Permanent Delete Button */}
                            <button
                                onClick={() => setDeleteConfirm(subject.id)}
                                disabled={actionLoading === subject.id}
                                className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
                            <AlertTriangle size={24} />
                            <h3 className="text-xl font-bold">Eliminar Permanentemente</h3>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            ¿Estás seguro de que quieres eliminar permanentemente esta asignatura?
                        </p>
                        
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                            <p className="text-sm text-red-800 dark:text-red-300 font-medium mb-2">
                                Esta acción no se puede deshacer y eliminará:
                            </p>
                            <ul className="text-sm text-red-700 dark:text-red-400 space-y-1 ml-4">
                                <li>• La asignatura</li>
                                <li>• Todos sus temas</li>
                                <li>• Todos los documentos</li>
                                <li>• Todos los archivos asociados</li>
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handlePermanentDelete(deleteConfirm)}
                                disabled={actionLoading === deleteConfirm}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors"
                            >
                                {actionLoading === deleteConfirm ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <Trash2 size={16} />
                                )}
                                Eliminar Permanentemente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BinView;
