// src/pages/Home/components/BinView.jsx
import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Loader2, XCircle } from 'lucide-react';
import { useSubjects } from '../../../hooks/useSubjects';
import SubjectCard from '../../../components/modules/SubjectCard/SubjectCard';

const DAYS_UNTIL_AUTO_DELETE = 15;

const BinView = ({ user, cardScale = 100 }) => {
    const [trashedSubjects, setTrashedSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    
    const { getTrashedSubjects, restoreSubject, permanentlyDeleteSubject } = useSubjects(user);

    useEffect(() => {
        loadTrashedItems();
    }, []);

    const loadTrashedItems = async () => {
        setLoading(true);
        try {
            const items = await getTrashedSubjects();
            
            // Filter items: only show those trashed within last 15 days
            const now = new Date();
            const fifteenDaysAgo = new Date(now.getTime() - (DAYS_UNTIL_AUTO_DELETE * 24 * 60 * 60 * 1000));
            
            const validItems = [];
            const expiredItems = [];
            
            items.forEach(item => {
                if (!item.trashedAt) {
                    validItems.push(item);
                    return;
                }
                
                const trashedDate = item.trashedAt.toDate ? item.trashedAt.toDate() : new Date(item.trashedAt.seconds * 1000);
                
                if (trashedDate >= fifteenDaysAgo) {
                    validItems.push(item);
                } else {
                    expiredItems.push(item);
                }
            });
            
            // Auto-delete expired items
            if (expiredItems.length > 0) {
                console.log(`Auto-deleting ${expiredItems.length} expired items...`);
                await Promise.allSettled(expiredItems.map(item => 
                    permanentlyDeleteSubject(item.id).catch(err => {
                        console.error(`Failed to auto-delete ${item.id}:`, err);
                    })
                ));
            }
            
            setTrashedSubjects(validItems);
        } catch (error) {
            console.error("Error loading trashed items:", error);
            setErrorMessage('Error al cargar los elementos de la papelera. Por favor, intenta más tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (subjectId) => {
        setActionLoading(subjectId);
        setErrorMessage(null);
        try {
            await restoreSubject(subjectId);
            await loadTrashedItems();
        } catch (error) {
            console.error("Error restoring subject:", error);
            setErrorMessage('No se pudo restaurar la asignatura. Verifica tus permisos e intenta nuevamente.');
        } finally {
            setActionLoading(null);
        }
    };

    const handlePermanentDelete = async (subjectId) => {
        setActionLoading(subjectId);
        setErrorMessage(null);
        try {
            await permanentlyDeleteSubject(subjectId);
            await loadTrashedItems();
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error permanently deleting subject:", error);
            const isPermissionError = error?.code === 'permission-denied' || 
                                     error?.message?.includes('permission') || 
                                     error?.message?.includes('insufficient');
            
            if (isPermissionError) {
                setErrorMessage('No tienes permisos para eliminar algunos elementos relacionados. Intenta vaciar la papelera completa o contacta al administrador.');
            } else {
                setErrorMessage('Error al eliminar la asignatura. Por favor, intenta más tarde.');
            }
            setDeleteConfirm(null);
        } finally {
            setActionLoading(null);
        }
    };

    const handleEmptyBin = async () => {
        if (!window.confirm(`¿Estás seguro de vaciar la papelera? Se eliminarán permanentemente ${trashedSubjects.length} asignatura(s) y todo su contenido (temas, documentos). Esta acción no se puede deshacer.`)) {
            return;
        }

        setLoading(true);
        setErrorMessage(null);
        try {
            const results = await Promise.allSettled(
                trashedSubjects.map(s => permanentlyDeleteSubject(s.id))
            );
            
            const failures = results.filter(r => r.status === 'rejected');
            if (failures.length > 0) {
                console.error('Some deletions failed:', failures);
                setErrorMessage(`Se eliminaron ${results.length - failures.length} de ${results.length} elementos. Algunos fallaron por permisos insuficientes.`);
            }
            
            await loadTrashedItems();
        } catch (error) {
            console.error("Error emptying bin:", error);
            setErrorMessage('Error al vaciar la papelera. Por favor, intenta más tarde.');
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
            {/* Error Message Banner */}
            {errorMessage && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 mb-4">
                    <XCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">
                            {errorMessage}
                        </p>
                    </div>
                    <button
                        onClick={() => setErrorMessage(null)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                    >
                        <XCircle size={18} />
                    </button>
                </div>
            )}

            {/* Header with Empty Bin button */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Papelera ({trashedSubjects.length})
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Los elementos se eliminan automáticamente después de {DAYS_UNTIL_AUTO_DELETE} días
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trashedSubjects.map((subject) => {
                    const trashedDate = subject.trashedAt && subject.trashedAt.toDate 
                        ? subject.trashedAt.toDate() 
                        : subject.trashedAt?.seconds 
                            ? new Date(subject.trashedAt.seconds * 1000)
                            : null;
                    
                    const daysRemaining = trashedDate 
                        ? Math.ceil((DAYS_UNTIL_AUTO_DELETE * 24 * 60 * 60 * 1000 - (new Date() - trashedDate)) / (24 * 60 * 60 * 1000))
                        : DAYS_UNTIL_AUTO_DELETE;

                    return (
                        <div key={subject.id} className="relative">
                            {/* Subject Card with disabled interactions */}
                            <div className="opacity-60 pointer-events-none">
                                <SubjectCard
                                    subject={subject}
                                    user={user}
                                    onSelect={() => {}}
                                    activeMenu={null}
                                    onToggleMenu={() => {}}
                                    onEdit={() => {}}
                                    onDelete={() => {}}
                                    onShare={() => {}}
                                    draggable={false}
                                    cardScale={cardScale}
                                    disableAllActions={true}
                                    onOpenTopics={null}
                                />
                            </div>

                            {/* Action Buttons Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-sm rounded-2xl p-4">
                                {/* Days Remaining Badge */}
                                {daysRemaining > 0 && (
                                    <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                        {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'} restantes
                                    </div>
                                )}

                                {/* Trashed Date */}
                                {trashedDate && (
                                    <p className="text-xs text-white/80 font-medium">
                                        Eliminada: {trashedDate.toLocaleDateString()}
                                    </p>
                                )}

                                <div className="flex gap-2 w-full max-w-xs">
                                    {/* Restore Button */}
                                    <button
                                        onClick={() => handleRestore(subject.id)}
                                        disabled={actionLoading === subject.id}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                                    >
                                        {actionLoading === subject.id ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : (
                                            <>
                                                <RotateCcw size={18} />
                                                <span>Restaurar</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Permanent Delete Button */}
                                    <button
                                        onClick={() => setDeleteConfirm(subject.id)}
                                        disabled={actionLoading === subject.id}
                                        className="flex items-center justify-center px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
                                        title="Eliminar permanentemente"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
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
