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
    AlertCircle,
    Paperclip,
    Upload,
    X,
    FileText
} from 'lucide-react';
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    where
} from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { db, storage } from '../../../firebase/config';

const MAX_ATTACHMENT_COUNT = 5;
const MAX_ATTACHMENT_SIZE_BYTES = 20 * 1024 * 1024;

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
    const [resolvedInstitutionId, setResolvedInstitutionId] = useState(user?.institutionId || null);
    const [instructionFiles, setInstructionFiles] = useState([]);
    const [submissionDraftByAssignment, setSubmissionDraftByAssignment] = useState({});
    const [uploadingAssignmentId, setUploadingAssignmentId] = useState(null);
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
        let cancelled = false;

        const resolveInstitutionId = async () => {
            if (user?.institutionId) {
                setResolvedInstitutionId(user.institutionId);
                return;
            }

            try {
                if (subjectId) {
                    const subjectSnap = await getDoc(doc(db, 'subjects', subjectId));
                    const subjectInstitutionId = subjectSnap.exists() ? (subjectSnap.data()?.institutionId || null) : null;
                    if (!cancelled && subjectInstitutionId) {
                        setResolvedInstitutionId(subjectInstitutionId);
                        return;
                    }
                }

                if (topicId) {
                    const topicSnap = await getDoc(doc(db, 'topics', topicId));
                    const topicInstitutionId = topicSnap.exists() ? (topicSnap.data()?.institutionId || null) : null;
                    if (!cancelled) {
                        setResolvedInstitutionId(topicInstitutionId || null);
                    }
                    return;
                }

                if (!cancelled) {
                    setResolvedInstitutionId(null);
                }
            } catch (error) {
                if (!cancelled) {
                    setResolvedInstitutionId(null);
                }
            }
        };

        resolveInstitutionId();

        return () => {
            cancelled = true;
        };
    }, [user?.institutionId, subjectId, topicId]);

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

    const formatBytes = (bytes) => {
        if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
        if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    };

    const normalizeFileName = (name) => String(name || 'archivo').replace(/[^a-zA-Z0-9._-]/g, '_');

    const mergeFilesWithLimit = (current, incoming) => {
        const accepted = [];
        let rejectedBySize = 0;

        incoming.forEach((file) => {
            if (!file) return;
            if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
                rejectedBySize += 1;
                return;
            }
            accepted.push(file);
        });

        const merged = [...current, ...accepted].slice(0, MAX_ATTACHMENT_COUNT);
        const rejectedByCount = Math.max(0, current.length + accepted.length - MAX_ATTACHMENT_COUNT);

        return { merged, rejectedBySize, rejectedByCount };
    };

    const uploadFilesToStorage = async ({ files, basePath }) => {
        const uploads = files.map(async (file) => {
            const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${normalizeFileName(file.name)}`;
            const path = `${basePath}/${uniqueName}`;
            const fileRef = storageRef(storage, path);
            await uploadBytes(fileRef, file, { contentType: file.type || 'application/octet-stream' });
            const url = await getDownloadURL(fileRef);
            return {
                name: file.name,
                url,
                path,
                size: file.size || 0,
                contentType: file.type || 'application/octet-stream'
            };
        });

        return Promise.all(uploads);
    };

    const notifyRejectedFiles = (rejectedBySize, rejectedByCount) => {
        if (rejectedBySize <= 0 && rejectedByCount <= 0) return;
        const parts = [];
        if (rejectedBySize > 0) parts.push(`${rejectedBySize} archivo(s) superan 20MB`);
        if (rejectedByCount > 0) parts.push(`solo se permiten ${MAX_ATTACHMENT_COUNT} archivos`);
        setFeedback({ type: 'error', message: parts.join(' y ') });
    };

    const handleInstructionFilesSelected = (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        const { merged, rejectedBySize, rejectedByCount } = mergeFilesWithLimit(instructionFiles, files);
        setInstructionFiles(merged);
        notifyRejectedFiles(rejectedBySize, rejectedByCount);
        event.target.value = '';
    };

    const removeInstructionFile = (indexToRemove) => {
        setInstructionFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmissionNoteChange = (assignmentId, value) => {
        setSubmissionDraftByAssignment((prev) => ({
            ...prev,
            [assignmentId]: {
                ...(prev[assignmentId] || {}),
                note: value
            }
        }));
    };

    const handleSubmissionFilesSelected = (assignmentId, event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        const currentFiles = submissionDraftByAssignment[assignmentId]?.files || [];
        const { merged, rejectedBySize, rejectedByCount } = mergeFilesWithLimit(currentFiles, files);

        setSubmissionDraftByAssignment((prev) => ({
            ...prev,
            [assignmentId]: {
                ...(prev[assignmentId] || {}),
                files: merged
            }
        }));

        notifyRejectedFiles(rejectedBySize, rejectedByCount);
        event.target.value = '';
    };

    const removeSubmissionFile = (assignmentId, indexToRemove) => {
        setSubmissionDraftByAssignment((prev) => ({
            ...prev,
            [assignmentId]: {
                ...(prev[assignmentId] || {}),
                files: (prev[assignmentId]?.files || []).filter((_, index) => index !== indexToRemove)
            }
        }));
    };

    const createAssignment = async () => {
        if (!canManage) return;
        if (!formData.title.trim()) {
            setFeedback({ type: 'error', message: 'Escribe un titulo para la tarea.' });
            return;
        }
        if (!resolvedInstitutionId) {
            setFeedback({ type: 'error', message: 'No se pudo resolver la institucion de la tarea. Recarga e intentalo de nuevo.' });
            return;
        }

        setSaving(true);
        resetFeedback();
        try {
            const assignmentRef = doc(collection(db, 'topicAssignments'));
            const uploadedInstructionFiles = instructionFiles.length
                ? await uploadFilesToStorage({
                    files: instructionFiles,
                    basePath: `topic-assignments/instructions/${topicId}/${assignmentRef.id}`
                })
                : [];

            await setDoc(assignmentRef, {
                title: formData.title.trim(),
                description: formData.description.trim(),
                dueAt: toDateObject(formData.dueAt),
                visibleToStudents: Boolean(formData.visibleToStudents),
                allowLateDelivery: Boolean(formData.allowLateDelivery),
                instructionFiles: uploadedInstructionFiles,
                topicId,
                subjectId,
                institutionId: resolvedInstitutionId,
                ownerId: user?.uid || null,
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
            setInstructionFiles([]);
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
        const draft = submissionDraftByAssignment[assignment.id] || {};
        const selectedFiles = draft.files || [];
        const note = (draft.note || '').trim();
        const nextDelivered = !existing?.delivered;

        try {
            setUploadingAssignmentId(assignment.id);
            const uploadedSubmissionFiles = nextDelivered && selectedFiles.length
                ? await uploadFilesToStorage({
                    files: selectedFiles,
                    basePath: `topic-assignments/submissions/${topicId}/${assignment.id}/${user.uid}`
                })
                : (nextDelivered ? (existing?.submissionFiles || []) : []);

            await setDoc(doc(db, 'topicAssignmentSubmissions', key), {
                assignmentId: assignment.id,
                topicId,
                subjectId,
                institutionId: resolvedInstitutionId || null,
                userId: user.uid,
                delivered: nextDelivered,
                deliveredAt: nextDelivered ? serverTimestamp() : null,
                note: nextDelivered ? note : '',
                submissionFiles: nextDelivered ? uploadedSubmissionFiles : [],
                updatedAt: serverTimestamp()
            }, { merge: true });

            setSubmissionDraftByAssignment((prev) => ({
                ...prev,
                [assignment.id]: { note: '', files: [] }
            }));
        } catch (error) {
            console.error(error);
            setFeedback({ type: 'error', message: 'No se pudo actualizar tu estado de entrega.' });
        } finally {
            setUploadingAssignmentId(null);
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

                    <div className="mt-3 space-y-2">
                        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                            <Paperclip className="w-4 h-4" />
                            Adjuntar archivos de instrucciones
                            <input
                                type="file"
                                multiple
                                onChange={handleInstructionFilesSelected}
                                className="hidden"
                            />
                        </label>
                        {instructionFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {instructionFiles.map((file, index) => (
                                    <div key={`${file.name}-${index}`} className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span className="max-w-[14rem] truncate">{file.name}</span>
                                        <span className="text-slate-400">{formatBytes(file.size)}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeInstructionFile(index)}
                                            className="text-slate-500 hover:text-red-500"
                                            aria-label="Quitar archivo"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Maximo {MAX_ATTACHMENT_COUNT} archivos de 20MB por tarea.</p>
                    </div>

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

                                {(assignment.instructionFiles || []).length > 0 && (
                                    <div className="mb-4 space-y-2">
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Archivos de instrucciones</p>
                                        <div className="space-y-1.5">
                                            {assignment.instructionFiles.map((file, index) => (
                                                <a
                                                    key={`${assignment.id}-instruction-file-${index}`}
                                                    href={file?.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:underline"
                                                >
                                                    <Paperclip className="w-3.5 h-3.5" />
                                                    <span className="max-w-[14rem] truncate">{file?.name || `Archivo ${index + 1}`}</span>
                                                    {Number.isFinite(file?.size) && <span className="text-blue-500/80">{formatBytes(file.size)}</span>}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                                    <div className="space-y-3">
                                        <textarea
                                            value={submissionDraftByAssignment[assignment.id]?.note || ''}
                                            onChange={(event) => handleSubmissionNoteChange(assignment.id, event.target.value)}
                                            placeholder="Comentario de entrega (opcional)"
                                            rows={2}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
                                        />

                                        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                                            <Upload className="w-3.5 h-3.5" />
                                            Adjuntar archivos de entrega
                                            <input
                                                type="file"
                                                multiple
                                                onChange={(event) => handleSubmissionFilesSelected(assignment.id, event)}
                                                className="hidden"
                                            />
                                        </label>

                                        {(submissionDraftByAssignment[assignment.id]?.files || []).length > 0 && (
                                            <div className="space-y-1.5">
                                                {(submissionDraftByAssignment[assignment.id]?.files || []).map((file, index) => (
                                                    <div key={`${assignment.id}-draft-file-${index}`} className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 mr-2 mb-1">
                                                        <FileText className="w-3.5 h-3.5" />
                                                        <span className="max-w-[12rem] truncate">{file.name}</span>
                                                        <span className="text-slate-400">{formatBytes(file.size)}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSubmissionFile(assignment.id, index)}
                                                            className="text-slate-500 hover:text-red-500"
                                                            aria-label="Quitar archivo"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {(mine?.submissionFiles || []).length > 0 && (
                                            <div className="space-y-1.5">
                                                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Tus archivos entregados</p>
                                                {(mine?.submissionFiles || []).map((file, index) => (
                                                    <a
                                                        key={`${assignment.id}-submitted-file-${index}`}
                                                        href={file?.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:underline mr-2 mb-1"
                                                    >
                                                        <Paperclip className="w-3.5 h-3.5" />
                                                        <span className="max-w-[12rem] truncate">{file?.name || `Archivo ${index + 1}`}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => toggleStudentDelivery(assignment)}
                                                disabled={uploadingAssignmentId === assignment.id}
                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${delivered ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300'} disabled:opacity-70`}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                {uploadingAssignmentId === assignment.id ? 'Subiendo archivos...' : delivered ? 'Retirar entrega' : 'Entregar tarea'}
                                            </button>
                                        </div>
                                    </div>
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
