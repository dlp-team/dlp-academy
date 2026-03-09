// src/pages/Home/components/BinView.jsx
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
    Trash2,
    RotateCcw,
    AlertTriangle,
    Loader2,
    XCircle,
    Info,
    ChevronRight,
    ChevronDown,
    FileText,
    BookOpen,
    CheckSquare,
    PanelRightClose
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import SubjectCard from '../../../components/modules/SubjectCard/SubjectCard';
import { db } from '../../../firebase/config';
import { useSubjects } from '../../../hooks/useSubjects';

const DAYS_UNTIL_AUTO_DELETE = 15;
const DAY_MS = 24 * 60 * 60 * 1000;

const toJsDate = (timestampLike) => {
    if (!timestampLike) return null;
    if (typeof timestampLike.toDate === 'function') return timestampLike.toDate();
    if (typeof timestampLike?.seconds === 'number') return new Date(timestampLike.seconds * 1000);
    return null;
};

const getRemainingMs = (subject, now = new Date()) => {
    const trashedDate = toJsDate(subject?.trashedAt);
    if (!trashedDate) return DAYS_UNTIL_AUTO_DELETE * DAY_MS;
    const expiresAt = trashedDate.getTime() + (DAYS_UNTIL_AUTO_DELETE * DAY_MS);
    return expiresAt - now.getTime();
};

const getDaysRemaining = (subject) => {
    const remaining = getRemainingMs(subject);
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / DAY_MS);
};

const getDaysRemainingTextClass = (daysRemaining) => {
    if (daysRemaining <= 1) return 'text-red-700 dark:text-red-400';
    if (daysRemaining <= 3) return 'text-orange-700 dark:text-orange-300';
    if (daysRemaining <= 7) return 'text-amber-700 dark:text-amber-300';
    return 'text-emerald-700 dark:text-emerald-300';
};

