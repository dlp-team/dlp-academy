import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, CheckCircle2, XCircle, ArrowRight, 
    RefreshCcw, Target, Trophy, X, HelpCircle
} from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

// 1. IMPORTAR TU MAPA DE ICONOS
import { ICON_MAP } from '../utils/subjectConstants'; 

import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

// --- COMPONENTES UI REUTILIZABLES ---

const RenderLatex = ({ text }) => {
    if (!text) return null;
    if (typeof text !== 'string') return text;
    const parts = text.split('$');
    return (
        <span>
            {parts.map((part, index) => (
                index % 2 === 0 ? <span key={index}>{part}</span> : <InlineMath key={index} math={part} />
            ))}
        </span>
    );
};

const ConfettiEffect = ({ triggerKey, accentColor = '#4f46e5' }) => {
    if (!triggerKey) return null;
    const pieces = useMemo(() => Array.from({ length: 40 }).map((_, i) => {
        const angle = Math.random() * 360;
        const velocity = 80 + Math.random() * 120;
        const tx = Math.cos(angle * Math.PI / 180) * velocity;
        const ty = (Math.sin(angle * Math.PI / 180) * velocity) - 80;
        return {
            id: i, color: Math.random() > 0.5 ? '#FBBF24' : accentColor,
            size: Math.random() * 8 + 6, tx: `${tx}px`, ty: `${ty}px`,
            rot: `${Math.random() * 360}deg`, delay: `${Math.random() * 0.15}s`,
            duration: `${0.9 + Math.random() * 0.5}s`
        };
    }), [triggerKey, accentColor]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
            {pieces.map(piece => (
                <div key={piece.id} className="absolute rounded-full animate-burst"
                    style={{
                        backgroundColor: piece.color, width: piece.size, height: piece.size,
                        '--tx': piece.tx, '--ty': piece.ty, '--rot': piece.rot,
                        animationDuration: piece.duration, animationDelay: piece.delay,
                        left: '50%', top: '40%'
                    }}
                />
            ))}
            <style>{`
                @keyframes burst {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--rot)) scale(0); opacity: 0; }
                }
                .animate-burst { animation: burst cubic-bezier(0.25, 1, 0.5, 1) forwards; }
            `}</style>
        </div>
    );
};

const FormulaDisplay = ({ formula, size = 'text-lg' }) => (
    <div className={`${size} font-serif text-slate-800 select-text overflow-x-auto py-1`}>
        <BlockMath math={formula} />
    </div>
);

// --- COMPONENTE PRINCIPAL ---

