// src/pages/Quizzes/QuizEdit.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Save, Plus, Trash2, CheckCircle2,
    Circle, Loader2, X, Pencil, Eye, ShieldAlert,
    ClipboardCheck,
    CalendarDays
} from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { canEdit } from '../../utils/permissionUtils';

// Importaciones para matemáticas
import 'katex/dist/katex.min.css';
import { RenderLatex as BaseRenderLatex } from '../../components/modules/QuizEngine/QuizCommon';

// --- COMPONENTE AUXILIAR: RENDERIZADOR DE LATEX CON PLACEHOLDER ---
const RenderLatex = ({ text }) => {
    if (!text) return <span className="text-slate-400 dark:text-slate-500 italic">Haz clic para escribir...</span>;
    return <BaseRenderLatex text={text} />;
};

// --- COMPONENTE MAGICO: EDITOR HÍBRIDO (VISTA/EDICIÓN) ---
const EditableMathText = ({ value, onChange, placeholder, isTextArea = false, className = "" }) => {
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef(null);

    // Al entrar en modo edición, poner el foco en el input
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    if (isEditing) {
        // MODO EDICIÓN: Muestra el código fuente
        return (
            <div className="relative w-full">
                {isTextArea ? (
                    <textarea
                        ref={inputRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={() => setIsEditing(false)}
                        className={`w-full bg-white dark:bg-slate-800 border-2 border-indigo-400 dark:border-indigo-500 rounded-xl px-4 py-3 font-mono text-sm text-slate-800 dark:text-slate-200 focus:outline-none shadow-lg animate-in fade-in zoom-in-95 duration-200 ${className}`}
                        rows={3}
                        placeholder={placeholder}
                    />
                ) : (
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={() => setIsEditing(false)}
                        className={`w-full bg-white dark:bg-slate-800 border-2 border-indigo-400 dark:border-indigo-500 rounded-lg px-3 py-2 font-mono text-sm text-slate-800 dark:text-slate-200 focus:outline-none shadow-lg animate-in fade-in zoom-in-95 duration-200 ${className}`}
                        placeholder={placeholder}
                    />
                )}
                {/* Indicador de que estás editando */}
                <div className="absolute right-2 top-2 text-xs text-indigo-400 dark:text-indigo-300 font-bold bg-white dark:bg-slate-800 px-2 rounded pointer-events-none">
                    Editando LaTeX
                </div>
            </div>
        );
    }

    // MODO VISUALIZACIÓN: Muestra el resultado bonito
    return (
        <div
            onClick={() => setIsEditing(true)}
            className={`cursor-text hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 rounded-xl px-4 py-3 transition-all group relative ${className} ${!value && 'bg-slate-50 dark:bg-slate-700/30'}`}
        >
            <div className={isTextArea ? "whitespace-pre-wrap" : "truncate"}>
                <RenderLatex text={value} />
            </div>

            {/* Icono flotante que aparece al pasar el mouse */}
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 dark:text-slate-500 bg-white/80 dark:bg-slate-700/80 p-1 rounded-md shadow-sm">
                <Pencil className="w-3 h-3" />
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const QuizEdit = ({ user }) => {
    const { subjectId, topicId, quizId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [hasEditPermission, setHasEditPermission] = useState(false);
    const [quizData, setQuizData] = useState({
        title: '',
        questions: [],
        isAssignment: false,
        assignmentStartAt: '',
        assignmentDueAt: ''
    });

    const toDateTimeInputValue = (value) => {
        if (!value) return '';
        const date = value?.toDate ? value.toDate() : new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const pad = (n) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const parseDateTimeInput = (value) => {
        if (!value) return null;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const normalizeQuestions = (questions) => {
        return (questions || []).map((question) => ({
            ...question,
            question: String(question?.question || '').trim(),
            options: (question?.options || []).map((option) => String(option ?? '').trim()),
            correctIndex: Number.isInteger(question?.correctIndex) ? question.correctIndex : 0
        }));
    };

    const validateQuestions = (questions) => {
        for (let index = 0; index < questions.length; index += 1) {
            const current = questions[index];
            if (!current.question) {
                return `La pregunta ${index + 1} no tiene enunciado.`;
            }

            if (!Array.isArray(current.options) || current.options.length < 2) {
                return `La pregunta ${index + 1} debe tener al menos 2 opciones.`;
            }

            if (current.options.some((option) => !option)) {
                return `La pregunta ${index + 1} tiene opciones vacias.`;
            }

            if (current.correctIndex < 0 || current.correctIndex >= current.options.length) {
                return `La respuesta correcta de la pregunta ${index + 1} es invalida.`;
            }
        }

        return '';
    };

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                // Fetch topic to check permissions
                const topicRef = doc(db, "topics", topicId);
                const topicSnap = await getDoc(topicRef);
                
                if (!topicSnap.exists()) {
                    alert("Tema no encontrado");
                    navigate(-1);
                    return;
                }
                
                const topicData = { id: topicSnap.id, ...topicSnap.data() };
                const hasPermission = canEdit(topicData, user?.uid);
                setHasEditPermission(hasPermission);
                
                if (!hasPermission) {
                    // Redirect viewers to read-only quiz view
                    setLoading(false);
                    return;
                }
                
                // Fetch quiz data if user has permission
                const quizRef = doc(db, "quizzes", quizId);
                const snap = await getDoc(quizRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setQuizData({
                        ...data,
                        title: data.title || data.name || '',
                        questions: data.questions || [],
                        isAssignment: Boolean(data.isAssignment),
                        assignmentStartAt: toDateTimeInputValue(data.assignmentStartAt),
                        assignmentDueAt: toDateTimeInputValue(data.assignmentDueAt)
                    });
                }
                else {
                    setSaveError('No se encontro el test solicitado.');
                }
            } catch (error) {
                console.error(error);
                setSaveError('Error al cargar el test. Intentalo de nuevo.');
            }
            finally { setLoading(false); }
        };
        fetchQuiz();
    }, [subjectId, topicId, quizId, navigate, user]);

    // --- HANDLERS ---
    const updateField = (field, value) => setQuizData({ ...quizData, [field]: value });
    
    const updateQuestion = (idx, val) => {
        const newQ = [...quizData.questions]; newQ[idx].question = val;
        setQuizData({ ...quizData, questions: newQ });
    };

    const updateOption = (qIdx, oIdx, val) => {
        const newQ = [...quizData.questions]; newQ[qIdx].options[oIdx] = val;
        setQuizData({ ...quizData, questions: newQ });
    };

    const setCorrect = (qIdx, oIdx) => {
        const newQ = [...quizData.questions]; newQ[qIdx].correctIndex = oIdx;
        setQuizData({ ...quizData, questions: newQ });
    };

    const deleteQuestion = (idx) => {
        if (!window.confirm("¿Borrar pregunta?")) return;
        setQuizData({ ...quizData, questions: quizData.questions.filter((_, i) => i !== idx) });
    };

    const addQuestion = () => {
        setQuizData({ ...quizData, questions: [...quizData.questions, {
            question: "Nueva pregunta...", options: ["A", "B"], correctIndex: 0
        }]});
    };

    const addOption = (qIdx) => {
        const newQ = [...quizData.questions]; newQ[qIdx].options.push("Opción");
        setQuizData({ ...quizData, questions: newQ });
    };

    const deleteOption = (qIdx, oIdx) => {
        const newQ = [...quizData.questions];
        if (newQ[qIdx].options.length <= 2) return;
        newQ[qIdx].options = newQ[qIdx].options.filter((_, i) => i !== oIdx);
        if (newQ[qIdx].correctIndex >= oIdx) newQ[qIdx].correctIndex = Math.max(0, newQ[qIdx].correctIndex - 1);
        setQuizData({ ...quizData, questions: newQ });
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveError('');

        try {
            const normalizedQuestions = normalizeQuestions(quizData.questions);

            if (!quizData.title?.trim()) {
                setSaveError('El test necesita un titulo para guardarse.');
                setSaving(false);
                return;
            }

            if (normalizedQuestions.length === 0) {
                setSaveError('Debes incluir al menos una pregunta.');
                setSaving(false);
                return;
            }

            const questionValidationError = validateQuestions(normalizedQuestions);
            if (questionValidationError) {
                setSaveError(questionValidationError);
                setSaving(false);
                return;
            }

            const startDate = parseDateTimeInput(quizData.assignmentStartAt);
            const dueDate = parseDateTimeInput(quizData.assignmentDueAt);

            if (quizData.isAssignment && startDate && dueDate && dueDate < startDate) {
                setSaveError('La fecha de cierre no puede ser anterior al inicio.');
                setSaving(false);
                return;
            }

            const payload = {
                title: quizData.title.trim(),
                name: quizData.title.trim(),
                questions: normalizedQuestions,
                isAssignment: Boolean(quizData.isAssignment),
                assignmentStartAt: quizData.isAssignment ? startDate : null,
                assignmentDueAt: quizData.isAssignment ? dueDate : null,
                updatedAt: serverTimestamp()
            };

            const optionalFields = ['level', 'type', 'formulas', 'prompt', 'subjectId', 'topicId', 'institutionId', 'ownerId', 'createdBy'];
            optionalFields.forEach((field) => {
                if (quizData[field] !== undefined) payload[field] = quizData[field];
            });

            await updateDoc(doc(db, "quizzes", quizId), {
                ...payload
            });
            navigate(-1);
        } catch (e) {
            console.error(e);
            setSaveError('No se pudo guardar el test. Revisa los campos y vuelve a intentarlo.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="animate-spin w-8 h-8 text-indigo-600 dark:text-indigo-400"/></div>;

    // *** PERMISSION DENIED UI ***
    if (!hasEditPermission) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-3">Sin permisos de edición</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        No tienes permisos para editar este test. Solo el creador o colaboradores con acceso de edición pueden modificar el contenido.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" /> Volver
                        </button>
                        <button
                            onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quizId}`)}
                            className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                            <Eye className="w-5 h-5" /> Ver en modo lectura
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-32">

            {/* HEADER */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Editor de Test</h1>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">{quizData.questions.length} Preguntas</p>
                    </div>
                </div>
                <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? '...' : 'Guardar'}
                </button>
            </div>

            {saveError && (
                <div className="max-w-4xl mx-auto px-6 pt-4">
                    <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">
                        {saveError}
                    </div>
                </div>
            )}

            <main className="max-w-4xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* TÍTULO */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Título del Test</label>
                    <input
                        type="text" value={quizData.title} onChange={(e) => updateField('title', e.target.value)}
                        className="w-full text-4xl font-black text-slate-800 dark:text-slate-100 bg-transparent border-b-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 focus:outline-none py-2 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                        placeholder="Nombre del test..."
                    />

                    <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
                        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 px-5 py-4">
                            <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    <ClipboardCheck className="w-4 h-4 text-indigo-500" /> Marcar como tarea
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Las tareas pueden tener ventana de disponibilidad y ponderación propia en notas.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const nextValue = !quizData.isAssignment;
                                    setQuizData((prev) => ({
                                        ...prev,
                                        isAssignment: nextValue,
                                        assignmentStartAt: nextValue ? prev.assignmentStartAt : '',
                                        assignmentDueAt: nextValue ? prev.assignmentDueAt : '',
                                    }));
                                }}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${quizData.isAssignment ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${quizData.isAssignment ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        {quizData.isAssignment && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                                        <CalendarDays className="w-3.5 h-3.5" /> Inicio
                                    </span>
                                    <input
                                        type="datetime-local"
                                        value={quizData.assignmentStartAt || ''}
                                        onChange={(e) => updateField('assignmentStartAt', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                                        <CalendarDays className="w-3.5 h-3.5" /> Cierre
                                    </span>
                                    <input
                                        type="datetime-local"
                                        value={quizData.assignmentDueAt || ''}
                                        onChange={(e) => updateField('assignmentDueAt', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* PREGUNTAS */}
                <div className="space-y-6">
                    {quizData.questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">

                            {/* ENUNCIADO DE LA PREGUNTA */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50 px-6 py-4 flex items-start gap-4">
                                <div className="mt-2 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                                    {qIndex + 1}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Enunciado (Click para editar)</label>

                                    <EditableMathText
                                        value={q.question}
                                        onChange={(val) => updateQuestion(qIndex, val)}
                                        isTextArea={true}
                                        className="text-lg font-bold text-slate-800 dark:text-slate-100"
                                        placeholder="Escribe la pregunta..."
                                    />

                                </div>
                                <button onClick={() => deleteQuestion(qIndex)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-all">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* OPCIONES */}
                            <div className="p-6 bg-white dark:bg-slate-900 space-y-3">
                                {q.options.map((option, oIndex) => {
                                    const isCorrect = q.correctIndex === oIndex;
                                    return (
                                        <div key={oIndex} className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${isCorrect ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20' : 'border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600'}`}>
                                            <button onClick={() => setCorrect(qIndex, oIndex)} className={`p-2 rounded-full transition-all ${isCorrect ? 'text-green-600 dark:text-green-400 bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-300 dark:text-slate-600 hover:text-green-400'}`}>
                                                {isCorrect ? <CheckCircle2 className="w-6 h-6 fill-current" /> : <Circle className="w-6 h-6" />}
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <EditableMathText
                                                    value={option}
                                                    onChange={(val) => updateOption(qIndex, oIndex, val)}
                                                    className={`${isCorrect ? 'text-green-900 dark:text-green-300 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}
                                                    placeholder="Opción..."
                                                />
                                            </div>

                                            <button onClick={() => deleteOption(qIndex, oIndex)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                                <button onClick={() => addOption(qIndex)} className="ml-14 mt-2 text-xs font-bold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg">
                                    <Plus className="w-3 h-3" /> Añadir Opción
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex justify-center">
                    <button onClick={addQuestion} className="flex items-center gap-3 px-8 py-5 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-3xl font-bold hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all shadow-sm">
                        <Plus className="w-6 h-6" /> Añadir Nueva Pregunta
                    </button>
                </div>
            </main>
        </div>
    );
};

export default QuizEdit;