import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Save, Plus, Trash2, CheckCircle2, 
    Circle, Loader2, GripVertical, X, Pencil, Eye
} from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Importaciones para matemáticas
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// --- COMPONENTE AUXILIAR: RENDERIZADOR DE LATEX ---
const RenderLatex = ({ text }) => {
    if (!text) return <span className="text-slate-300 italic">Haz clic para escribir...</span>;
    // Separa el texto por el símbolo $ para encontrar las partes matemáticas
    const parts = text.split('$');
    return (
        <span>
            {parts.map((part, index) => (
                index % 2 === 0 ? 
                <span key={index}>{part}</span> : 
                <span key={index} className="text-indigo-700 font-serif"><InlineMath math={part} /></span>
            ))}
        </span>
    );
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
                        className={`w-full bg-white border-2 border-indigo-400 rounded-xl px-4 py-3 font-mono text-sm text-slate-800 focus:outline-none shadow-lg animate-in fade-in zoom-in-95 duration-200 ${className}`}
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
                        className={`w-full bg-white border-2 border-indigo-400 rounded-lg px-3 py-2 font-mono text-sm text-slate-800 focus:outline-none shadow-lg animate-in fade-in zoom-in-95 duration-200 ${className}`}
                        placeholder={placeholder}
                    />
                )}
                {/* Indicador de que estás editando */}
                <div className="absolute right-2 top-2 text-xs text-indigo-400 font-bold bg-white px-2 rounded pointer-events-none">
                    Editando LaTeX
                </div>
            </div>
        );
    }

    // MODO VISUALIZACIÓN: Muestra el resultado bonito
    return (
        <div 
            onClick={() => setIsEditing(true)}
            className={`cursor-text hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl px-4 py-3 transition-all group relative ${className} ${!value && 'bg-slate-50'}`}
        >
            <div className={isTextArea ? "whitespace-pre-wrap" : "truncate"}>
                <RenderLatex text={value} />
            </div>
            
            {/* Icono flotante que aparece al pasar el mouse */}
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 bg-white/80 p-1 rounded-md shadow-sm">
                <Pencil className="w-3 h-3" />
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const QuizEdit = () => {
    const { subjectId, topicId, quizId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [quizData, setQuizData] = useState({
        title: '',
        questions: []
    });

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const quizRef = doc(db, "subjects", subjectId, "topics", topicId, "quizzes", quizId);
                const snap = await getDoc(quizRef);
                if (snap.exists()) setQuizData(snap.data());
                else { alert("Test no encontrado"); navigate(-1); }
            } catch (error) { console.error(error); } 
            finally { setLoading(false); }
        };
        fetchQuiz();
    }, [subjectId, topicId, quizId, navigate]);

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
        try {
            await updateDoc(doc(db, "subjects", subjectId, "topics", topicId, "quizzes", quizId), {
                ...quizData, updatedAt: serverTimestamp()
            });
            navigate(-1);
        } catch (e) { alert("Error al guardar"); } finally { setSaving(false); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin w-8 h-8 text-indigo-600"/></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32">
            
            {/* HEADER */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">Editor de Test</h1>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{quizData.questions.length} Preguntas</p>
                    </div>
                </div>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? '...' : 'Guardar'}
                </button>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* TÍTULO */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 mb-8">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Título del Test</label>
                    <input 
                        type="text" value={quizData.title} onChange={(e) => updateField('title', e.target.value)}
                        className="w-full text-4xl font-black text-slate-800 bg-transparent border-b-2 border-transparent focus:border-indigo-100 focus:outline-none py-2"
                        placeholder="Nombre del test..."
                    />
                </div>

                {/* PREGUNTAS */}
                <div className="space-y-6">
                    {quizData.questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                            
                            {/* ENUNCIADO DE LA PREGUNTA */}
                            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-start gap-4">
                                <div className="mt-2 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                                    {qIndex + 1}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Enunciado (Click para editar)</label>
                                    
                                    {/* USAMOS EL NUEVO COMPONENTE AQUÍ */}
                                    <EditableMathText 
                                        value={q.question} 
                                        onChange={(val) => updateQuestion(qIndex, val)}
                                        isTextArea={true}
                                        className="text-lg font-bold text-slate-800"
                                        placeholder="Escribe la pregunta..."
                                    />

                                </div>
                                <button onClick={() => deleteQuestion(qIndex)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* OPCIONES */}
                            <div className="p-6 bg-white space-y-3">
                                {q.options.map((option, oIndex) => {
                                    const isCorrect = q.correctIndex === oIndex;
                                    return (
                                        <div key={oIndex} className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${isCorrect ? 'border-green-200 bg-green-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                                            <button onClick={() => setCorrect(qIndex, oIndex)} className={`p-2 rounded-full transition-all ${isCorrect ? 'text-green-600 bg-white shadow-sm' : 'text-slate-300 hover:text-green-400'}`}>
                                                {isCorrect ? <CheckCircle2 className="w-6 h-6 fill-current" /> : <Circle className="w-6 h-6" />}
                                            </button>

                                            {/* USAMOS EL NUEVO COMPONENTE PARA LAS RESPUESTAS */}
                                            <div className="flex-1 min-w-0">
                                                <EditableMathText 
                                                    value={option} 
                                                    onChange={(val) => updateOption(qIndex, oIndex, val)}
                                                    className={`${isCorrect ? 'text-green-900 font-semibold' : 'text-slate-600'}`}
                                                    placeholder="Opción..."
                                                />
                                            </div>

                                            <button onClick={() => deleteOption(qIndex, oIndex)} className="p-2 text-slate-300 hover:text-red-500">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                                <button onClick={() => addOption(qIndex)} className="ml-14 mt-2 text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 px-3 py-2 hover:bg-indigo-50 rounded-lg">
                                    <Plus className="w-3 h-3" /> Añadir Opción
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex justify-center">
                    <button onClick={addQuestion} className="flex items-center gap-3 px-8 py-5 bg-white border-2 border-dashed border-slate-300 text-slate-400 rounded-3xl font-bold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm">
                        <Plus className="w-6 h-6" /> Añadir Nueva Pregunta
                    </button>
                </div>
            </main>
        </div>
    );
};

export default QuizEdit;