const Quizzes = ({ user }) => {
    const { subjectId, topicId, quizId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [viewState, setViewState] = useState('loading'); 
    const [quizData, setQuizData] = useState(null);
    const [subjectIconKey, setSubjectIconKey] = useState(null); // Guardamos la CLAVE del icono (ej: "calculator")
    
    // ESTADOS DE COLOR (HEX y GRADIENT)
    const [accentColor, setAccentColor] = useState('#4f46e5');
    const [topicGradient, setTopicGradient] = useState('from-indigo-500 to-purple-600');

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answerStatus, setAnswerStatus] = useState('idle');
    const [correctCount, setCorrectCount] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [confettiTrigger, setConfettiTrigger] = useState(0);
    
    const handleGoBack = () => navigate(`/home/subject/${subjectId}/topic/${topicId}`);

    useEffect(() => {
        const loadData = async () => {
            const MOCK_DATA = { title: "Test de Prueba", subtitle: "Matemáticas", questions: [{ question: "Error", options: ["A"], correctIndex: 0 }] };
            if (!user || !subjectId || !topicId || !quizId) return;

            try {
                // 1. OBTENER ASIGNATURA (Para el icono)
                const subjectRef = doc(db, "subjects", subjectId);
                const subjectSnap = await getDoc(subjectRef);
                if (subjectSnap.exists()) {
                    const sData = subjectSnap.data();
                    // Guardamos la clave del icono o la primera letra
                    setSubjectIconKey(sData.icon || sData.name?.charAt(0) || "📚");
                }

                // 2. Obtener Datos del TEMA para el COLOR
                const topicRef = doc(db, "subjects", subjectId, "topics", topicId);
                const topicSnap = await getDoc(topicRef);
                
                if (topicSnap.exists()) {
                    const tData = topicSnap.data();
                    
                    if (tData.color) {
                        setTopicGradient(tData.color);
                    }

                    const colorMap = {
                        'blue': '#2563eb', 'indigo': '#4f46e5', 'purple': '#9333ea', 
                        'green': '#16a34a', 'red': '#dc2626', 'orange': '#ea580c',
                        'amber': '#d97706', 'teal': '#0d9488', 'cyan': '#0891b2',
                        'pink': '#db2777', 'rose': '#e11d48'
                    };
                    if (tData.color) {
                        const mainColorName = tData.color.split(' ')[0].replace('from-', '').split('-')[0];
                        if (colorMap[mainColorName]) setAccentColor(colorMap[mainColorName]);
                    }
                }

                // 3. Cargar el Quiz
                const quizRef = doc(db, "subjects", subjectId, "topics", topicId, "quizzes", quizId);
                const snap = await getDoc(quizRef);
                
                if (snap.exists()) {
                    const data = snap.data();
                    setQuizData({
                        title: data.name || data.title || "Test Generado",
                        subtitle: data.level || "Repaso",
                        formulas: data.formulas || [],
                        questions: data.questions || []
                    });
                } else {
                    setQuizData(MOCK_DATA);
                }

            } catch (error) {
                console.error("Error:", error);
                setQuizData(MOCK_DATA);
            } finally {
                setLoading(false);
                setViewState('review');
            }
        };
        loadData();
    }, [user, subjectId, topicId, quizId]);

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
            const score = Math.round((correctCount / total) * 100);
            setFinalScore(score);
            setViewState('results');
            if (score >= 50) setTimeout(() => triggerConfetti(), 300);
            
            try {
                const resultRef = doc(db, "subjects", subjectId, "topics", topicId, "quiz_results", `${quizId}_${user.uid}`);
                await setDoc(resultRef, {
                    userId: user.uid, quizId, quizTitle: quizData.title,
                    score, correctAnswers: correctCount, totalQuestions: total,
                    completedAt: serverTimestamp(), passed: score >= 50
                }, { merge: true });
            } catch (e) { console.error(e); }
        }
    };

    const handleRetry = () => {
        setViewState('review'); setCurrentStep(0); setCorrectCount(0);
        setFinalScore(0); setSelectedAnswer(null); setAnswerStatus('idle');
    };

    const shouldUseGrid = useMemo(() => {
        if (!quizData?.questions?.length) return false;
        const options = quizData.questions[currentStep].options || [];
        const maxLen = Math.max(...options.map(o => (typeof o === 'string' ? o.length : 0)));
        return maxLen < 50; 
    }, [quizData, currentStep]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <RefreshCcw className="w-10 h-10 text-slate-300 animate-spin mb-4" />
            <p className="text-slate-500 text-sm font-medium">Cargando...</p>
        </div>
    );

    if (!quizData) return null;

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
            
            {/* 1. VISTA DE REPASO */}
            {viewState === 'review' && (
                <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white pb-20">
                    <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40">
                        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                            <button onClick={handleGoBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Resumen</span>
                            <div className="w-9"></div>
                        </div>
                    </div>

                    <div className="max-w-2xl mx-auto px-4 py-8">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center mb-8">
                            
                            {/* --- ICONO DE ASIGNATURA CORREGIDO --- */}
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg shadow-slate-100 bg-gradient-to-br ${topicGradient} text-white`}>
                                {(() => {
                                    // Buscamos el componente real en tu MAPA
                                    const SubjectIconComponent = ICON_MAP[subjectIconKey];
                                    
                                    // Si existe, lo pintamos
                                    if (SubjectIconComponent) {
                                        return <SubjectIconComponent className="w-8 h-8" />;
                                    }
                                    
                                    // Si no, mostramos texto (letra inicial o emoji)
                                    return <span className="text-3xl font-bold">{subjectIconKey}</span>;
                                })()}
                            </div>

                            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                                {quizData.title}
                            </h1>
                            <p className="text-slate-500 font-medium">{quizData.subtitle}</p>
                            
                            <div className="flex items-center justify-center gap-4 mt-6 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                                    <Target className="w-3.5 h-3.5" style={{ color: accentColor }} />
                                    {quizData.questions.length} Preguntas
                                </div>
                            </div>
                        </div>

                        {quizData.formulas && quizData.formulas.length > 0 && (
                            <div className="space-y-4 mb-8">
                                <h3 className="text-sm font-bold text-slate-400 ml-2 uppercase tracking-wider">Fórmulas</h3>
                                {quizData.formulas.map((formula, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 bg-gradient-to-br ${topicGradient}`}>
                                            {idx + 1}
                                        </div>
                                        <div className="overflow-hidden">
                                            <FormulaDisplay formula={formula.display || formula} size="text-base" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setViewState('quiz')}
                            className={`w-full text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${topicGradient}`}
                        >
                            Comenzar
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* 2. VISTA TEST */}
            {viewState === 'quiz' && (
                <div className="min-h-screen bg-slate-50 pb-32">
                    <ConfettiEffect triggerKey={confettiTrigger} accentColor={accentColor} />
                    
                    <div className="fixed top-0 left-0 right-0 z-30 h-1.5 bg-slate-200">
                        <div 
                            className={`h-full transition-all duration-500 ease-out bg-gradient-to-r ${topicGradient}`}
                            style={{ width: `${((currentStep + 1) / quizData.questions.length) * 100}%` }}
                        />
                    </div>

                    <div className="max-w-3xl mx-auto px-4 pt-10 pb-6 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span>Pregunta {currentStep + 1} de {quizData.questions.length}</span>
                        <button onClick={() => setViewState('review')} className="hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
                    </div>

                    <main className="px-4 max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 mb-6 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${topicGradient}`}></div>
                            
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed text-center">
                                <span className="mr-2 opacity-60">{currentStep + 1}.</span>
                                <RenderLatex text={quizData.questions[currentStep].question} />
                            </h2>

                            {quizData.questions[currentStep].formula && (
                                <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-100 flex justify-center">
                                    <BlockMath math={quizData.questions[currentStep].formula} />
                                </div>
                            )}
                        </div>

                        <div className={`grid gap-3 ${shouldUseGrid ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                            {quizData.questions[currentStep].options.map((option, idx) => {
                                let containerClass = "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50";
                                let circleClass = "bg-slate-100 text-slate-400";

                                if (answerStatus === 'idle' && selectedAnswer === idx) {
                                    containerClass = `border-transparent bg-gradient-to-r ${topicGradient} text-white ring-2 ring-offset-2 ring-indigo-200`;
                                    circleClass = "bg-white/20 text-white";
                                } else if (answerStatus !== 'idle') {
                                    if (idx === quizData.questions[currentStep].correctIndex) {
                                        containerClass = "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500";
                                        circleClass = "bg-green-500 text-white";
                                    } else if (selectedAnswer === idx) {
                                        containerClass = "border-red-300 bg-red-50 text-red-700";
                                        circleClass = "bg-red-500 text-white";
                                    } else {
                                        containerClass = "border-slate-100 bg-slate-50 text-slate-300 opacity-50";
                                    }
                                }

                                return (
                                    <button
                                        key={idx}
                                        disabled={answerStatus !== 'idle'}
                                        onClick={() => handleAnswerSelect(idx)}
                                        className={`group w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 relative overflow-hidden ${containerClass}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors shrink-0 ${circleClass}`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <div className="flex-1 text-base font-semibold leading-snug">
                                            <div className="katex-render-wrapper">
                                                <RenderLatex text={option} />
                                            </div>
                                        </div>
                                        {answerStatus !== 'idle' && idx === quizData.questions[currentStep].correctIndex && <CheckCircle2 className="w-5 h-5 animate-bounce-in shrink-0" />}
                                        {answerStatus === 'incorrect' && selectedAnswer === idx && <XCircle className="w-5 h-5 animate-shake shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </main>

                    <div className="fixed bottom-6 left-4 right-4 z-40">
                        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/20 flex items-center justify-between gap-4 pl-6">
                            <div className="hidden md:flex items-center gap-2">
                                {answerStatus === 'correct' && <span className="text-green-600 font-bold flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4"/> Correcto</span>}
                                {answerStatus === 'incorrect' && <span className="text-red-500 font-bold flex items-center gap-2 text-sm"><XCircle className="w-4 h-4"/> Incorrecto</span>}
                                {answerStatus === 'idle' && <span className="text-slate-400 font-medium text-sm flex items-center gap-2"><HelpCircle className="w-4 h-4"/> Selecciona una opción</span>}
                            </div>

                            <button
                                disabled={selectedAnswer === null && answerStatus === 'idle'}
                                onClick={answerStatus === 'idle' ? handleCheckAnswer : handleNextQuestion}
                                className={`flex-1 md:flex-none md:w-48 h-12 rounded-xl font-bold text-sm text-white transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                                    answerStatus === 'idle' ? `bg-gradient-to-r ${topicGradient}` : 
                                    answerStatus === 'correct' ? 'bg-green-600' : 'bg-slate-800'
                                }`}
                            >
                                {answerStatus === 'idle' ? 'Comprobar' : (currentStep === quizData.questions.length - 1 ? 'Finalizar' : 'Siguiente')}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. VISTA RESULTADOS */}
            {viewState === 'results' && (
                <div className="flex items-center justify-center p-6 min-h-screen">
                    <ConfettiEffect triggerKey={confettiTrigger} accentColor={accentColor} />
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100 animate-scale-in">
                        
                        <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${finalScore >= 50 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {finalScore >= 50 ? <Trophy className="w-12 h-12" /> : <Target className="w-12 h-12" />}
                        </div>
                        
                        <h2 className={`text-6xl font-black mb-2 tracking-tighter ${finalScore >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                            {finalScore}%
                        </h2>
                        <p className="text-slate-500 font-medium mb-8">
                            {finalScore >= 50 ? '¡Excelente trabajo!' : 'Sigue practicando'}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="text-2xl font-black text-slate-900">{correctCount}</div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Aciertos</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="text-2xl font-black text-slate-900">{quizData.questions.length}</div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button onClick={handleRetry} className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-sm transition-all">Intentar de nuevo</button>
                            <button onClick={handleGoBack} className={`w-full py-3.5 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-gradient-to-r ${topicGradient}`}>Volver al Tema</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Quizzes;