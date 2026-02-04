import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Timer, CheckCircle2, ArrowRight, 
    RefreshCcw, Award, Sigma, X, Brain, HelpCircle, BookOpen 
} from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'; // Añadido setDoc y serverTimestamp
import { db } from '../firebase/config';

import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

const Quizzes = ({ user }) => {
    const { subjectId, topicId, quizId } = useParams();
    const navigate = useNavigate();

    // --- ESTADOS ---
    const [loading, setLoading] = useState(true);
    const [viewState, setViewState] = useState('loading'); 
    const [quizData, setQuizData] = useState(null);
    const [isSaving, setIsSaving] = useState(false); // Estado para mostrar que se está guardando
    
    // Estado de Color (Por defecto indigo)
    const [accentColor, setAccentColor] = useState('indigo'); 

    // Estados del juego
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [finalScore, setFinalScore] = useState(0);

    // --- FUNCIONES DE NAVEGACIÓN ---
    const goToTopic = () => {
        navigate(`/home/subject/${subjectId}/topic/${topicId}`);
    };

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            // 1. CARGAR TEMA (Para obtener el color)
            try {
                const topicRef = doc(db, "subjects", subjectId, "topics", topicId);
                const topicSnap = await getDoc(topicRef);
                
                if (topicSnap.exists()) {
                    const tData = topicSnap.data();
                    if (tData.color) {
                        const firstPart = tData.color.split(' ')[0]; 
                        const cleanColor = firstPart.replace('from-', '').split('-')[0];
                        if (cleanColor) setAccentColor(cleanColor);
                    }
                }
            } catch (e) {
                console.error("No se pudo cargar el color del tema", e);
            }

            // 2. CARGAR QUIZ (Con Mock Fallback)
            const MOCK_DATA = {
                id: 'mock-1', // ID interno para el mock
                title: "Test de Prueba (Modo Demo)",
                formulas: [
                    "\\frac{d}{dx}(x^n) = nx^{n-1}",
                    "\\int x^n dx = \\frac{x^{n+1}}{n+1} + C",
                    "E = mc^2"
                ],
                questions: [
                    {
                        question: "Calcula la derivada de la siguiente función:",
                        formula: "f(x) = 3x^2 + 5x",
                        options: ["6x + 5", "3x + 5", "6x", "x^2 + 5"],
                        correctIndex: 0
                    },
                    {
                        question: "¿Cuál es el resultado de esta integral definida?",
                        formula: "\\int_{0}^{2} x dx",
                        options: ["1", "2", "4", "0.5"],
                        correctIndex: 1
                    }
                ]
            };
            
            try {
                const quizRef = doc(db, "subjects", subjectId, "topics", topicId, "quizzes_data", quizId);
                const snap = await getDoc(quizRef);

                if (snap.exists()) {
                    setQuizData({ ...snap.data(), id: snap.id });
                } else {
                    setQuizData(MOCK_DATA);
                }
            } catch (error) {
                console.error("Error cargando Quiz (Usando Demo):", error);
                setQuizData(MOCK_DATA);
            } finally {
                setLoading(false);
                setViewState('review');
            }
        };

        loadData();
    }, [user, subjectId, topicId, quizId, navigate]);

    // --- GUARDADO EN FIREBASE ---
    const saveQuizResult = async (score, correct, total) => {
        if (!user) return;
        setIsSaving(true);
        try {
            // Creamos un ID único para este intento: quizId_userId
            // O usamos una colección 'attempts' si quieres guardar múltiples intentos.
            // Aquí guardamos/sobreescribimos el mejor resultado o el último.
            const resultRef = doc(db, "subjects", subjectId, "topics", topicId, "quiz_results", `${quizId}_${user.uid}`);
            
            await setDoc(resultRef, {
                userId: user.uid,
                quizId: quizId,
                score: score,
                correctAnswers: correct,
                totalQuestions: total,
                completedAt: serverTimestamp(),
                passed: score >= 50
            }, { merge: true }); // Merge para no borrar otros campos si los hubiera

            console.log("✅ Puntuación guardada correctamente");
        } catch (error) {
            console.error("❌ Error guardando puntuación:", error);
            // No bloqueamos la UI si falla el guardado, solo logueamos
        } finally {
            setIsSaving(false);
        }
    };

    // --- LÓGICA DEL JUEGO ---
    const handleAnswerSelect = (index) => setSelectedAnswer(index);

    const handleNext = async () => {
        // Calcular aciertos
        const isCorrect = selectedAnswer === quizData.questions[currentStep].correctIndex;
        const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
        setCorrectCount(newCorrectCount);

        // Si NO es la última pregunta, avanzamos
        if (currentStep < quizData.questions.length - 1) {
            setCurrentStep(currentStep + 1);
            setSelectedAnswer(null);
        } 
        // Si ES la última pregunta, finalizamos
        else {
            const totalQuestions = quizData.questions.length;
            const score = Math.round((newCorrectCount / totalQuestions) * 100);
            
            setFinalScore(score);
            setViewState('results');
            
            // Guardamos en Firebase
            await saveQuizResult(score, newCorrectCount, totalQuestions);
        }
    };

    // --- RENDERIZADO ---

    if (loading || viewState === 'loading') return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <RefreshCcw className={`w-12 h-12 text-${accentColor}-600 animate-spin mb-4`} />
            <p className="text-slate-500 font-medium animate-pulse">Sincronizando...</p>
        </div>
    );

    // VISTA REPASO
    if (viewState === 'review') return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header Simple */}
            <div className="pt-8 px-6 mb-8 flex justify-between items-center max-w-3xl mx-auto">
                {/* FLECHA ATRÁS CORREGIDA */}
                <button onClick={goToTopic} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-700 hover:shadow-sm cursor-pointer">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className={`px-3 py-1 rounded-full bg-${accentColor}-50 text-${accentColor}-700 text-xs font-bold uppercase tracking-wider border border-${accentColor}-100`}>
                    Modo Estudio
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 animate-in slide-in-from-bottom-8 duration-500">
                <div className="text-center mb-10">
                    <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-${accentColor}-100 border border-slate-100`}>
                        <Sigma className={`w-8 h-8 text-${accentColor}-500`} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                        Fórmulas Clave
                    </h1>
                    <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
                        Repasa estos conceptos antes de iniciar el test. <br/>
                        <span className={`text-${accentColor}-600 font-bold`}>Son necesarios para resolver los ejercicios.</span>
                    </p>
                </div>

                <div className="space-y-4 mb-12">
                    {quizData?.formulas?.map((f, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <span className="absolute -right-2 -bottom-4 text-8xl font-black text-slate-50 opacity-50 select-none group-hover:text-slate-100 transition-colors">
                                {i + 1}
                            </span>
                            
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`w-8 h-8 rounded-full bg-${accentColor}-50 flex items-center justify-center text-${accentColor}-600 font-bold text-sm shrink-0`}>
                                    {i + 1}
                                </div>
                                <div className="text-xl text-slate-700 overflow-x-auto py-2 w-full">
                                    <BlockMath math={f} />
                                </div>
                            </div>
                        </div>
                    ))}
                     {(!quizData?.formulas || quizData.formulas.length === 0) && (
                        <div className="text-slate-400 text-center italic py-8 bg-white rounded-3xl border border-dashed border-slate-200">
                            No se detectaron fórmulas para repasar.
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-20">
                <div className="max-w-2xl mx-auto">
                    <button 
                        onClick={() => setViewState('quiz')}
                        className={`w-full py-5 bg-slate-900 hover:bg-${accentColor}-600 text-white rounded-[2rem] font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 cursor-pointer`}
                    >
                        <BookOpen className="w-5 h-5" />
                        Comenzar Test Ahora
                    </button>
                </div>
            </div>
        </div>
    );

    // VISTA RESULTADOS
    if (viewState === 'results') return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-10 text-center border border-slate-100 animate-in zoom-in-95 duration-500">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${finalScore >= 50 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <Award className={`w-12 h-12 ${finalScore >= 50 ? 'text-green-600' : 'text-red-500'}`} />
                </div>
                
                <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
                    {finalScore >= 80 ? '¡Excelente!' : finalScore >= 50 ? '¡Bien hecho!' : 'A repasar...'}
                </h2>
                <p className="text-slate-500 mb-8 font-medium">
                    Has acertado <span className="text-slate-900 font-bold">{correctCount}</span> de {quizData.questions.length} preguntas.
                    {isSaving && <span className="block text-xs mt-2 text-slate-400 animate-pulse">Guardando progreso...</span>}
                </p>
                
                <div className="bg-slate-50 rounded-3xl p-8 mb-8 border border-slate-100 relative overflow-hidden group">
                    <div className={`absolute bottom-0 left-0 h-1.5 w-full ${finalScore >= 50 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div className="text-6xl font-black text-slate-800 mb-1 tracking-tighter">{finalScore}<span className="text-3xl text-slate-400 ml-1">%</span></div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Puntuación Final</div>
                </div>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => {
                            setViewState('review');
                            setCurrentStep(0);
                            setCorrectCount(0);
                            setFinalScore(0);
                            setSelectedAnswer(null);
                        }}
                        className="w-full py-4 bg-white border-2 border-slate-100 hover:border-slate-300 text-slate-700 rounded-2xl font-bold transition-all cursor-pointer hover:bg-slate-50"
                    >
                        Intentar de nuevo
                    </button>
                    {/* BOTÓN VOLVER AL TEMA CORREGIDO */}
                    <button 
                        onClick={goToTopic}
                        className={`w-full py-4 bg-slate-900 hover:bg-${accentColor}-600 text-white rounded-2xl font-bold transition-all shadow-lg cursor-pointer`}
                    >
                        Volver al Tema
                    </button>
                </div>
            </div>
        </div>
    );

    // VISTA JUEGO
    const q = quizData.questions[currentStep];
    const progress = ((currentStep + 1) / quizData.questions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50 pb-28 font-sans text-slate-900">
            {/* HEADER FLOTANTE */}
            <div className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-8 py-4 transition-all supports-[backdrop-filter]:bg-slate-50/60">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    {/* BOTÓN CERRAR (X) CORREGIDO */}
                    <button onClick={goToTopic} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-700 shadow-sm border border-transparent hover:border-slate-100 cursor-pointer">
                        <X className="w-6 h-6" />
                    </button>
                    
                    <div className="flex-1 max-w-md">
                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                            <span>Progreso</span>
                            <span>{currentStep + 1} / {quizData.questions.length}</span>
                        </div>
                        <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                                className={`h-full bg-${accentColor}-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className={`hidden md:flex items-center gap-2 text-${accentColor}-700 font-bold bg-${accentColor}-50 px-4 py-2 rounded-xl border border-${accentColor}-100 shadow-sm`}>
                        <Timer className="w-4 h-4" />
                        <span className="text-sm">En curso</span>
                    </div>
                </div>
            </div>

            {/* AREA PRINCIPAL */}
            <main className="pt-8 px-6 max-w-3xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
                <div className="mb-8">
                    <div className={`inline-flex items-center gap-2 text-${accentColor}-600 bg-${accentColor}-50 px-3 py-1 rounded-full border border-${accentColor}-100 font-bold text-xs uppercase tracking-widest mb-6`}>
                        <Brain className="w-3.5 h-3.5" />
                        <span>Pregunta {currentStep + 1}</span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-8">
                        {q.question}
                    </h2>

                    {q.formula && (
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-10 text-center overflow-x-auto relative group hover:border-slate-300 transition-colors">
                            <div className="absolute top-4 left-4 text-slate-300 group-hover:text-slate-400 transition-colors">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <div className="text-xl md:text-2xl text-slate-800 py-2">
                                <BlockMath math={q.formula} />
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {q.options.map((option, idx) => {
                            const isSelected = selectedAnswer === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswerSelect(idx)}
                                    className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-5 outline-none cursor-pointer
                                        ${isSelected 
                                            ? `border-${accentColor}-600 bg-${accentColor}-50/50 shadow-md scale-[1.01]` 
                                            : 'border-white bg-white hover:border-slate-200 hover:bg-slate-50 shadow-sm hover:shadow-md'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm transition-colors shadow-sm
                                        ${isSelected ? `bg-${accentColor}-600 text-white` : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>

                                    <div className={`flex-1 text-lg font-medium ${isSelected ? `text-${accentColor}-900` : 'text-slate-700'}`}>
                                        <div className="katex-render-wrapper">
                                            {option.includes('\\') || option.includes('^') ? <InlineMath math={option} /> : option}
                                        </div>
                                    </div>

                                    <div className={`transition-all duration-300 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50 w-0'}`}>
                                        <CheckCircle2 className={`w-6 h-6 text-${accentColor}-600`} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* BOTÓN NEXT FIJO */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent z-20 backdrop-blur-[2px]">
                <div className="max-w-3xl mx-auto">
                    <button
                        disabled={selectedAnswer === null}
                        onClick={handleNext}
                        className={`w-full py-4 md:py-5 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl cursor-pointer
                            ${selectedAnswer !== null 
                                ? `bg-slate-900 text-white hover:bg-${accentColor}-600 hover:-translate-y-1 hover:shadow-${accentColor}-500/30` 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        {currentStep === quizData.questions.length - 1 ? 'Finalizar Test' : 'Siguiente Pregunta'}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Quizzes;