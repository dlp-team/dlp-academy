import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Timer, CheckCircle2, XCircle, ArrowRight, 
    RefreshCcw, Award, Sigma, X, Brain, BookOpen, Sparkles,
    TrendingUp, Target, Zap, Star, Trophy
} from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

// Importamos el Header Global
import Header from '../components/layout/Header';

import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

// --- COMPONENTES UI REUTILIZABLES ---

// 1. Confeti CSS
const ConfettiEffect = ({ triggerKey, accentColor = '#4f46e5' }) => {
    if (!triggerKey) return null;

    const pieces = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => {
            const angle = Math.random() * 360;
            const velocity = 60 + Math.random() * 100; 
            const tx = Math.cos(angle * Math.PI / 180) * velocity;
            const ty = (Math.sin(angle * Math.PI / 180) * velocity) - 60; 

            return {
                id: i,
                left: 50, 
                top: 50,
                color: Math.random() > 0.5 ? '#FBBF24' : accentColor, 
                size: Math.random() * 6 + 4,
                tx: `${tx}px`,
                ty: `${ty}px`,
                rot: `${Math.random() * 360}deg`,
                delay: `${Math.random() * 0.2}s`,
                duration: `${0.8 + Math.random() * 0.4}s`
            };
        });
    }, [triggerKey, accentColor]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center overflow-hidden">
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className="absolute rounded-full animate-burst"
                    style={{
                        backgroundColor: piece.color,
                        width: `${piece.size}px`,
                        height: `${piece.size}px`,
                        '--tx': piece.tx,
                        '--ty': piece.ty,
                        '--rot': piece.rot,
                        animationDuration: piece.duration,
                        animationDelay: piece.delay,
                        left: '50%',
                        top: '40%'
                    }}
                />
            ))}
            <style>{`
                @keyframes burst {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    20% { opacity: 1; }
                    100% { 
                        transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--rot)) scale(0); 
                        opacity: 0; 
                    }
                }
                .animate-burst {
                    animation-name: burst;
                    animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
                    animation-fill-mode: forwards;
                }
            `}</style>
        </div>
    );
};

// 2. Visualizador de Fórmulas
const FormulaDisplay = ({ formula, size = 'text-2xl' }) => (
    <div className={`${size} font-serif text-slate-800 select-text overflow-x-auto py-2`}>
        <BlockMath math={formula} />
    </div>
);

// --- COMPONENTE PRINCIPAL ---

