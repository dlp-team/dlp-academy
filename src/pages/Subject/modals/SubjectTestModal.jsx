// src/pages/Subject/modals/SubjectTestModal.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { X, ClipboardCheck, CalendarDays, Percent, ListOrdered, BookOpen } from 'lucide-react';

const LEVEL_OPTIONS = [
    { value: 'Principiante', label: 'Basico' },
    { value: 'Intermedio', label: 'Intermedio' },
    { value: 'Avanzado', label: 'Avanzado' }
];

const SubjectTestModal = ({
    isOpen,
    onClose,
    onSubmit,
    topics = [],
    defaultLevel = 'Intermedio',
    isSaving = false,
    subjectColor = 'from-indigo-500 to-purple-600'
}) => {
    const [formData, setFormData] = useState({
        title: '',
        level: defaultLevel,
        topicId: '',
        questionCount: '5',
        isAssignment: false,
        countsForGrade: true,
        assignmentStartAt: '',
        assignmentDueAt: '',
        assignmentWeight: '1'
    });
    const [errorText, setErrorText] = useState('');

    useEffect(() => {
        let initTimer;
        if (!isOpen) return;
        initTimer = setTimeout(() => {
            setFormData({
                title: '',
                level: defaultLevel,
                topicId: topics[0]?.id || '',
                questionCount: '5',
                isAssignment: false,
                countsForGrade: true,
                assignmentStartAt: '',
                assignmentDueAt: '',
                assignmentWeight: '1'
            });
            setErrorText('');
        }, 0);
        return () => clearTimeout(initTimer);
    }, [isOpen, defaultLevel, topics]);

    const selectedTopicName = useMemo(
        () => topics.find((topic) => topic.id === formData.topicId)?.name || '',
        [topics, formData.topicId]
    );

    if (!isOpen) return null;

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrorText('');

        if (!formData.title.trim()) {
            setErrorText('El test necesita un titulo.');
            return;
        }

        if (!formData.topicId) {
            setErrorText('Debes seleccionar un tema para guardar el test.');
            return;
        }

        const parsedQuestionCount = Number(formData.questionCount);
        if (!Number.isFinite(parsedQuestionCount) || parsedQuestionCount < 1 || parsedQuestionCount > 30) {
            setErrorText('El numero de preguntas debe estar entre 1 y 30.');
            return;
        }

        if (formData.isAssignment) {
            const startDate = formData.assignmentStartAt ? new Date(formData.assignmentStartAt) : null;
            const dueDate = formData.assignmentDueAt ? new Date(formData.assignmentDueAt) : null;

            if (startDate && dueDate && dueDate < startDate) {
                setErrorText('La fecha de cierre no puede ser anterior al inicio.');
                return;
            }
        }

        onSubmit({
            ...formData,
            title: formData.title.trim(),
            questionCount: parsedQuestionCount,
            selectedTopicName
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
                <div className={`px-6 py-5 bg-gradient-to-r ${subjectColor} text-white flex items-start justify-between gap-3`}>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Nuevo test</p>
                        <h3 className="text-2xl font-black mt-1">Crear test por seccion</h3>
                        <p className="text-sm text-white/85 mt-1">Configura el test y se abrira el editor para terminarlo.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors"
                        type="button"
                        disabled={isSaving}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Titulo</span>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                                className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm font-semibold"
                                placeholder="Ej: Test integrador"
                                disabled={isSaving}
                            />
                        </label>

                        <label className="block">
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tema</span>
                            <select
                                value={formData.topicId}
                                onChange={(event) => setFormData((prev) => ({ ...prev, topicId: event.target.value }))}
                                className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm font-semibold"
                                disabled={isSaving}
                            >
                                {topics.map((topic) => (
                                    <option key={topic.id} value={topic.id}>{topic.name || 'Tema'}</option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Seccion</span>
                            <select
                                value={formData.level}
                                onChange={(event) => setFormData((prev) => ({ ...prev, level: event.target.value }))}
                                className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm font-semibold"
                                disabled={isSaving}
                            >
                                {LEVEL_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <ListOrdered className="w-3.5 h-3.5" /> Preguntas iniciales
                            </span>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={formData.questionCount}
                                onChange={(event) => setFormData((prev) => ({ ...prev, questionCount: event.target.value }))}
                                className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm font-semibold"
                                disabled={isSaving}
                            />
                        </label>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    <ClipboardCheck className="w-4 h-4 text-indigo-500" /> Marcar como tarea
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Permite ventana de entrega y ponderacion propia.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData((prev) => ({
                                    ...prev,
                                    isAssignment: !prev.isAssignment,
                                    countsForGrade: !prev.isAssignment,
                                    assignmentWeight: !prev.isAssignment ? (prev.assignmentWeight || '1') : '1'
                                }))}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${formData.isAssignment ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                                disabled={isSaving}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.isAssignment ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {formData.isAssignment && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <label className="block">
                                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <CalendarDays className="w-3.5 h-3.5" /> Inicio
                                    </span>
                                    <input
                                        type="datetime-local"
                                        value={formData.assignmentStartAt}
                                        onChange={(event) => setFormData((prev) => ({ ...prev, assignmentStartAt: event.target.value }))}
                                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                        disabled={isSaving}
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <CalendarDays className="w-3.5 h-3.5" /> Cierre
                                    </span>
                                    <input
                                        type="datetime-local"
                                        value={formData.assignmentDueAt}
                                        onChange={(event) => setFormData((prev) => ({ ...prev, assignmentDueAt: event.target.value }))}
                                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                        disabled={isSaving}
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <Percent className="w-3.5 h-3.5" /> Peso interno
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={formData.assignmentWeight}
                                        onChange={(event) => setFormData((prev) => ({ ...prev, assignmentWeight: event.target.value }))}
                                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                        disabled={isSaving}
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    {errorText && (
                        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm font-semibold text-red-700 dark:text-red-300">
                            {errorText}
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            Al crear se abrira el editor para completar preguntas y opciones.
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                disabled={isSaving}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className={`px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${subjectColor} disabled:opacity-60`}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Creando...' : 'Crear test'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubjectTestModal;
