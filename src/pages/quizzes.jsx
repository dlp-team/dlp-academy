import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Timer, CheckCircle2, XCircle, ArrowRight, 
    RefreshCcw, Award, Sigma, X, Brain, HelpCircle, Volume2 
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import confetti from 'canvas-confetti'; // npm install canvas-confetti

import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

const Quizzes = ({ user }) => {
    const { subjectId, topicId, quizId } = useParams();
    const navigate = useNavigate();

    // --- ESTADOS ---
    const [loading, setLoading] = useState(true);
    const [viewState, setViewState] = useState('loading'); // loading, review, quiz, results
    const [quizData, setQuizData] = useState(null);
    
    // Configuración Visual
    const [accentColor, setAccentColor] = useState('indigo'); 
    const [gradientClass, setGradientClass] = useState('from-indigo-500 to-purple-600');

    // Estados del Juego
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answerStatus, setAnswerStatus] = useState('idle'); // idle, correct, incorrect
    const [correctCount, setCorrectCount] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [streak, setStreak] = useState(0); // Racha de aciertos

    // --- EFECTOS DE SONIDO (Simulados - Implementar con useSound si deseas) ---
    const playSound = (type) => {
        // Aquí podrías integrar 'use-sound' para reproducir 'pop.mp3', 'success.mp3', etc.
        // console.log(`Playing sound: ${type}`);
    };

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            try {
                // 1. Cargar Tema para Estilos
                const topicRef = doc(db, "subjects", subjectId, "topics", topicId);
                const topicSnap = await getDoc(topicRef);
                
                if (topicSnap.exists()) {
                    const tData = topicSnap.data();
                    if (tData.color) {
                        setGradientClass(tData.color);
                        const firstPart = tData.color.split(' ')[0];
                        const cleanColor = firstPart.replace('from-', '').split('-')[0];
                        if (cleanColor) setAccentColor(cleanColor);
                    }
                }

                // 2. Cargar Quiz o Mock
                const MOCK_DATA = {
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
            
                const quizRef = doc(db, "subjects", subjectId, "topics", topicId, "quizzes_data", quizId);
                const snap = await getDoc(quizRef);

                if (snap.exists()) {
                    setQuizData(snap.data());
                } else {
                    setQuizData(MOCK_DATA);
                }
            } catch (error) {
                console.error("Error cargando:", error);
            } finally {
                setLoading(false);
                setViewState('review');
            }
        };

        loadData();
    }, [user, subjectId, topicId, quizId]);

    // --- LÓGICA DEL JUEGO "PRO" ---

    // Manejo de teclado (Accesibilidad)
    useEffect(() => {
        if (viewState !== 'quiz' || answerStatus !== 'idle') return;

        const handleKeyDown = (e) => {
            const key = parseInt(e.key);
            if (key >= 1 && key <= 4) {
                const index = key - 1;
                if (quizData.questions[currentStep].options[index]) {
                    handleAnswerSelect(index);
                }
            }
            if (e.key === 'Enter' && selectedAnswer !== null) {
                handleCheckAnswer();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewState, answerStatus, selectedAnswer, currentStep, quizData]);

    const handleAnswerSelect = (index) => {
        if (answerStatus !== 'idle') return; // Bloquear cambios si ya se validó
        setSelectedAnswer(index);
        playSound('pop');
    };

    const handleCheckAnswer = () => {
        const isCorrect = selectedAnswer === quizData.questions[currentStep].correctIndex;
        
        if (isCorrect) {
            setAnswerStatus('correct');
            setCorrectCount(prev => prev + 1);
            setStreak(prev => prev + 1);
            playSound('success');
            // Mini confeti al acertar
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#22c55e', '#4ade80'] // Verdes
            });
        } else {
            setAnswerStatus('incorrect');
            setStreak(0);
            playSound('error');
            // Vibración en móviles (Haptic feedback)
            if (navigator.vibrate) navigator.vibrate(200);
        }
    };

    const handleNextQuestion = () => {
        if (currentStep < quizData.questions.length - 1) {
            setCurrentStep(prev => prev + 1);
            setSelectedAnswer(null);
            setAnswerStatus('idle');
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        // Cálculo final asegurando que correctCount está actualizado
        // Nota: En react el estado puede tardar un tick, pero aquí usamos lógica directa si es el último paso
        const score = Math.round((correctCount / quizData.questions.length) * 100); 
        // Si la última fue correcta, el estado correctCount ya se actualizó antes de llamar a handleNextQuestion
        
        // Recalcular por seguridad visual usando el estado actual
        // (En producción usarías un ref o useEffect para garantizar sincronía total)
        const finalCalc = Math.round(((answerStatus === 'correct' ? correctCount : correctCount) / quizData.questions.length) * 100);
        
        setFinalScore(finalCalc);
        setViewState('results');
        playSound('finish');
        
        if (finalCalc >= 50) {
            triggerBigConfetti();
        }
    };

    const triggerBigConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const random = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.1, 0.3), y: random(0.1, 0.3) } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.7, 0.9), y: random(0.7, 0.9) } }));
        }, 250);
    };

    // --- RENDERIZADO ---

    if (loading || viewState === 'loading') return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <div className="relative">
                <div className={`absolute inset-0 bg-${accentColor}-500 blur-xl opacity-20 rounded-full animate-pulse`}></div>
                <RefreshCcw className={`w-16 h-16 text-${accentColor}-600 animate-spin relative z-10`} />
            </div>
            <p className="text-slate-500 font-bold mt-6 animate-pulse tracking-widest text-sm uppercase">Preparando Entorno...</p>
        </div>
    );

    // VISTA REPASO (Intro)
    if (viewState === 'review') return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans relative overflow-hidden">
            {/* Fondo decorativo */}
            <div className={`absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-${accentColor}-600/30 rounded-full blur-3xl`}></div>
            <div className={`absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-3xl`}></div>

            <div className="max-w-2xl w-full bg-white/10 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center text-center mb-10">
                    <div className={`w-20 h-20 bg-gradient-to-br ${gradientClass} rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-${accentColor}-500/40 transform rotate-3 hover:rotate-0 transition-all duration-500`}>
                        <Sigma className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
                        Prepárate
                    </h1>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Revisa estas fórmulas clave. <br/>
                        Son tu herramienta para superar el desafío.
                    </p>
                </div>

                <div className="space-y-4 mb-12">
                    {quizData?.formulas?.map((f, i) => (
                        <div key={i} className="bg-slate-800/60 border border-white/5 p-5 rounded-2xl flex items-center justify-center hover:bg-slate-800/80 transition-all duration-300 group relative overflow-hidden">
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${gradientClass}`}></div>
                            <span className="text-slate-500 text-xs font-bold absolute left-4 opacity-50">#{i+1}</span>
                            <div className="text-white text-xl overflow-x-auto py-2 px-4">
                                <BlockMath math={f} />
                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={() => setViewState('quiz')}
                    className={`w-full py-5 bg-gradient-to-r ${gradientClass} text-white rounded-2xl font-bold text-xl transition-all shadow-xl shadow-${accentColor}-600/30 hover:scale-[1.02] active:scale-[0.98] ring-4 ring-transparent hover:ring-${accentColor}-500/30`}
                >
                    ¡Empezar Desafío!
                </button>
            </div>
        </div>
    );

    // VISTA RESULTADOS
    if (viewState === 'results') return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Fondo animado sutil */}
            <div className={`absolute inset-0 bg-gradient-to-br from-${accentColor}-50/50 to-purple-50/50`}></div>

            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 text-center border border-white/50 relative z-10 animate-in slide-in-from-bottom-10 duration-700">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ${finalScore >= 50 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <Award className={`w-16 h-16 ${finalScore >= 50 ? 'text-green-500 drop-shadow-lg' : 'text-red-500'}`} />
                </div>
                
                <h2 className="text-5xl font-black text-slate-900 mb-3 tracking-tight">
                    {finalScore >= 80 ? '¡Legendario!' : finalScore >= 50 ? '¡Bien hecho!' : '¡Sigue así!'}
                </h2>
                <p className="text-slate-500 mb-10 font-medium text-lg">
                    Has dominado {correctCount} de {quizData.questions.length} conceptos.
                </p>
                
                <div className="bg-slate-50 rounded-3xl p-8 mb-10 border border-slate-200 relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 h-2 w-full transition-all duration-1000 ${finalScore >= 50 ? 'bg-green-500' : 'bg-red-500'}`} style={{width: `${finalScore}%`}}></div>
                    <div className="text-7xl font-black text-slate-800 mb-2 tracking-tighter group-hover:scale-110 transition-transform duration-500">
                        {finalScore}<span className="text-4xl text-slate-400 align-top">%</span>
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Puntuación Final</div>
                </div>

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => {
                            setViewState('review');
                            setCurrentStep(0);
                            setCorrectCount(0);
                            setFinalScore(0);
                            setSelectedAnswer(null);
                            setAnswerStatus('idle');
                            setStreak(0);
                        }}
                        className="w-full py-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl font-bold transition-all hover:bg-slate-50"
                    >
                        Reintentar
                    </button>
                    <button 
                        onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}`)}
                        className={`w-full py-4 bg-slate-900 hover:bg-${accentColor}-600 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1`}
                    >
                        Continuar Aprendiendo
                    </button>
                </div>
            </div>
        </div>
    );

    // VISTA JUEGO (GAME LOOP)
    const q = quizData.questions[currentStep];
    const progress = ((currentStep) / quizData.questions.length) * 100;

    // Colores dinámicos para los botones de estado
    const getOptionStyles = (idx) => {
        // 1. Si no hemos respondido aún
        if (answerStatus === 'idle') {
            return selectedAnswer === idx 
                ? `border-${accentColor}-600 bg-${accentColor}-50 ring-2 ring-${accentColor}-200`
                : `border-slate-200 bg-white hover:border-${accentColor}-300 hover:bg-slate-50`;
        }

        // 2. Si ya respondimos (Feedback)
        if (idx === q.correctIndex) {
            return "border-green-500 bg-green-50 ring-2 ring-green-200"; // Respuesta correcta (siempre verde)
        }
        if (selectedAnswer === idx && answerStatus === 'incorrect') {
            return "border-red-500 bg-red-50 ring-2 ring-red-200 animate-shake"; // Tu error (rojo)
        }
        return "border-slate-100 bg-slate-50 opacity-50"; // Las demás apagadas
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-32 font-sans text-slate-900 selection:bg-indigo-100">
            {/* HEADER PROGRESO */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-8 py-4 transition-all">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700">
                        <X className="w-6 h-6" />
                    </button>
                    
                    <div className="flex-1 max-w-md relative">
                        {/* Barra de Vida/Progreso tipo videojuego */}
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div 
                                className={`h-full bg-gradient-to-r ${gradientClass} rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        {streak > 1 && (
                            <div className="absolute -top-6 right-0 text-xs font-black text-orange-500 animate-bounce">
                                🔥 {streak} Racha!
                            </div>
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-2 font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                        <span className="text-xs font-bold">PREGUNTA</span>
                        <span className="text-slate-900 font-black">{currentStep + 1}<span className="text-slate-400">/{quizData.questions.length}</span></span>
                    </div>
                </div>
            </div>

            {/* AREA DE JUEGO */}
            <main className="pt-10 px-6 max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug mb-8">
                        {q.question}
                    </h2>

                    {q.formula && (
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-10 text-center relative group hover:shadow-md transition-shadow">
                            <div className="absolute top-4 left-4 text-slate-200 group-hover:text-indigo-200 transition-colors">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <div className="text-xl md:text-3xl text-slate-800 py-2 overflow-x-auto">
                                <BlockMath math={q.formula} />
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {q.options.map((option, idx) => (
                            <button
                                key={idx}
                                disabled={answerStatus !== 'idle'}
                                onClick={() => handleAnswerSelect(idx)}
                                className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-5 outline-none active:scale-[0.98] ${getOptionStyles(idx)}`}
                            >
                                {/* Tecla de atajo (solo visible en desktop) */}
                                <div className={`hidden md:flex w-8 h-8 rounded-lg border border-slate-200 items-center justify-center text-xs font-bold text-slate-400 absolute left-[-4rem] opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    {idx + 1}
                                </div>

                                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm transition-colors border
                                    ${answerStatus === 'idle' && selectedAnswer === idx 
                                        ? `bg-${accentColor}-600 text-white border-${accentColor}-600` 
                                        : answerStatus !== 'idle' && idx === q.correctIndex
                                            ? 'bg-green-500 text-white border-green-500'
                                            : answerStatus === 'incorrect' && selectedAnswer === idx
                                                ? 'bg-red-500 text-white border-red-500'
                                                : 'bg-white text-slate-400 border-slate-200'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                </div>

                                <div className="flex-1 text-lg font-medium text-slate-700">
                                    <div className="katex-render-wrapper">
                                        {option.includes('\\') || option.includes('^') ? <InlineMath math={option} /> : option}
                                    </div>
                                </div>

                                {/* Iconos de estado */}
                                {answerStatus !== 'idle' && idx === q.correctIndex && (
                                    <CheckCircle2 className="w-6 h-6 text-green-500 animate-in zoom-in spin-in-90 duration-300" />
                                )}
                                {answerStatus === 'incorrect' && selectedAnswer === idx && (
                                    <XCircle className="w-6 h-6 text-red-500 animate-in zoom-in duration-300" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            {/* BARRA INFERIOR DE ACCIÓN (ESTILO DUOLINGO) */}
            <div className={`fixed bottom-0 left-0 right-0 p-6 border-t z-40 transition-colors duration-300
                ${answerStatus === 'correct' ? 'bg-green-100 border-green-200' : 
                  answerStatus === 'incorrect' ? 'bg-red-100 border-red-200' : 
                  'bg-white border-slate-200'}`}>
                
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    
                    {/* Mensaje de Feedback */}
                    <div className="hidden md:block">
                        {answerStatus === 'correct' && (
                            <div className="flex items-center gap-3 text-green-700 font-bold text-xl animate-in slide-in-from-bottom-2">
                                <div className="bg-white p-2 rounded-full"><CheckCircle2 className="w-6 h-6" /></div>
                                ¡Correcto! ¡Sigue así!
                            </div>
                        )}
                        {answerStatus === 'incorrect' && (
                            <div className="flex items-center gap-3 text-red-700 font-bold text-xl animate-in slide-in-from-bottom-2">
                                <div className="bg-white p-2 rounded-full"><XCircle className="w-6 h-6" /></div>
                                <span>La respuesta correcta era la <span className="underline decoration-2">opción {String.fromCharCode(65 + q.correctIndex)}</span></span>
                            </div>
                        )}
                    </div>

                    {/* Botón Principal Dinámico */}
                    <button
                        disabled={selectedAnswer === null && answerStatus === 'idle'}
                        onClick={answerStatus === 'idle' ? handleCheckAnswer : handleNextQuestion}
                        className={`w-full md:w-auto md:min-w-[200px] py-4 px-8 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-lg active:translate-y-1
                            ${answerStatus === 'idle'
                                ? selectedAnswer !== null
                                    ? `bg-${accentColor}-600 hover:bg-${accentColor}-500 text-white shadow-${accentColor}-200`
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                : answerStatus === 'correct'
                                    ? 'bg-green-500 hover:bg-green-400 text-white shadow-green-200'
                                    : 'bg-red-500 hover:bg-red-400 text-white shadow-red-200'
                            }`}
                    >
                        {answerStatus === 'idle' ? 'Comprobar' : (currentStep === quizData.questions.length - 1 ? 'Ver Resultados' : 'Continuar')}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Quizzes;