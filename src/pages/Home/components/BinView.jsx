// src/pages/Home/components/BinView.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Trash2, Loader2, XCircle } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import ListViewItem from '../../../components/modules/ListViewItem';
import { db } from '../../../firebase/config';
import { useSubjects } from '../../../hooks/useSubjects';
import { getRemainingMs, getDaysRemaining, getDaysRemainingTextClass, toJsDate } from '../utils/binViewUtils';

import BinGridItem          from './bin/BinGridItem';
import BinSelectionOverlay  from './bin/BinSelectionOverlay';
import BinDescriptionModal  from './bin/BinDescriptionModal';
import { DeleteConfirmModal, EmptyBinConfirmModal } from './bin/BinConfirmModals';

// ─────────────────────────────────────────────────────────────────────────────

const BinView = ({ user, cardScale = 100, layoutMode = 'grid' }) => {
    const isStudent = user?.role === 'student';

    const [trashedSubjects,   setTrashedSubjects]   = useState([]);
    const [loading,           setLoading]           = useState(true);
    const [actionLoading,     setActionLoading]     = useState(null);
    const [deleteConfirm,     setDeleteConfirm]     = useState(null);
    const [emptyConfirmOpen,  setEmptyConfirmOpen]  = useState(false);
    const [errorMessage,      setErrorMessage]      = useState(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [descriptionModal,  setDescriptionModal]  = useState(null);
    const [loadingDescription,setLoadingDescription]= useState(false);
    const [expandedTopics,    setExpandedTopics]    = useState({});

    const selectedCardRef = useRef(null);

    const { getTrashedSubjects, restoreSubject, permanentlyDeleteSubject } = useSubjects(isStudent ? null : user);

    const selectedSubject = useMemo(
        () => trashedSubjects.find(s => s.id === selectedSubjectId) ?? null,
        [trashedSubjects, selectedSubjectId]
    );

    const loadTrashedItems = async () => {
        if (isStudent) {
            setTrashedSubjects([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const items = await getTrashedSubjects();
            const now   = new Date();
            const sorted = [...items].sort((a, b) => getRemainingMs(a, now) - getRemainingMs(b, now));
            setTrashedSubjects(sorted);

            if (selectedSubjectId && !sorted.some(s => s.id === selectedSubjectId)) {
                setSelectedSubjectId(null);
            }
        } catch (err) {
            console.error('Error loading trashed items:', err);
            setErrorMessage('Error al cargar los elementos de la papelera. Por favor, intenta mas tarde.');
        } finally {
            setLoading(false);
        }
    };

    // ── Data loading ───────────────────────────────────────────────────────────
    useEffect(() => {
        loadTrashedItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, isStudent]);

    // ── Action handlers ────────────────────────────────────────────────────────
    const handleRestore = async (subjectId) => {
        setActionLoading(subjectId);
        setErrorMessage(null);
        try {
            await restoreSubject(subjectId);
            if (selectedSubjectId === subjectId) setSelectedSubjectId(null);
            await loadTrashedItems();
        } catch (err) {
            console.error('Error restoring subject:', err);
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
        } catch (err) {
            console.error('Error permanently deleting subject:', err);
            const isPermErr = err?.code === 'permission-denied'
                || err?.message?.includes('permission')
                || err?.message?.includes('insufficient');
            setErrorMessage(isPermErr
                ? 'No tienes permisos para eliminar algunos elementos relacionados. Intenta vaciar la papelera completa o contacta al administrador.'
                : 'Error al eliminar la asignatura. Por favor, intenta mas tarde.'
            );
            setDeleteConfirm(null);
        } finally {
            setActionLoading(null);
        }
    };

    const handleEmptyBin = async () => {
        setLoading(true);
        setErrorMessage(null);
        try {
            const results  = await Promise.allSettled(
                trashedSubjects.map(s => permanentlyDeleteSubject(s.id))
            );
            const failures = results.filter(r => r.status === 'rejected');
            if (failures.length > 0) {
                setErrorMessage(`Se eliminaron ${results.length - failures.length} de ${results.length} elementos. Algunos fallaron por permisos insuficientes.`);
            }
            setSelectedSubjectId(null);
            await loadTrashedItems();
            setEmptyConfirmOpen(false);
        } catch (err) {
            console.error('Error emptying bin:', err);
            setErrorMessage('Error al vaciar la papelera. Por favor, intenta mas tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleShowDescription = async (subject) => {
        setLoadingDescription(true);
        setDescriptionModal({ subject, topics: [] });
        try {
            const topicsSnap = await getDocs(
                query(collection(db, 'topics'), where('subjectId', '==', subject.id))
            );
            const topicsWithDetails = await Promise.all(
                topicsSnap.docs.map(async (topicDoc) => {
                    const topicData = { id: topicDoc.id, ...topicDoc.data() };

                    const [docsSnap, quizzesSnap] = await Promise.all([
                        getDocs(query(collection(db, 'documents'), where('topicId', '==', topicDoc.id))),
                        getDocs(query(collection(db, 'quizzes'),   where('topicId', '==', topicDoc.id))),
                    ]);

                    topicData.documents = docsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                    topicData.quizzes   = quizzesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                    return topicData;
                })
            );
            topicsWithDetails.sort((a, b) => (a.order || 0) - (b.order || 0));
            setDescriptionModal({ subject, topics: topicsWithDetails });
        } catch (err) {
            console.error('Error loading description:', err);
            setErrorMessage('Error al cargar la descripcion del elemento.');
            setDescriptionModal(null);
        } finally {
            setLoadingDescription(false);
        }
    };

    const toggleTopic = (topicId) =>
        setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));

    const handleSelectSubject = (id) =>
        setSelectedSubjectId(prev => (prev === id ? null : id));

    // Restrict access for students
    if (isStudent) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-16">
                <XCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-2">Acceso denegado</h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg">La papelera no está disponible para alumnos.</p>
            </div>
        );
    }

    // ── Early returns ──────────────────────────────────────────────────────────
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

    const gridStyle = {
        gridTemplateColumns: `repeat(auto-fill, minmax(${(320 * cardScale) / 100}px, 1fr))`
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4">

            {/* Error banner */}
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

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Papelera ({trashedSubjects.length})
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Ordenado por urgencia: menos tiempo restante primero
                    </p>
                </div>
                <button
                    onClick={() => setEmptyConfirmOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                    <Trash2 size={16} />
                    Vaciar papelera
                </button>
            </div>

            {/* Grid / List */}
            {layoutMode === 'grid' ? (
                <div className="grid gap-6" style={gridStyle}>
                    {trashedSubjects.map((subject) => {
                        const isSelected  = selectedSubjectId === subject.id;
                        const hasSelection = Boolean(selectedSubjectId);

                        return (
                            <BinGridItem
                                key={subject.id}
                                ref={isSelected ? selectedCardRef : null}
                                subject={subject}
                                user={user}
                                cardScale={cardScale}
                                isSelected={isSelected}
                                hasSelection={hasSelection}
                                onSelect={() => handleSelectSubject(subject.id)}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="space-y-2">
                    {trashedSubjects.map((subject) => {
                        const isSelected   = selectedSubjectId === subject.id;
                        const daysRemaining = getDaysRemaining(subject);
                        const trashedDate   = toJsDate(subject.trashedAt);

                        return (
                            <div
                                key={subject.id}
                                className={`rounded-xl transition-all ${isSelected ? 'ring-2 ring-blue-400 bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                            >
                                <ListViewItem
                                    user={user}
                                    item={subject}
                                    type="subject"
                                    onNavigateSubject={() => handleSelectSubject(subject.id)}
                                    onEdit={() => {}}
                                    onDelete={() => {}}
                                    onShare={() => {}}
                                    draggable={false}
                                    cardScale={cardScale}
                                    onDropAction={() => {}}
                                    allFolders={[]}
                                    allSubjects={trashedSubjects}
                                    disableAllActions={true}
                                />
                                <div className="px-3 pb-2">
                                    <p className={`text-xs font-semibold ${getDaysRemainingTextClass(daysRemaining)}`}>
                                        {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} restantes
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Eliminada: {trashedDate ? trashedDate.toLocaleDateString() : 'Fecha no disponible'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Selection overlay (grid mode) ────────────────────────────────── */}
            {selectedSubject && layoutMode === 'grid' && (
                <BinSelectionOverlay
                    subject={selectedSubject}
                    selectedCardRef={selectedCardRef}
                    actionLoading={actionLoading}
                    onClose={() => setSelectedSubjectId(null)}
                    onShowDescription={handleShowDescription}
                    onRestore={handleRestore}
                    onDeleteConfirm={setDeleteConfirm}
                >
                    {/* Re-render the card inside the overlay so it sits above the dim */}
                    <BinGridItem
                        subject={selectedSubject}
                        user={user}
                        cardScale={cardScale}
                        isSelected={true}
                        hasSelection={false}
                        onSelect={() => setSelectedSubjectId(null)}
                    />
                </BinSelectionOverlay>
            )}

            {/* List-mode inline panel (below the list, unchanged) */}
            {selectedSubject && layoutMode !== 'grid' && (
                <aside className="mt-4 h-fit rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-4">
                    <div className="space-y-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Elemento seleccionado</p>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedSubject.name}</h4>
                        <div className="space-y-2">
                            <button onClick={() => handleShowDescription(selectedSubject)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all">
                                Ver contenido
                            </button>
                            <button onClick={() => handleRestore(selectedSubject.id)}
                                disabled={actionLoading === selectedSubject.id}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all">
                                {actionLoading === selectedSubject.id ? <Loader2 className="animate-spin" size={18} /> : 'Restaurar'}
                            </button>
                            <button onClick={() => setDeleteConfirm(selectedSubject.id)}
                                disabled={actionLoading === selectedSubject.id}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all">
                                Eliminar permanentemente
                            </button>
                        </div>
                    </div>
                </aside>
            )}

            {/* ── Modals ──────────────────────────────────────────────────────── */}
            <BinDescriptionModal
                descriptionModal={descriptionModal}
                loadingDescription={loadingDescription}
                expandedTopics={expandedTopics}
                onClose={() => setDescriptionModal(null)}
                onToggleTopic={toggleTopic}
            />

            {deleteConfirm && (
                <DeleteConfirmModal
                    subjectId={deleteConfirm}
                    actionLoading={actionLoading}
                    onConfirm={handlePermanentDelete}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}

            {emptyConfirmOpen && (
                <EmptyBinConfirmModal
                    count={trashedSubjects.length}
                    onConfirm={handleEmptyBin}
                    onCancel={() => setEmptyConfirmOpen(false)}
                />
            )}
        </div>
    );
};

export default BinView;