const Quizzes = ({ user }) => {
    const { subjectId, topicId, quizId } = useParams();
    const navigate = useNavigate();

    // --- ESTADOS ---
    const [loading, setLoading] = useState(true);
    const [viewState, setViewState] = useState('loading'); 
    const [quizData, setQuizData] = useState(null);
    
    // Configuración Visual
    const [accentColor, setAccentColor] = useState('#4f46e5');
    const [accentLight, setAccentLight] = useState('#eef2ff'); 

    // Juego
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answerStatus, setAnswerStatus] = useState('idle');
    const [correctCount, setCorrectCount] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    
    // Control de Confeti
    const [confettiTrigger, setConfettiTrigger] = useState(0);
    
    const [isSaving, setIsSaving] = useState(false);

    // --- NAVEGACIÓN ---
    const handleGoBack = () => navigate(`/home/subject/${subjectId}`);

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const loadData = async () => {
            const MOCK_DATA = {
                title: "Test de Prueba",
                subtitle: "Matemáticas Básicas",
                formulas: [
                    { display: "E = mc^2", description: "Relatividad" },
                    { display: "a^2 + b^2 = c^2", description: "Pitágoras" }
                ],
                questions: [
                    {
                        question: "Calcula la derivada de 3x^2:",
                        formula: "f(x) = 3x^2",
                        options: ["6x", "3x", "x^2", "6"],
                        correctIndex: 0
                    },
                    {
                        question: "¿Integral de x dx?",
                        formula: "\\int x dx",
                        options: ["1", "x^2/2", "x", "2x"],
                        correctIndex: 1
                    }
                ]
            };

            if (!user) return;

            try {
                // 1. Obtener Color
                const topicRef = doc(db, "subjects", subjectId, "topics", topicId);
                const topicSnap = await getDoc(topicRef);
                
                if (topicSnap.exists()) {
                    const tData = topicSnap.data();
                    const colorMap = {
                        'blue': '#2563eb', 'indigo': '#4f46e5', 'purple': '#9333ea', 
                        'green': '#16a34a', 'red': '#dc2626', 'orange': '#ea580c',
                        'amber': '#d97706', 'teal': '#0d9488', 'cyan': '#0891b2'
                    };
                    
                    if (tData.color) {
                        const cleanColorName = tData.color.split(' ')[0].replace('from-', '').split('-')[0];
                        if (colorMap[cleanColorName]) {
                            setAccentColor(colorMap[cleanColorName]);
                            setAccentLight(`${colorMap[cleanColorName]}15`);
                        }
                    }
                }

                // 2. Cargar Quiz
                if(quizId && quizId !== 'undefined') {
                    const quizRef = doc(db, "subjects", subjectId, "topics", topicId, "quizzes_data", quizId);
                    const snap = await getDoc(quizRef);
                    if (snap.exists()) {
                        const data = snap.data();
                        const normalizedFormulas = (data.formulas || []).map(f => 
                            typeof f === 'string' ? { display: f, description: 'Fórmula' } : f
                        );
                        setQuizData({ ...data, formulas: normalizedFormulas });
                    } else {
                        setQuizData(MOCK_DATA);
                    }
                } else {
                    setQuizData(MOCK_DATA);
                }

            } catch (error) {
                console.error("Error cargando (Usando Fallback):", error);
                setQuizData(MOCK_DATA);
            } finally {
                setLoading(false);
                setViewState('review');
            }
        };

        loadData();
    }, [user, subjectId, topicId, quizId]);

    // --- LÓGICA DEL JUEGO ---
    
    const triggerConfetti = () => {
        setConfettiTrigger(prev => prev + 1);
        setTimeout(() => setConfettiTrigger(0), 2000); 
    };

    const handleAnswerSelect = (index) => {
        if (answerStatus !== 'idle') return;
        setSelectedAnswer(index);
    };

    const handleCheckAnswer = () => {
        if (answerStatus !== 'idle' || selectedAnswer === null) return;
        const isCorrect = selectedAnswer === quizData.questions[currentStep].correctIndex;
        
        if (isCorrect) {
            setAnswerStatus('correct');
            setCorrectCount(prev => prev + 1);
            triggerConfetti();
        } else {
            setAnswerStatus('incorrect');
            if (navigator.vibrate) navigator.vibrate(200);
        }
    };

    const handleNextQuestion = async () => {
        const total = quizData.questions.length;
        if (currentStep < total - 1) {
            setCurrentStep(prev => prev + 1);
            setSelectedAnswer(null);
            setAnswerStatus('idle');
        } else {
            // FIN DEL TEST
            const score = Math.round((correctCount / total) * 100);
            setFinalScore(score);
            setViewState('results');
            
            if (score >= 50) {
                setTimeout(() => triggerConfetti(), 300);
            }
            
            try {
                const resultRef = doc(db, "subjects", subjectId, "topics", topicId, "quiz_results", `${quizId}_${user.uid}`);
                await setDoc(resultRef, {
                    userId: user.uid,
                    score, correctAnswers: correctCount, totalQuestions: total,
                    completedAt: serverTimestamp(),
                    passed: score >= 50
                }, { merge: true });
            } catch (e) { console.error(e); }
        }
    };

    const handleRetry = () => {
        setViewState('review');
        setCurrentStep(0);
        setCorrectCount(0);
        setFinalScore(0);
        setSelectedAnswer(null);
        setAnswerStatus('idle');
        setConfettiTrigger(0);
    };

    // --- RENDERIZADO GLOBAL ---

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20">
            <Header user={user} />
            <RefreshCcw className="w-12 h-12 text-slate-300 animate-spin mb-4" />
            <p className="text-slate-500 font-medium tracking-wide">Sincronizando...</p>
        </div>
    );

    if (!quizData) return (
        <div className="min-h-screen bg-slate-50 pt-20">
            <Header user={user} />
            <div className="flex flex-col items-center justify-center p-6 text-center h-[80vh]">
                <XCircle className="w-12 h-12 text-red-400 mb-4" />
                <h2 className="text-xl font-bold text-slate-800">Error cargando el test</h2>
                <button onClick={handleGoBack} className="mt-4 text-indigo-600 underline">Volver</button>
            </div>
        </div>
    );

    // Contenedor principal con padding-top para el Header
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pt-20">
            {/* Header Global */}
            <Header user={user} />

            {/* 1. VISTA DE REPASO */}
            {viewState === 'review' && (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pb-20">
                    {/* Header Sticky ajustado a top-20 */}
                    <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-20 z-40">
                        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                            <button onClick={handleGoBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <ChevronLeft className="w-6 h-6 text-slate-600" />
                            </button>
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                                <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Modo Repaso</span>
                            </div>
                            <div className="w-10"></div>
                        </div>
                    </div>

                    <div className="max-w-3xl mx-auto px-6 py-12">
                        <div className="text-center mb-12">
                            <div 
                                className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] mb-6 shadow-2xl shadow-slate-200 animate-float"
                                style={{ backgroundColor: accentColor }}
                            >
                                <Brain className="w-12 h-12 text-white" />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">
                                {quizData.title}
                            </h1>
                            <p className="text-xl text-slate-500 font-medium">{quizData.subtitle}</p>
                            
                            <div className="flex items-center justify-center gap-6 mt-8 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4" style={{ color: accentColor }} />
                                    {quizData.questions.length} Preguntas
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 mb-12">
                            {quizData.formulas?.map((formula, idx) => (
                                <div key={idx} className="group relative bg-white rounded-3xl p-8 border-2 border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-start gap-6">
                                        <div 
                                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-md shrink-0 mt-1"
                                            style={{ backgroundColor: accentColor }}
                                        >
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <FormulaDisplay formula={formula.display} size="text-2xl md:text-3xl" />
                                            {formula.description && (
                                                <p className="text-sm text-slate-400 mt-2 font-bold uppercase tracking-wider">{formula.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setViewState('quiz')}
                            className="w-full text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                            style={{ backgroundColor: accentColor, boxShadow: `0 20px 40px -10px ${accentColor}60` }}
                        >
                            <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            Comenzar Desafío
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                    <style>{`
                        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(1deg); } 50% { transform: translateY(-10px) rotate(-1deg); } }
                        .animate-float { animation: float 6s ease-in-out infinite; }
                    `}</style>
                </div>
            )}

            {/* 2. VISTA TEST */}
            {viewState === 'quiz' && (
                <div className="min-h-screen bg-slate-50 pb-32">
                    <ConfettiEffect triggerKey={confettiTrigger} accentColor={accentColor} />
                    
                    {/* Header Progreso Sticky top-20 */}
                    <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-20 z-40 px-6 py-4">
                        <div className="max-w-4xl mx-auto flex items-center gap-6">
                            <button onClick={() => setViewState('review')} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                            <div className="flex-1">
                                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                                    <span>Progreso</span>
                                    <span>{currentStep + 1} / {quizData.questions.length}</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${((currentStep) / quizData.questions.length) * 100}%`, backgroundColor: accentColor }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <main className="pt-12 px-6 max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-white border border-slate-200 text-slate-500 mb-8 shadow-sm">
                                <TrendingUp className="w-3 h-3" style={{ color: accentColor }} />
                                <span>Pregunta {currentStep + 1}</span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-8">
                                {quizData.questions[currentStep].question}
                            </h2>

                            {quizData.questions[currentStep].formula && (
                                <div className="bg-white rounded-[2rem] p-10 border-2 border-slate-100 shadow-xl shadow-slate-200/50 mb-10 text-center">
                                    <BlockMath math={quizData.questions[currentStep].formula} />
                                </div>
                            )}

                            <div className="space-y-4">
                                {quizData.questions[currentStep].options.map((option, idx) => {
                                    let style = { borderColor: '#e2e8f0', backgroundColor: 'white', color: '#334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' };
                                    
                                    if (answerStatus === 'idle' && selectedAnswer === idx) {
                                        style = { borderColor: accentColor, backgroundColor: accentLight, color: accentColor, boxShadow: `0 0 0 2px ${accentColor}20` };
                                    } else if (answerStatus !== 'idle') {
                                        if (idx === quizData.questions[currentStep].correctIndex) {
                                            style = { borderColor: '#22c55e', backgroundColor: '#f0fdf4', color: '#15803d' };
                                        } else if (selectedAnswer === idx && answerStatus === 'incorrect') {
                                            style = { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#b91c1c' };
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            disabled={answerStatus !== 'idle'}
                                            onClick={() => handleAnswerSelect(idx)}
                                            className="group w-full p-6 rounded-2xl border-2 text-left transition-all flex items-center gap-6 hover:scale-[1.01] active:scale-[0.99]"
                                            style={style}
                                        >
                                            <div 
                                                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border transition-colors shrink-0"
                                                style={{ 
                                                    borderColor: (answerStatus === 'idle' && selectedAnswer === idx) ? accentColor : 'transparent',
                                                    backgroundColor: (answerStatus === 'idle' && selectedAnswer === idx) ? accentColor : '#f8fafc',
                                                    color: (answerStatus === 'idle' && selectedAnswer === idx) ? 'white' : '#94a3b8'
                                                }}
                                            >
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <div className="flex-1 text-lg font-bold">
                                                <div className="katex-render-wrapper">
                                                    {option.includes('\\') || option.includes('^') ? <InlineMath math={option} /> : option}
                                                </div>
                                            </div>
                                            {answerStatus !== 'idle' && idx === quizData.questions[currentStep].correctIndex && <CheckCircle2 className="w-8 h-8 text-green-500 animate-bounce-in" />}
                                            {answerStatus === 'incorrect' && selectedAnswer === idx && <XCircle className="w-8 h-8 text-red-500 animate-shake" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </main>

                    <div className={`fixed bottom-0 left-0 right-0 p-6 border-t backdrop-blur-xl transition-colors duration-500 z-50 ${
                        answerStatus === 'correct' ? 'bg-green-50/95 border-green-200' : 
                        answerStatus === 'incorrect' ? 'bg-red-50/95 border-red-200' : 
                        'bg-white/95 border-slate-200'
                    }`}>
                        <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
                            <div className="hidden md:block">
                                {answerStatus === 'correct' && <div className="flex items-center gap-3 text-green-700 font-bold text-xl"><CheckCircle2/> ¡Correcto!</div>}
                                {answerStatus === 'incorrect' && <div className="flex items-center gap-3 text-red-700 font-bold text-xl"><XCircle/> Incorrecto</div>}
                            </div>

                            <button
                                disabled={selectedAnswer === null && answerStatus === 'idle'}
                                onClick={answerStatus === 'idle' ? handleCheckAnswer : handleNextQuestion}
                                className="flex-1 md:flex-none md:min-w-[240px] h-16 rounded-2xl font-black text-xl text-white transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ 
                                    backgroundColor: answerStatus === 'idle' 
                                        ? (selectedAnswer !== null ? accentColor : '#cbd5e1') 
                                        : (answerStatus === 'correct' ? '#22c55e' : '#ef4444') 
                                }}
                            >
                                {answerStatus === 'idle' ? 'Comprobar' : (currentStep === quizData.questions.length - 1 ? 'Ver Resultados' : 'Continuar')}
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    <style>{`
                        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
                        .animate-shake { animation: shake 0.3s ease-out; }
                        .animate-bounce-in { animation: bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                        @keyframes bounce { 0% { transform: scale(0); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
                    `}</style>
                </div>
            )}

            {/* 3. VISTA RESULTADOS */}
            {viewState === 'results' && (
                <div className="flex items-center justify-center p-6 h-[80vh]">
                    <ConfettiEffect triggerKey={confettiTrigger} accentColor={accentColor} />
                    <div className="max-w-lg w-full bg-white rounded-[3rem] shadow-2xl p-10 text-center border-2 border-slate-100 animate-scale-in relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-32 opacity-10 ${finalScore >= 50 ? 'bg-green-500' : 'bg-red-500'}`}></div>

                        <div className={`relative w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center ${finalScore >= 50 ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 'bg-gradient-to-br from-orange-400 to-red-500'} shadow-2xl shadow-slate-300`}>
                            {finalScore >= 50 ? <Trophy className="w-16 h-16 text-white" /> : <Target className="w-16 h-16 text-white" />}
                        </div>
                        
                        <h2 className="text-7xl font-black text-slate-900 mb-2 tracking-tighter">{finalScore}%</h2>
                        <p className={`text-xl font-bold mb-10 ${finalScore >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                            {finalScore >= 50 ? '¡Desafío Completado!' : 'Sigue practicando'}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                <div className="text-3xl font-black text-slate-900">{correctCount}</div>
                                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Aciertos</div>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                <div className="text-3xl font-black text-slate-900">{quizData.questions.length}</div>
                                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button 
                                onClick={handleRetry}
                                className="w-full py-5 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl font-bold text-lg transition-all"
                            >
                                Intentar de nuevo
                            </button>
                            <button 
                                onClick={handleGoBack}
                                className="w-full py-5 text-white rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                                style={{ backgroundColor: accentColor }}
                            >
                                Volver al Tema
                            </button>
                        </div>
                    </div>
                    <style>{`
                        @keyframes scale-in { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
                        .animate-scale-in { animation: scale-in 0.4s ease-out; }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default Quizzes;