import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Timer, CheckCircle2, ArrowRight, 
    RefreshCcw, Award, Sigma, X, Brain, HelpCircle 
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Importaciones de Matemáticas (LaTeX)
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

const Quizzes = ({ user }) => {
    const { subjectId, topicId, quizId } = useParams();
    const navigate = useNavigate();

    // --- ESTADOS ---
    const [loading, setLoading] = useState(true);
    const [viewState, setViewState] = useState('loading'); // 'loading', 'review', 'quiz', 'results'
    const [quizData, setQuizData] = useState(null);
    
    // Estados del juego
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [finalScore, setFinalScore] = useState(0);

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const fetchQuiz = async () => {
            if (!user) return;
            
            try {
                // Buscamos en la subcolección donde n8n escribe
                const quizRef = doc(db, "subjects", subjectId, "topics", topicId, "quizzes_data", quizId);
                const snap = await getDoc(quizRef);

                if (snap.exists()) {
                    setQuizData(snap.data());
                    setViewState('review'); // Empezamos con el repaso
                } else {
                    console.warn("Quiz no encontrado, cargando Mock Data para demo...");
                    // DATOS DE EJEMPLO (Por si n8n no ha llegado aún)
                    setQuizData({
                        title: "Test de Derivadas",
                        // Estas son las fórmulas que el usuario pidió recordar antes del ejercicio
                        formulas: [
                            "\\frac{d}{dx}(x^n) = nx^{n-1}",
                            "\\frac{d}{dx}(\\ln x) = \\frac{1}{x}",
                            "\\int x^n dx = \\frac{x^{n+1}}{n+1} + C"
                        ],
                        questions: [
                            {
                                question: "Calcula la derivada de la siguiente función:",
                                formula: "f(x) = 3x^2 + 5x",
                                options: ["6x + 5", "3x + 5", "6x", "x^2 + 5"],
                                correctIndex: 0 // Índice de la respuesta correcta en el array options
                            },
                            {
                                question: "¿Cuál es el resultado de esta integral definida?",
                                formula: "\\int_{0}^{2} x dx",
                                options: ["1", "2", "4", "0.5"],
                                correctIndex: 1
                            }
                        ]
                    });
                    setViewState('review');
                }
            } catch (error) {
                console.error("Error cargando el quiz:", error);
                alert("Error al cargar el test. Intenta de nuevo.");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [user, subjectId, topicId, quizId, navigate]);

    // --- LÓGICA DEL TEST ---

    const handleAnswerSelect = (index) => {
        setSelectedAnswer(index);
    };

    const handleNext = () => {
        // 1. Verificar si la respuesta es correcta
        const isCorrect = selectedAnswer === quizData.questions[currentStep].correctIndex;
        
        // 2. Actualizar contador (usamos el valor previo para asegurar precisión)
        const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
        setCorrectCount(newCorrectCount);

        // 3. Avanzar o Terminar
        if (currentStep < quizData.questions.length - 1) {
            setCurrentStep(currentStep + 1);
            setSelectedAnswer(null); // Resetear selección
        } else {
            // Calcular puntuación final
            const score = Math.round((newCorrectCount / quizData.questions.length) * 100);
            setFinalScore(score);
            setViewState('results');
        }
    };

    // --- RENDERIZADO ---

    // 1. LOADING
    if (loading || viewState === 'loading') return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <RefreshCcw className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Preparando tu sala de estudio...</p>
        </div>
    );

    // 2. VISTA DE REPASO (FÓRMULAS)
    if (viewState === 'review') return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
            <div className="max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                        <Sigma className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                        Antes de empezar
                    </h1>
                    <p className="text-slate-400 text-lg">
                        La IA ha extraído estas fórmulas clave de tu PDF. <br/>
                        <span className="text-indigo-400 font-bold">Úsalas para resolver los ejercicios.</span>
                    </p>
                </div>

                <div className="space-y-4 mb-12">
                    {quizData?.formulas?.map((f, i) => (
                        <div key={i} className="bg-slate-800/50 border border-white/5 p-6 rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-colors group">
                            <span className="text-slate-600 text-xs font-bold absolute left-6 opacity-0 group-hover:opacity-100 transition-opacity">#{i+1}</span>
                            <div className="text-indigo-200 text-xl overflow-x-auto py-2">
                                <BlockMath math={f} />
                            </div>
                        </div>
                    ))}
                    {(!quizData?.formulas || quizData.formulas.length === 0) && (
                        <div className="text-slate-500 text-center italic p-4">No hay fórmulas específicas para este repaso.</div>
                    )}
                </div>

                <button 
                    onClick={() => setViewState('quiz')}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                    ¡Entendido, vamos al Test!
                </button>
            </div>
        </div>
    );

    // 3. VISTA DE RESULTADOS
    if (viewState === 'results') return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 text-center border border-slate-100 animate-in slide-in-from-bottom-10 duration-500">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${finalScore >= 50 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Award className={`w-12 h-12 ${finalScore >= 50 ? 'text-green-600' : 'text-red-500'}`} />
                </div>
                
                <h2 className="text-4xl font-black text-slate-900 mb-2">
                    {finalScore >= 80 ? '¡Excelente!' : finalScore >= 50 ? '¡Bien hecho!' : 'A repasar...'}
                </h2>
                <p className="text-slate-500 mb-8 font-medium">
                    Has acertado {correctCount} de {quizData.questions.length} preguntas.
                </p>
                
                <div className="bg-slate-50 rounded-3xl p-8 mb-8 border border-slate-100 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 h-1 w-full ${finalScore >= 50 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div className="text-6xl font-black text-slate-800 mb-2">{finalScore}<span className="text-3xl text-slate-400">%</span></div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Puntuación Final</div>
                </div>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => {
                            // Resetear para intentar de nuevo
                            setViewState('review');
                            setCurrentStep(0);
                            setCorrectCount(0);
                            setFinalScore(0);
                        }}
                        className="w-full py-4 bg-white border-2 border-slate-100 hover:border-slate-300 text-slate-700 rounded-2xl font-bold transition-all"
                    >
                        Intentar de nuevo
                    </button>
                    <button 
                        onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}`)}
                        className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-lg"
                    >
                        Volver al Tema
                    </button>
                </div>
            </div>
        </div>
    );

    // 4. VISTA DEL QUIZ (JUEGO)
    const q = quizData.questions[currentStep];
    const progress = ((currentStep + 1) / quizData.questions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
            {/* --- HEADER FLOTANTE --- */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4 transition-all">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700">
                        <X className="w-6 h-6" />
                    </button>
                    
                    {/* Barra de Progreso */}
                    <div className="flex-1 max-w-md">
                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                            <span>Progreso</span>
                            <span>{currentStep + 1} / {quizData.questions.length}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                        <Timer className="w-4 h-4" />
                        <span className="text-sm">En curso</span>
                    </div>
                </div>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="pt-8 px-6 max-w-3xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
                <div className="mb-8">
                    {/* Etiqueta de tipo de pregunta */}
                    <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-widest mb-6">
                        <Brain className="w-4 h-4" />
                        <span>Pregunta Teórico-Práctica</span>
                    </div>

                    {/* Pregunta */}
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-8">
                        {q.question}
                    </h2>

                    {/* Bloque de Fórmula Específica de la Pregunta (si existe) */}
                    {q.formula && (
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-10 text-center overflow-x-auto relative">
                            <div className="absolute top-4 left-4 text-slate-200">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <div className="text-xl md:text-2xl text-slate-800">
                                <BlockMath math={q.formula} />
                            </div>
                        </div>
                    )}

                    {/* Opciones de Respuesta */}
                    <div className="grid gap-4">
                        {q.options.map((option, idx) => {
                            const isSelected = selectedAnswer === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswerSelect(idx)}
                                    className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-5 outline-none
                                        ${isSelected 
                                            ? 'border-indigo-600 bg-indigo-50/50 shadow-md scale-[1.01]' 
                                            : 'border-white bg-white hover:border-slate-200 hover:bg-slate-50 shadow-sm'}`}
                                >
                                    {/* Indicador de letra (A, B, C...) */}
                                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm transition-colors
                                        ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>

                                    {/* Texto de la opción (Renderiza LaTeX si es necesario) */}
                                    <div className={`flex-1 text-lg font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                                        {/* InlineMath detecta si es texto o formula automaticamente en muchos casos, 
                                            pero es mejor si la opción viene envuelta en $...$ si es pura fórmula */}
                                        <div className="katex-render-wrapper">
                                           {/* Si tu string contiene LaTeX (ej: \frac{...}), InlineMath lo renderizará. 
                                               Si es texto plano, se verá como texto plano a menos que falle el parser. 
                                               Para seguridad: mostramos el texto tal cual si no parece LaTeX */}
                                            {option.includes('\\') || option.includes('^') ? <InlineMath math={option} /> : option}
                                        </div>
                                    </div>

                                    {/* Icono de Check */}
                                    <div className={`transition-all duration-300 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50 w-0'}`}>
                                        <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* --- FOOTER / BOTÓN SIGUIENTE --- */}
                <div className="h-24"> {/* Espaciador */} </div>
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-20">
                    <div className="max-w-3xl mx-auto">
                        <button
                            disabled={selectedAnswer === null}
                            onClick={handleNext}
                            className={`w-full py-4 md:py-5 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl
                                ${selectedAnswer !== null 
                                    ? 'bg-slate-900 text-white hover:bg-indigo-600 hover:-translate-y-1 hover:shadow-indigo-500/30' 
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            {currentStep === quizData.questions.length - 1 ? 'Finalizar Test' : 'Siguiente Pregunta'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Quizzes;