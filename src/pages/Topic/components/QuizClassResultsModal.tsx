// src/pages/Topic/components/QuizClassResultsModal.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { X, Loader2, Eye, Save, RotateCcw, ChevronLeft, Users, BarChart3, Download } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import QuizReviewDetail from '../../../components/modules/QuizEngine/QuizReviewDetail';

const QuizClassResultsModal = ({
    isOpen,
    onClose,
    quiz,
    analytics,
    topicId,
    onSaveQuizScoreOverride
}: any) => {
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [attemptsLoading, setAttemptsLoading] = useState(false);
    const [latestAttempt, setLatestAttempt] = useState<any>(null);
    const [attemptsError, setAttemptsError] = useState('');
    const [overrideDraft, setOverrideDraft] = useState('');
    const [savingOverride, setSavingOverride] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const completedStudents = useMemo(
        () => (analytics?.students || []).filter((student) => student.hasResult),
        [analytics?.students]
    );

    useEffect(() => {
        if (!isOpen) return;
        if (!completedStudents.length) {
            setSelectedStudentId('');
            return;
        }

        const firstWithResult = completedStudents[0];
        setSelectedStudentId(firstWithResult?.userId || '');
    }, [isOpen, completedStudents]);

    const selectedStudent = useMemo(
        () => completedStudents.find((student) => student.userId === selectedStudentId) || null,
        [completedStudents, selectedStudentId]
    );

    useEffect(() => {
        if (!selectedStudent) {
            setOverrideDraft('');
            return;
        }

        if (selectedStudent.overrideScore === null || selectedStudent.overrideScore === undefined) {
            setOverrideDraft('');
            return;
        }

        setOverrideDraft(String(selectedStudent.overrideScore));
    }, [selectedStudent]);

    useEffect(() => {
        const loadLatestAttempt = async () => {
            if (!isOpen || !quiz?.id || !topicId || !selectedStudentId) {
                setLatestAttempt(null);
                setAttemptsError('');
                return;
            }

            setAttemptsLoading(true);
            setAttemptsError('');
            try {
                const attemptsQuery = query(
                    collection(db, 'quizAttempts'),
                    where('quizId', '==', quiz.id),
                    where('topicId', '==', topicId),
                    where('userId', '==', selectedStudentId)
                );

                const snapshot = await getDocs(attemptsQuery);
                const latest = snapshot.docs
                    .map((attemptDoc: any) => ({ id: attemptDoc.id, ...attemptDoc.data() }))
                    .sort((a, b: any) => {
                        const aMs = a?.completedAt?.toMillis ? a.completedAt.toMillis() : 0;
                        const bMs = b?.completedAt?.toMillis ? b.completedAt.toMillis() : 0;
                        return bMs - aMs;
                    })[0] || null;

                setLatestAttempt(latest);
                setAttemptsError('');
            } catch (error: any) {
                console.error('[QUIZ_CLASS_MODAL] Error loading attempts:', error);
                setLatestAttempt(null);
                if (error?.code === 'permission-denied') {
                    setAttemptsError('No tienes permiso para cargar las respuestas de este alumno.');
                } else {
                    setAttemptsError('No se pudieron cargar las respuestas de este alumno. Intentalo de nuevo.');
                }
            } finally {
                setAttemptsLoading(false);
            }
        };

        loadLatestAttempt();
    }, [isOpen, quiz?.id, topicId, selectedStudentId]);

    if (!isOpen || !quiz) return null;

    const exportToExcelCompatibleCsv = () => {
        try {
            const rows = completedStudents.map((student: any) => ({
                alumno: student.userName || 'Alumno',
                email: student.userEmail || '',
                notaFinal: student.score === null || student.score === undefined ? '' : Number(student.score).toFixed(2),
                notaOriginal: student.rawScore === null || student.rawScore === undefined ? '' : Number(student.rawScore).toFixed(2),
                overrideDocente: student.overrideScore === null || student.overrideScore === undefined ? '' : Number(student.overrideScore).toFixed(2)
            }));

            const header = ['Alumno', 'Email', 'Nota final (%)', 'Nota original (%)', 'Override docente (%)'];
            const csvRows = [
                header.join(','),
                ...rows.map((row) => [row.alumno, row.email, row.notaFinal, row.notaOriginal, row.overrideDocente]
                    .map((value) => `"${String(value || '').replace(/"/g, '""')}"`)
                    .join(','))
            ];

            const csvContent = `\uFEFF${csvRows.join('\n')}`;
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const safeQuizName = String(quiz.title || quiz.name || 'test').replace(/[^a-z0-9-_]/gi, '_');
            link.href = url;
            link.setAttribute('download', `notas_${safeQuizName}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 1000);
            setFeedbackMessage(
                rows.length
                    ? `Exportado: ${rows.length} alumno${rows.length !== 1 ? 's' : ''}.`
                    : 'Exportado sin filas: aún no hay alumnos con test realizado.'
            );
        } catch (error) {
            console.error('[QUIZ_CLASS_MODAL] Error exporting CSV:', error);
            setFeedbackMessage('No se pudo exportar. Revisa permisos del navegador para descargas e intenta de nuevo.');
        }
    };

    const handleSaveOverride = async () => {
        if (!selectedStudent?.userId || !onSaveQuizScoreOverride) return;

        const trimmed = String(overrideDraft || '').trim();
        const parsed = trimmed === '' ? null : Number(trimmed);
        if (parsed !== null && Number.isNaN(parsed)) return;

        setSavingOverride(true);
        try {
            await onSaveQuizScoreOverride({
                quizId: quiz.id,
                userId: selectedStudent.userId,
                overrideScore: parsed === null ? null : Math.max(0, Math.min(100, parsed))
            });
            setFeedbackMessage('Nota actualizada correctamente.');
        } catch (error) {
            console.error('[QUIZ_CLASS_MODAL] Error saving override:', error);
            setFeedbackMessage('No se pudo actualizar la nota. Revisa permisos y vuelve a intentar.');
        } finally {
            setSavingOverride(false);
        }
    };

    const handleResetOverride = async () => {
        if (!selectedStudent?.userId || !onSaveQuizScoreOverride) return;

        setSavingOverride(true);
        try {
            await onSaveQuizScoreOverride({
                quizId: quiz.id,
                userId: selectedStudent.userId,
                overrideScore: null
            });
            setOverrideDraft('');
            setFeedbackMessage('Override eliminado.');
        } catch (error) {
            console.error('[QUIZ_CLASS_MODAL] Error clearing override:', error);
            setFeedbackMessage('No se pudo quitar el override. Revisa permisos y vuelve a intentar.');
        } finally {
            setSavingOverride(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] font-bold text-slate-400 dark:text-slate-500">Panel docente</p>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">{quiz.title || quiz.name || 'Test'} · Resultados</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                                <Users className="w-3.5 h-3.5" /> {analytics?.participants || 0} alumnos con nota
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold">
                                <BarChart3 className="w-3.5 h-3.5" />
                                Promedio: {analytics?.averageScore === null || analytics?.averageScore === undefined ? 'Sin datos' : `${analytics.averageScore}%`}
                            </span>
                            <button
                                onClick={exportToExcelCompatibleCsv}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-900/40"
                                title="Exportar notas"
                            >
                                <Download className="w-3.5 h-3.5" /> Exportar Excel
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Cerrar"
                    >
                        <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-0 flex-1">
                    <aside className="border-r border-slate-200 dark:border-slate-700 overflow-y-auto minimal-scrollbar">
                        <div className="p-4 space-y-2">
                            {completedStudents.map((student: any) => {
                                const isActive = selectedStudentId === student.userId;
                                return (
                                    <button
                                        key={student.userId}
                                        onClick={() => setSelectedStudentId(student.userId)}
                                        className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${isActive ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-700' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {student.photoURL ? (
                                                <img src={student.photoURL} alt={student.userName || 'Alumno'} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 flex items-center justify-center font-bold text-xs">
                                                    {String(student.userName || 'A').slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{student.userName || 'Alumno'}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{student.userEmail || student.userId}</p>
                                                <p className="text-xs mt-1 font-bold text-indigo-600 dark:text-indigo-400">
                                                    {student.score === null || student.score === undefined ? 'Sin nota' : `${Math.round(student.score)}%`}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}

                            {completedStudents.length === 0 && (
                                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-3 py-6 text-xs font-semibold text-slate-500 dark:text-slate-400 text-center">
                                    Aún no hay alumnos con test realizado.
                                </div>
                            )}
                        </div>
                    </aside>

                    <section className="overflow-y-auto p-6 minimal-scrollbar">
                        {selectedStudent ? (
                            <div className="space-y-5">
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/70 dark:bg-slate-800/40">
                                    <div className="flex items-center gap-3">
                                        {selectedStudent.photoURL ? (
                                            <img src={selectedStudent.photoURL} alt={selectedStudent.userName || 'Alumno'} className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 flex items-center justify-center font-bold text-sm">
                                                {String(selectedStudent.userName || 'A').slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="text-base font-bold text-slate-900 dark:text-white">{selectedStudent.userName || 'Alumno'}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedStudent.userEmail || selectedStudent.userId}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
                                            <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-slate-400">Nota final</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                                                {selectedStudent.score === null || selectedStudent.score === undefined ? 'Sin nota' : `${Math.round(selectedStudent.score)}%`}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
                                            <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-slate-400">Nota original</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                                                {selectedStudent.rawScore === null || selectedStudent.rawScore === undefined ? 'Sin nota' : `${Math.round(selectedStudent.rawScore)}%`}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
                                            <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-slate-400">Override docente</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                                                {selectedStudent.overrideScore === null || selectedStudent.overrideScore === undefined ? 'Sin override' : `${Math.round(selectedStudent.overrideScore)}%`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={overrideDraft}
                                            onChange={(event) => setOverrideDraft(event.target.value)}
                                            className="w-32 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white"
                                            placeholder="0-100"
                                        />
                                        <button
                                            onClick={handleSaveOverride}
                                            disabled={savingOverride}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-60"
                                        >
                                            {savingOverride ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                            Guardar nota
                                        </button>
                                        <button
                                            onClick={handleResetOverride}
                                            disabled={savingOverride}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            Quitar override
                                        </button>
                                    </div>

                                    {feedbackMessage && (
                                        <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            {feedbackMessage}
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Eye className="w-4 h-4 text-slate-500" />
                                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">Respuestas exactas del intento más reciente</h5>
                                    </div>

                                    {attemptsLoading ? (
                                        <div className="py-8 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando respuestas...
                                        </div>
                                    ) : attemptsError ? (
                                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                                            {attemptsError}
                                        </div>
                                    ) : latestAttempt?.answersDetail?.length ? (
                                        <QuizReviewDetail answersDetail={latestAttempt.answersDetail} topicGradient="from-indigo-500 to-purple-600" />
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-4 py-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                            Este alumno aún no tiene respuestas detalladas registradas para este test.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-2">
                                <ChevronLeft className="w-5 h-5" />
                                Selecciona un alumno para ver sus respuestas y editar su nota.
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default QuizClassResultsModal;
