// src/pages/Topic/components/TopicAssignmentsSection.jsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
    CalendarDays,
    Eye,
    EyeOff,
    Plus,
    Trash2,
    Clock3,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    where
} from 'firebase/firestore';
import { db } from '../../../firebase/config';

const TopicAssignmentsSection = ({
    assignments = [],
    topicId,
    subjectId,
    user,
    permissions
}) => {
    const isStudent = user?.role === 'student';
    const canManage = Boolean(permissions?.canEdit) && !isStudent;
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [submissionsByAssignment, setSubmissionsByAssignment] = useState({});
    const [submissionCountByAssignment, setSubmissionCountByAssignment] = useState({});
    const createPanelRef = useRef(null);
    const titleInputRef = useRef(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueAt: '',
        visibleToStudents: true,
        allowLateDelivery: false
    });

    const sortedAssignments = useMemo(() => {
        const list = [...assignments];
        return list.sort((a, b) => {
            const aDate = a?.dueAt?.toDate ? a.dueAt.toDate() : a?.dueAt ? new Date(a.dueAt) : null;
            const bDate = b?.dueAt?.toDate ? b.dueAt.toDate() : b?.dueAt ? new Date(b.dueAt) : null;
            if (!aDate && !bDate) return 0;
            if (!aDate) return 1;
            if (!bDate) return -1;
            return aDate - bDate;
        });
    }, [assignments]);

    const visibleAssignments = useMemo(() => {
        if (canManage) return sortedAssignments;
        return sortedAssignments.filter((assignment) => assignment.visibleToStudents !== false);
    }, [sortedAssignments, canManage]);

    useEffect(() => {
        if (!topicId || !user?.uid) return undefined;

        if (canManage) {
            const allSubmissionsQuery = query(
                collection(db, 'topicAssignmentSubmissions'),
                where('topicId', '==', topicId)
            );

            const unsubscribe = onSnapshot(allSubmissionsQuery, (snapshot) => {
                const counts = {};
                snapshot.forEach((submissionDoc) => {
                    const data = submissionDoc.data();
                    if (!data?.assignmentId) return;
                    counts[data.assignmentId] = (counts[data.assignmentId] || 0) + 1;
                });
                setSubmissionCountByAssignment(counts);
            });

            return () => unsubscribe();
        }

        const mySubmissionsQuery = query(
            collection(db, 'topicAssignmentSubmissions'),
            where('topicId', '==', topicId),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(mySubmissionsQuery, (snapshot) => {
            const map = {};
            snapshot.forEach((submissionDoc) => {
                const data = submissionDoc.data();
                if (!data?.assignmentId) return;
                map[data.assignmentId] = { id: submissionDoc.id, ...data };
            });
            setSubmissionsByAssignment(map);
        });

        return () => unsubscribe();
    }, [topicId, user?.uid, canManage]);

    useEffect(() => {
        if (!canManage) return undefined;

        const handleCreateRequested = () => {
            createPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.setTimeout(() => titleInputRef.current?.focus(), 180);
        };

        window.addEventListener('topic-assignments-create-requested', handleCreateRequested);
        return () => window.removeEventListener('topic-assignments-create-requested', handleCreateRequested);
    }, [canManage]);

    const toDateObject = (value) => {
        if (!value) return null;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const formatDueDate = (dueAt) => {
        if (!dueAt) return 'Sin fecha limite';
        const date = dueAt?.toDate ? dueAt.toDate() : new Date(dueAt);
        if (Number.isNaN(date.getTime())) return 'Sin fecha limite';
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getAssignmentStatus = (assignment) => {
        const dueDate = assignment?.dueAt?.toDate ? assignment.dueAt.toDate() : assignment?.dueAt ? new Date(assignment.dueAt) : null;
        if (!dueDate || Number.isNaN(dueDate.getTime())) return { label: 'Abierta', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300' };

        const now = new Date();
        const expired = now > dueDate;

        if (!expired) {
            return { label: 'En plazo', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300' };
        }

        if (assignment.allowLateDelivery) {
            return { label: 'Fuera de plazo (admite entrega)', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300' };
        }

        return { label: 'Cerrada', className: 'bg-red-100 text-red-700 dark:bg-red-900/25 dark:text-red-300' };
    };

    const resetFeedback = () => setFeedback({ type: '', message: '' });

    const createAssignment = async () => {
        if (!canManage) return;
        if (!formData.title.trim()) {
            setFeedback({ type: 'error', message: 'Escribe un titulo para la tarea.' });
            return;
        }

        setSaving(true);
        resetFeedback();
        try {
            await addDoc(collection(db, 'topicAssignments'), {
                title: formData.title.trim(),
                description: formData.description.trim(),
                dueAt: toDateObject(formData.dueAt),
                visibleToStudents: Boolean(formData.visibleToStudents),
                allowLateDelivery: Boolean(formData.allowLateDelivery),
                topicId,
                subjectId,
                institutionId: user?.institutionId || null,
                createdBy: user?.uid || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            setFormData({
                title: '',
                description: '',
                dueAt: '',
                visibleToStudents: true,
                allowLateDelivery: false
            });
            setFeedback({ type: 'success', message: 'Tarea creada correctamente.' });
        } catch (error) {
            console.error(error);
            setFeedback({ type: 'error', message: 'No se pudo crear la tarea.' });
        } finally {
            setSaving(false);
        }
    };

    const updateAssignmentFlag = async (assignmentId, patch) => {
        try {
            await setDoc(doc(db, 'topicAssignments', assignmentId), {
                ...patch,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error(error);
            setFeedback({ type: 'error', message: 'No se pudo actualizar la tarea.' });
        }
    };

    const deleteAssignment = async (assignmentId) => {
        if (!canManage) return;
        try {
            await deleteDoc(doc(db, 'topicAssignments', assignmentId));
        } catch (error) {
            console.error(error);
            setFeedback({ type: 'error', message: 'No se pudo eliminar la tarea.' });
        }
    };

    const toggleStudentDelivery = async (assignment) => {
        if (canManage) return;
        const dueDate = assignment?.dueAt?.toDate ? assignment.dueAt.toDate() : assignment?.dueAt ? new Date(assignment.dueAt) : null;
        const expired = dueDate && !Number.isNaN(dueDate.getTime()) ? new Date() > dueDate : false;
        if (expired && !assignment.allowLateDelivery) {
            setFeedback({ type: 'error', message: 'La fecha limite ya paso y no admite entregas fuera de plazo.' });
            return;
        }

        const key = `${assignment.id}_${user.uid}`;
        const existing = submissionsByAssignment[assignment.id];
        const nextDelivered = !existing?.delivered;

        try {
            await setDoc(doc(db, 'topicAssignmentSubmissions', key), {
                assignmentId: assignment.id,
                topicId,
                subjectId,
                userId: user.uid,
                delivered: nextDelivered,
                deliveredAt: nextDelivered ? serverTimestamp() : null,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error(error);
            setFeedback({ type: 'error', message: 'No se pudo actualizar tu estado de entrega.' });
        }
    };

    return (
        <div className="space-y-6">
            {canManage && (
                <div ref={createPanelRef} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4 mb-5">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-500 mb-1">Gestion de tareas</p>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Nueva tarea del tema</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            ref={titleInputRef}
                            type="text"
                            value={formData.title}
                            onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                            placeholder="Titulo de la tarea"
                            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200"
                        />
                        <input
                            type="datetime-local"
                            value={formData.dueAt}
                            onChange={(event) => setFormData((prev) => ({ ...prev, dueAt: event.target.value }))}
                            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200"
                        />
                    </div>

                    <textarea
                        value={formData.description}
                        onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                        placeholder="Indicaciones para el alumno"
                        rows={3}
                        className="mt-3 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200"
                    />

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, visibleToStudents: !prev.visibleToStudents }))}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border ${formData.visibleToStudents ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300' : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
                        >
                            {formData.visibleToStudents ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            {formData.visibleToStudents ? 'Visible para estudiantes' : 'Oculta para estudiantes'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, allowLateDelivery: !prev.allowLateDelivery }))}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border ${formData.allowLateDelivery ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300' : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
                        >
                            <Clock3 className="w-4 h-4" />
                            {formData.allowLateDelivery ? 'Acepta entrega fuera de plazo' : 'No acepta entrega fuera de plazo'}
                        </button>

                        <button
                            type="button"
                            onClick={createAssignment}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold disabled:opacity-60"
                        >
                            <Plus className="w-4 h-4" />
                            {saving ? 'Guardando...' : 'Crear tarea'}
                        </button>
                    </div>

                    {feedback.message && (
                        <div className={`mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
                            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {feedback.message}
                        </div>
                    )}
                </div>
            )}

            {visibleAssignments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 p-8 text-center">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No hay tareas disponibles en este tema.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleAssignments.map((assignment) => {
                        const status = getAssignmentStatus(assignment);
                        const mine = submissionsByAssignment[assignment.id];
                        const delivered = Boolean(mine?.delivered);

                        return (
                            <article
                                key={assignment.id}
                                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{assignment.title || 'Tarea'}</h4>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${status.className}`}>
                                        {status.label}
                                    </span>
                                </div>

                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 min-h-[2.5rem]">
                                    {assignment.description || 'Sin descripcion.'}
                                </p>

                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
                                    <CalendarDays className="w-4 h-4" />
                                    <span>Entrega: {formatDueDate(assignment.dueAt)}</span>
                                </div>

                                {canManage ? (
                                    <div className="space-y-2">
                                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            Entregas registradas: {submissionCountByAssignment[assignment.id] || 0}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => updateAssignmentFlag(assignment.id, { visibleToStudents: !assignment.visibleToStudents })}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                            >
                                                {assignment.visibleToStudents ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                {assignment.visibleToStudents ? 'Ocultar' : 'Mostrar'}
                                            </button>
                                            <button
                                                onClick={() => updateAssignmentFlag(assignment.id, { allowLateDelivery: !assignment.allowLateDelivery })}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                                            >
                                                <Clock3 className="w-3.5 h-3.5" />
                                                {assignment.allowLateDelivery ? 'Cerrar fuera de plazo' : 'Permitir fuera de plazo'}
                                            </button>
                                            <button
                                                onClick={() => deleteAssignment(assignment.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => toggleStudentDelivery(assignment)}
                                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${delivered ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        {delivered ? 'Marcada como entregada' : 'Marcar como entregada'}
                                    </button>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}

            {!canManage && feedback.message && (
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
                    {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {feedback.message}
                </div>
            )}
        </div>
    );
};

export default TopicAssignmentsSection;
