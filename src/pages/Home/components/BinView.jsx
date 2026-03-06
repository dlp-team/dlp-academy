// src/pages/Home/components/BinView.jsx
import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Loader2, XCircle, Info, ChevronRight, ChevronDown, FileText, BookOpen, CheckSquare } from 'lucide-react';
import { useSubjects } from '../../../hooks/useSubjects';
import SubjectCard from '../../../components/modules/SubjectCard/SubjectCard';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';

const DAYS_UNTIL_AUTO_DELETE = 15;

const BinView = ({ user, cardScale = 100 }) => {
    const [trashedSubjects, setTrashedSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [descriptionModal, setDescriptionModal] = useState(null);
    const [loadingDescription, setLoadingDescription] = useState(false);
    const [expandedTopics, setExpandedTopics] = useState({});
    
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

    const handleShowDescription = async (subject) => {
        setLoadingDescription(true);
        setDescriptionModal({ subject, topics: [] });
        
        try {
            // Fetch topics for this subject
            const topicsQuery = query(
                collection(db, 'topics'),
                where('subjectId', '==', subject.id)
            );
            const topicsSnapshot = await getDocs(topicsQuery);
            
            const topicsWithDetails = await Promise.all(
                topicsSnapshot.docs.map(async (topicDoc) => {
                    const topicData = { id: topicDoc.id, ...topicDoc.data() };
                    
                    // Fetch documents for this topic
                    const documentsQuery = query(
                        collection(db, 'documents'),
                        where('topicId', '==', topicDoc.id)
                    );
                    const documentsSnapshot = await getDocs(documentsQuery);
                    topicData.documents = documentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    
                    // Fetch quizzes for this topic
                    const quizzesQuery = query(
                        collection(db, 'quizzes'),
                        where('topicId', '==', topicDoc.id)
                    );
                    const quizzesSnapshot = await getDocs(quizzesQuery);
                    topicData.quizzes = quizzesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    
                    return topicData;
                })
            );
            
            // Sort topics by order
            topicsWithDetails.sort((a, b) => (a.order || 0) - (b.order || 0));
            
            setDescriptionModal({ subject, topics: topicsWithDetails });
        } catch (error) {
            console.error('Error loading description:', error);
            setErrorMessage('Error al cargar la descripción del elemento.');
            setDescriptionModal(null);
        } finally {
            setLoadingDescription(false);
        }
    };

    const toggleTopic = (topicId) => {
        setExpandedTopics(prev => ({
            ...prev,
            [topicId]: !prev[topicId]
        }));
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

                    const isHovered = hoveredCard === subject.id;

                    return (
                        <div 
                            key={subject.id} 
                            className="relative"
                            onMouseEnter={() => setHoveredCard(subject.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Subject Card - visible by default */}
                            <div className={`transition-opacity duration-200 ${isHovered ? 'opacity-40' : 'opacity-100'}`}>
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

                            {/* Action Buttons Overlay - only visible on hover */}
                            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl p-4 transition-all duration-200 ${
                                isHovered 
                                    ? 'bg-black/60 backdrop-blur-sm opacity-100 pointer-events-auto' 
                                    : 'opacity-0 pointer-events-none'
                            }`}>
                                {/* Days Remaining Badge */}
                                {daysRemaining > 0 && (
                                    <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                        {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'} restantes
                                    </div>
                                )}

                                {/* Trashed Date */}
                                {trashedDate && (
                                    <p className="text-xs text-white/90 font-medium">
                                        Eliminada: {trashedDate.toLocaleDateString()}
                                    </p>
                                )}

                                <div className="flex flex-col gap-2 w-full max-w-xs">
                                    {/* Description Button */}
                                    <button
                                        onClick={() => handleShowDescription(subject)}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <Info size={18} />
                                        <span>Ver Contenido</span>
                                    </button>

                                    <div className="flex gap-2">
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
                                                    <span className="hidden sm:inline">Restaurar</span>
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
                        </div>
                    );
                })}
            </div>

            {/* Description Modal */}
            {descriptionModal && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setDescriptionModal(null)}>
                    <div 
                        className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <Info className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {descriptionModal.subject.name}
                                    </h3>
                                    <p className="text-blue-100 text-sm">
                                        Contenido de la asignatura
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDescriptionModal(null)}
                                className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-colors"
                            >
                                <XCircle className="text-white" size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                            {loadingDescription ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-blue-600" size={32} />
                                </div>
                            ) : descriptionModal.topics.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                                    <p className="font-medium">No hay temas en esta asignatura</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {descriptionModal.topics.map((topic, index) => {
                                        const isExpanded = expandedTopics[topic.id];
                                        const hasDocuments = topic.documents?.length > 0;
                                        const hasQuizzes = topic.quizzes?.length > 0;
                                        const hasContent = hasDocuments || hasQuizzes;

                                        return (
                                            <div 
                                                key={topic.id}
                                                className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden"
                                            >
                                                {/* Topic Header */}
                                                <button
                                                    onClick={() => toggleTopic(topic.id)}
                                                    className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-900/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                                                            {topic.number || index + 1}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                            {topic.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                            {topic.documents?.length || 0} documentos, {topic.quizzes?.length || 0} cuestionarios
                                                        </p>
                                                    </div>
                                                    {hasContent && (
                                                        <div className="flex-shrink-0">
                                                            {isExpanded ? (
                                                                <ChevronDown className="text-gray-400" size={20} />
                                                            ) : (
                                                                <ChevronRight className="text-gray-400" size={20} />
                                                            )}
                                                        </div>
                                                    )}
                                                </button>

                                                {/* Topic Content - Expanded */}
                                                {isExpanded && hasContent && (
                                                    <div className="p-4 bg-white dark:bg-slate-900 space-y-4">
                                                        {/* Documents */}
                                                        {hasDocuments && (
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <FileText className="text-gray-400" size={16} />
                                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                        Documentos ({topic.documents.length})
                                                                    </h4>
                                                                </div>
                                                                <div className="space-y-1 pl-6">
                                                                    {topic.documents.map((doc) => (
                                                                        <div 
                                                                            key={doc.id}
                                                                            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 py-1"
                                                                        >
                                                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                                                            <span>{doc.name || 'Documento sin nombre'}</span>
                                                                            {doc.type && (
                                                                                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded">
                                                                                    {doc.type}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Quizzes */}
                                                        {hasQuizzes && (
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <CheckSquare className="text-gray-400" size={16} />
                                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                        Cuestionarios ({topic.quizzes.length})
                                                                    </h4>
                                                                </div>
                                                                <div className="space-y-1 pl-6">
                                                                    {topic.quizzes.map((quiz) => (
                                                                        <div 
                                                                            key={quiz.id}
                                                                            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 py-1"
                                                                        >
                                                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                                                            <span>{quiz.title || 'Cuestionario sin título'}</span>
                                                                            {quiz.questions && (
                                                                                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                                                                    {quiz.questions.length} preguntas
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