const BinView = ({ user, cardScale = 100 }) => {
    const [trashedSubjects, setTrashedSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [emptyConfirmOpen, setEmptyConfirmOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [descriptionModal, setDescriptionModal] = useState(null);
    const [loadingDescription, setLoadingDescription] = useState(false);
    const [expandedTopics, setExpandedTopics] = useState({});
    const [panelPlacement, setPanelPlacement] = useState('right');
    const [panelTop, setPanelTop] = useState(0);
    const cardsContainerRef = useRef(null);
    const selectedCardRef = useRef(null);
    // Persist bin tab location
    useEffect(() => {
        if (window && window.location) {
            if (!window.location.hash.includes('bin')) {
                window.location.hash = '#bin';
            }
        }
    }, []);

    const { getTrashedSubjects, restoreSubject, permanentlyDeleteSubject } = useSubjects(user);

    const selectedSubject = useMemo(
        () => trashedSubjects.find(subject => subject.id === selectedSubjectId) || null,
        [trashedSubjects, selectedSubjectId]
    );

    useLayoutEffect(() => {
        if (!selectedSubjectId || !cardsContainerRef.current || !selectedCardRef.current) {
            return;
        }

        const containerRect = cardsContainerRef.current.getBoundingClientRect();
        const selectedRect = selectedCardRef.current.getBoundingClientRect();

        const panelWidth = 360;
        const minGap = 16;
        const spaceLeft = selectedRect.left - containerRect.left;
        const spaceRight = containerRect.right - selectedRect.right;

        let nextPlacement = 'right';
        if (spaceRight >= panelWidth + minGap) {
            nextPlacement = 'right';
        } else if (spaceLeft >= panelWidth + minGap) {
            nextPlacement = 'left';
        } else {
            nextPlacement = spaceRight >= spaceLeft ? 'right' : 'left';
        }

        const relativeTop = selectedRect.top - containerRect.top;
        const clampedTop = Math.max(0, Math.min(relativeTop, cardsContainerRef.current.scrollHeight - 420));

        setPanelPlacement(nextPlacement);
        setPanelTop(clampedTop);
    }, [selectedSubjectId, trashedSubjects.length]);

    useEffect(() => {
        loadTrashedItems();
    }, []);

    const loadTrashedItems = async () => {
        setLoading(true);
        try {
            const items = await getTrashedSubjects();
            const now = new Date();
            const validItems = [];
            const expiredItems = [];

            items.forEach(item => {
                const remainingMs = getRemainingMs(item, now);
                if (remainingMs > 0) {
                    validItems.push(item);
                } else {
                    expiredItems.push(item);
                }
            });

            if (expiredItems.length > 0) {
                await Promise.allSettled(
                    expiredItems.map(item => permanentlyDeleteSubject(item.id))
                );
            }

            // Urgent first: less time left appears first.
            const sortedByUrgency = [...validItems].sort((a, b) => getRemainingMs(a, now) - getRemainingMs(b, now));
            setTrashedSubjects(sortedByUrgency);

            if (selectedSubjectId && !sortedByUrgency.some(item => item.id === selectedSubjectId)) {
                setSelectedSubjectId(null);
            }
        } catch (error) {
            console.error('Error loading trashed items:', error);
            setErrorMessage('Error al cargar los elementos de la papelera. Por favor, intenta mas tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (subjectId) => {
        setActionLoading(subjectId);
        setErrorMessage(null);
        try {
            await restoreSubject(subjectId);
            if (selectedSubjectId === subjectId) setSelectedSubjectId(null);
            await loadTrashedItems();
        } catch (error) {
            console.error('Error restoring subject:', error);
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
            if (selectedSubjectId === subjectId) setSelectedSubjectId(null);
            await loadTrashedItems();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error permanently deleting subject:', error);
            const isPermissionError = error?.code === 'permission-denied'
                || error?.message?.includes('permission')
                || error?.message?.includes('insufficient');

            if (isPermissionError) {
                setErrorMessage('No tienes permisos para eliminar algunos elementos relacionados. Intenta vaciar la papelera completa o contacta al administrador.');
            } else {
                setErrorMessage('Error al eliminar la asignatura. Por favor, intenta mas tarde.');
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
            const topicsQuery = query(
                collection(db, 'topics'),
                where('subjectId', '==', subject.id)
            );
            const topicsSnapshot = await getDocs(topicsQuery);

            const topicsWithDetails = await Promise.all(
                topicsSnapshot.docs.map(async (topicDoc) => {
                    const topicData = { id: topicDoc.id, ...topicDoc.data() };

                    const documentsQuery = query(
                        collection(db, 'documents'),
                        where('topicId', '==', topicDoc.id)
                    );
                    const documentsSnapshot = await getDocs(documentsQuery);
                    topicData.documents = documentsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

                    const quizzesQuery = query(
                        collection(db, 'quizzes'),
                        where('topicId', '==', topicDoc.id)
                    );
                    const quizzesSnapshot = await getDocs(quizzesQuery);
                    topicData.quizzes = quizzesSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

                    return topicData;
                })
            );

            topicsWithDetails.sort((a, b) => (a.order || 0) - (b.order || 0));
            setDescriptionModal({ subject, topics: topicsWithDetails });
        } catch (error) {
            console.error('Error loading description:', error);
            setErrorMessage('Error al cargar la descripcion del elemento.');
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
        setLoading(true);
        setErrorMessage(null);
        try {
            const results = await Promise.allSettled(
                trashedSubjects.map(subject => permanentlyDeleteSubject(subject.id))
            );

            const failures = results.filter(result => result.status === 'rejected');
            if (failures.length > 0) {
                setErrorMessage(`Se eliminaron ${results.length - failures.length} de ${results.length} elementos. Algunos fallaron por permisos insuficientes.`);
            }

            setSelectedSubjectId(null);
            await loadTrashedItems();
            setEmptyConfirmOpen(false);
        } catch (error) {
            console.error('Error emptying bin:', error);
            setErrorMessage('Error al vaciar la papelera. Por favor, intenta mas tarde.');
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
                <p className="text-lg font-medium">La papelera esta vacia</p>
                <p className="text-sm mt-1">Las asignaturas eliminadas apareceran aqui</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {errorMessage && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 mb-4">
                    <XCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">{errorMessage}</p>
                    </div>
                    <button
                        onClick={() => setErrorMessage(null)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                    >
                        <XCircle size={18} />
                    </button>
                </div>
            )}
            <div className="relative" ref={cardsContainerRef}>
                <div className="relative">
                    {selectedSubject && (
                        <div className="absolute inset-0 bg-black/35 rounded-3xl z-10 pointer-events-none" />
                    )}
                    <div
                        className={`grid gap-6 relative z-20 ${
                            selectedSubject
                                ? 'xl:grid-cols-[minmax(0,1fr)_360px]'
                                : `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
                        }`}
                        style={{
                            '--card-scale': cardScale / 100,
                        }}
                    >
                        {trashedSubjects.map((subject) => {
                            const trashedDate = toJsDate(subject.trashedAt);
                            const daysRemaining = getDaysRemaining(subject);
                            const isSelected = selectedSubjectId === subject.id;
                            const hasSelection = Boolean(selectedSubjectId);
                            return (
                                <div
                                    key={subject.id}
                                    ref={isSelected ? selectedCardRef : null}
                                    className={`transition-all duration-200 ${
                                        isSelected
                                            ? 'scale-[1.06] z-30 relative'
                                            : hasSelection
                                                ? 'opacity-45'
                                                : 'hover:scale-[1.02]'
                                    }`}
                                    style={{ transform: `scale(${cardScale / 100})` }}
                                >
                                    <div
                                        className={`rounded-2xl cursor-pointer ${isSelected ? 'ring-4 ring-blue-400/70 shadow-2xl' : ''}`}
                                        onClick={() => setSelectedSubjectId(prev => (prev === subject.id ? null : subject.id))}
                                    >
                                        <SubjectCard
                                            subject={subject}
                                            user={user}
                                            onSelect={() => setSelectedSubjectId(prev => (prev === subject.id ? null : subject.id))}
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
                                    <div className="mt-2 px-1">
                                        <p className={`text-xs font-semibold ${getDaysRemainingTextClass(daysRemaining)}`}>
                                            {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'} restantes
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Eliminada: {trashedDate ? trashedDate.toLocaleDateString() : 'Fecha no disponible'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Side panel for desktop */}
                {selectedSubject && (
                    <aside
                        className={`hidden xl:block absolute z-40 w-[360px] h-fit rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-4 space-y-4 ${panelPlacement === 'left' ? 'left-0' : 'right-0'}`}
                        style={{ top: `${panelTop}px` }}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Elemento seleccionado</p>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                                    {selectedSubject.name}
                                </h4>
                            </div>
                            <button
                                onClick={() => setSelectedSubjectId(null)}
                                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center"
                                title="Cerrar panel"
                            >
                                <PanelRightClose size={16} className="text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 p-3">
                            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                                {getDaysRemaining(selectedSubject)} {getDaysRemaining(selectedSubject) === 1 ? 'día' : 'días'} restantes
                            </p>
                            <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1">
                                Después de ese plazo, se elimina automáticamente.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleShowDescription(selectedSubject)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
                            >
                                <Info size={18} />
                                Ver contenido
                            </button>
                            <button
                                onClick={() => handleRestore(selectedSubject.id)}
                                disabled={actionLoading === selectedSubject.id}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all"
                            >
                                {actionLoading === selectedSubject.id ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        <RotateCcw size={18} />
                                        Restaurar
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(selectedSubject.id)}
                                disabled={actionLoading === selectedSubject.id}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all"
                            >
                                <Trash2 size={18} />
                                Eliminar permanentemente
                            </button>
                        </div>
                    </aside>
                )}
                {/* Side panel for mobile/tablet */}
                {selectedSubject && (
                    <aside className="xl:hidden mt-4 h-fit rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-4 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Elemento seleccionado</p>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                                    {selectedSubject.name}
                                </h4>
                            </div>
                            <button
                                onClick={() => setSelectedSubjectId(null)}
                                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center"
                                title="Cerrar panel"
                            >
                                <PanelRightClose size={16} className="text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 p-3">
                            <p className={`text-sm font-semibold ${getDaysRemainingTextClass(getDaysRemaining(selectedSubject))}`}> 
                                {getDaysRemaining(selectedSubject)} {getDaysRemaining(selectedSubject) === 1 ? 'día' : 'días'} restantes
                            </p>
                            <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1">
                                Después de ese plazo, se elimina automáticamente.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleShowDescription(selectedSubject)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
                            >
                                <Info size={18} />
                                Ver contenido
                            </button>
                            <button
                                onClick={() => handleRestore(selectedSubject.id)}
                                disabled={actionLoading === selectedSubject.id}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all"
                            >
                                {actionLoading === selectedSubject.id ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        <RotateCcw size={18} />
                                        Restaurar
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(selectedSubject.id)}
                                disabled={actionLoading === selectedSubject.id}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all"
                            >
                                <Trash2 size={18} />
                                Eliminar permanentemente
                            </button>
                        </div>
                    </aside>
                )}
            </div>

            {descriptionModal && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setDescriptionModal(null)}>
                    <div
                        className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <Info className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{descriptionModal.subject.name}</h3>
                                    <p className="text-blue-100 text-sm">Contenido de la asignatura</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDescriptionModal(null)}
                                className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-colors"
                            >
                                <XCircle className="text-white" size={20} />
                            </button>
                        </div>

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
                                                        <p className="font-semibold text-gray-900 dark:text-white">{topic.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                            {topic.documents?.length || 0} {topic.documents?.length === 1 ? 'documento' : 'documentos'}, {topic.quizzes?.length || 0} {topic.quizzes?.length === 1 ? 'cuestionario' : 'cuestionarios'}
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

                                                {isExpanded && hasContent && (
                                                    <div className="p-4 bg-white dark:bg-slate-900 space-y-4">
                                                        {hasDocuments && (
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <FileText className="text-gray-400" size={16} />
                                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                        Documentos ({topic.documents.length})
                                                                    </h4>
                                                                </div>
                                                                <div className="space-y-1 pl-6">
                                                                    {topic.documents.map((docItem) => (
                                                                        <div
                                                                            key={docItem.id}
                                                                            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 py-1"
                                                                        >
                                                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                                                            <span>{docItem.name || 'Documento sin nombre'}</span>
                                                                            {docItem.type && (
                                                                                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded">
                                                                                    {docItem.type}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {hasQuizzes && (
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <CheckSquare className="text-gray-400" size={16} />
                                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                        Cuestionarios ({topic.quizzes.length})
                                                                    </h4>
                                                                </div>
                                                                <div className="space-y-1 pl-6">
                                                                    {topic.quizzes.map((quizItem) => (
                                                                        <div
                                                                            key={quizItem.id}
                                                                            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 py-1"
                                                                        >
                                                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                                                            <span>{quizItem.title || 'Cuestionario sin título'}</span>
                                                                            {quizItem.questions && (
                                                                                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                                                                    {quizItem.questions.length} preguntas
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

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
                            <AlertTriangle size={24} />
                            <h3 className="text-xl font-bold">Eliminar Permanentemente</h3>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            Estas seguro de que quieres eliminar permanentemente esta asignatura?
                        </p>

                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                            <p className="text-sm text-red-800 dark:text-red-300 font-medium mb-2">
                                Esta accion no se puede deshacer y eliminara:
                            </p>
                            <ul className="text-sm text-red-700 dark:text-red-400 space-y-1 ml-4">
                                <li>- La asignatura</li>
                                <li>- Todos sus temas</li>
                                <li>- Todos los documentos</li>
                                <li>- Todos los archivos asociados</li>
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

            {emptyConfirmOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
                            <AlertTriangle size={24} />
                            <h3 className="text-xl font-bold">Vaciar Papelera</h3>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            Seguro que deseas eliminar permanentemente los {trashedSubjects.length} elementos de la papelera?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setEmptyConfirmOpen(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEmptyBin}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                            >
                                <Trash2 size={16} />
                                Vaciar Papelera
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BinView;
