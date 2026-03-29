// src/pages/Quizzes/Quizzes.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Target, Clock, Sparkles, ArrowRight, Lock, CalendarDays, GraduationCap
} from 'lucide-react';
import { addDoc, collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config'; 
import { canUserAccessSubject } from '../../utils/subjectAccessUtils';

// ==================== IMPORTACIONES DE COMPONENTES ====================
// Apuntan a la carpeta components/quizzes

import {
    ANSWER_STATUS, VIEW_STATES, DEFAULT_QUIZ, VIBRATION_DURATION, MAX_OPTION_LENGTH_FOR_GRID,
    extractColorFromGradient, calculateScore, isPassed,
    LoadingSpinner, SubjectIcon, FormulaDisplay, ProgressBar, QuizFooter, RenderLatex
} from '../../components/modules/QuizEngine/QuizCommon';

import ConfettiEffect, { useConfetti } from '../../components/modules/QuizEngine/QuizFeedback';
import QuizHeader from '../../components/modules/QuizEngine/QuizHeader';
import QuestionCard from '../../components/modules/QuizEngine/QuizQuestion';
import QuizOptions from '../../components/modules/QuizEngine/QuizOptions';
import ResultsView from '../../components/modules/QuizEngine/QuizResults';

// ==================== CUSTOM HOOKS ====================

const useQuizData = (user, subjectId, topicId, quizId, navigate) => {
    const [loading, setLoading] = useState(true);
    const [quizData, setQuizData] = useState(null);
    const [subjectIconKey, setSubjectIconKey] = useState(null);
    const [accentColor, setAccentColor] = useState('#4f46e5');
    const [topicGradient, setTopicGradient] = useState('from-indigo-500 to-purple-600');

    useEffect(() => {
        const loadData = async () => {
            if (!user || !subjectId || !topicId || !quizId) {
                setLoading(false);
                return;
            }

            try {
                const subjectRef = doc(db, "subjects", subjectId);
                const subjectSnap = await getDoc(subjectRef);
                
                if (subjectSnap.exists()) {
                    const sData = subjectSnap.data();
                    const hasSubjectAccess = await canUserAccessSubject({
                        subject: { id: subjectSnap.id, ...sData },
                        user
                    });

                    if (!hasSubjectAccess) {
                        navigate('/home');
                        setLoading(false);
                        return;
                    }

                    setSubjectIconKey(sData.icon || sData.name?.charAt(0) || 'book');
                } else {
                    navigate('/home');
                    setLoading(false);
                    return;
                }

                const topicRef = doc(db, "topics", topicId);
                const topicSnap = await getDoc(topicRef);
                
                if (topicSnap.exists()) {
                    const tData = topicSnap.data();
                    
                    if (tData.color) {
                        setTopicGradient(tData.color);
                        const extractedColor = extractColorFromGradient(tData.color);
                        if (extractedColor) {
                            setAccentColor(extractedColor);
                        }
                    }
                }

                const quizRef = doc(db, "quizzes", quizId);
                const quizSnap = await getDoc(quizRef);
                
                if (quizSnap.exists()) {
                    const data = quizSnap.data();
                    setQuizData({
                        title: data.name || data.title || "Test Generado",
                        subtitle: data.level || "Repaso",
                        formulas: data.formulas || [],
                        questions: data.questions || [],
                        isAssignment: Boolean(data.isAssignment),
                        assignmentStartAt: data.assignmentStartAt || null,
                        assignmentDueAt: data.assignmentDueAt || null
                    });
                } else {
                    setQuizData(DEFAULT_QUIZ);
                }
            } catch (error) {
                console.error("Error al cargar datos:", error);
                setQuizData(DEFAULT_QUIZ);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user, subjectId, topicId, quizId, navigate]);

    return { loading, quizData, subjectIconKey, accentColor, topicGradient };
};

// ==================== COMPONENTES DE VISTA INTERNOS ====================
// Estos organizan los subcomponentes importados

const ReviewView = React.memo(({ 
    quizData, subjectIconKey, topicGradient, accentColor, onStart, onGoBack, canStart, assignmentStatusText
}) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pb-20">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-2xl border-b border-white/50 sticky top-0 z-40 shadow-sm">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                <button 
                    onClick={onGoBack} 
                    className="p-2.5 hover:bg-white/80 rounded-2xl transition-all duration-300 text-slate-600 hover:text-slate-900 hover:shadow-lg group"
                >
                    <ChevronLeft className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-4 py-1.5 rounded-full bg-slate-100/50">
                    Resumen
                </span>
                <div className="w-11" />
            </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-10">
            {/* Hero Card */}
            <div className="relative mb-10">
                <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-[2rem] blur-3xl opacity-20`} />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 p-10 text-center overflow-hidden">
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${topicGradient} rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2`} />
                    <div className={`absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr ${topicGradient} rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2`} />
                    
                    <div className="relative z-10">
                        <div className="mb-6 flex justify-center">
                            <SubjectIcon iconKey={subjectIconKey} topicGradient={topicGradient} />
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight leading-tight">
                            <RenderLatex text={quizData.title} />
                        </h1>
                        <p className={`text-lg font-bold bg-gradient-to-r ${topicGradient} bg-clip-text text-transparent`}>
                            <RenderLatex text={quizData.subtitle} />
                        </p>
                        
                        <div className="flex items-center justify-center gap-6 mt-8">
                            <div className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
                                <div className={`p-2 rounded-xl bg-gradient-to-br ${topicGradient}`}>
                                    <Target className="w-4 h-4 text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-black text-slate-900">{quizData.questions.length}</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Preguntas</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
                                <div className={`p-2 rounded-xl bg-gradient-to-br ${topicGradient}`}>
                                    <Clock className="w-4 h-4 text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-black text-slate-900">~{Math.ceil(quizData.questions.length * 1.5)}</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Minutos</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulas Section */}
            {quizData.formulas?.length > 0 && (
                <div className="mb-10 space-y-4">
                    <div className="flex items-center gap-3 ml-2">
                        <Sparkles className={`w-5 h-5 bg-gradient-to-r ${topicGradient} bg-clip-text text-transparent`} style={{ color: accentColor }} />
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-[0.15em]">
                            Fórmulas de referencia
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {quizData.formulas.map((formula, idx) => (
                            <div key={idx} className="group relative">
                                <div className={`absolute inset-0 bg-gradient-to-r ${topicGradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                                <div className="relative flex items-center gap-4 bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 bg-gradient-to-br ${topicGradient} shadow-lg`}>
                                        {idx + 1}
                                    </div>
                                    <div className="overflow-hidden flex-1">
                                        <FormulaDisplay formula={formula.display || formula} size="text-base" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Start Button */}
            {!canStart && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>{assignmentStatusText}</span>
                </div>
            )}

            {quizData.isAssignment && (
                <div className="mb-4 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-xs text-slate-600 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-slate-500" />
                    <span>{assignmentStatusText}</span>
                </div>
            )}

            <button
                onClick={canStart ? onStart : undefined}
                disabled={!canStart}
                className={`group relative w-full text-white py-5 rounded-2xl font-black text-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden ${canStart ? `hover:shadow-3xl bg-gradient-to-r ${topicGradient} hover:-translate-y-1` : 'bg-slate-300 cursor-not-allowed'}`}
            >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                <span className="relative z-10 flex items-center gap-3">
                    {canStart ? 'Comenzar Test' : 'No disponible'}
                    <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                </span>
            </button>
        </div>
    </div>
));
ReviewView.displayName = 'ReviewView';

const QuizView = React.memo(({ 
    currentStep, totalQuestions, currentQuestion, selectedAnswer, answerStatus, 
    shouldUseGrid, topicGradient, confettiTrigger, accentColor, 
    onAnswerSelect, onCheckAnswer, onNextQuestion, onGoBack
}) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pb-40">
        <ConfettiEffect triggerKey={confettiTrigger} accentColor={accentColor} />
        
        <ProgressBar 
            current={currentStep + 1} 
            total={totalQuestions} 
            gradient={topicGradient} 
        />

        <QuizHeader 
            current={currentStep + 1} 
            total={totalQuestions} 
            onClose={onGoBack} 
        />

        <main className="px-4 max-w-3xl mx-auto">
            <QuestionCard 
                questionNumber={currentStep + 1}
                question={currentQuestion.question}
                formula={currentQuestion.formula}
                topicGradient={topicGradient}
            />

            <QuizOptions
                options={currentQuestion.options}
                correctIndex={currentQuestion.correctIndex}
                selectedAnswer={selectedAnswer}
                answerStatus={answerStatus}
                shouldUseGrid={shouldUseGrid}
                topicGradient={topicGradient}
                onSelect={onAnswerSelect}
            />
        </main>

        <QuizFooter
            answerStatus={answerStatus}
            selectedAnswer={selectedAnswer}
            isLastQuestion={currentStep === totalQuestions - 1}
            topicGradient={topicGradient}
            onCheck={onCheckAnswer}
            onNext={onNextQuestion}
        />
    </div>
));
QuizView.displayName = 'QuizView';

// ==================== MAIN COMPONENT ====================

const Quizzes = ({ user }) => {
    const { subjectId, topicId, quizId } = useParams();
    const navigate = useNavigate();

    const { loading, quizData, subjectIconKey, accentColor, topicGradient } = 
        useQuizData(user, subjectId, topicId, quizId, navigate);

    const [viewState, setViewState] = useState(VIEW_STATES.REVIEW);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answerStatus, setAnswerStatus] = useState(ANSWER_STATUS.IDLE);
    const [correctCount, setCorrectCount] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [answersDetail, setAnswersDetail] = useState([]);
    const [previewAsStudent, setPreviewAsStudent] = useState(() => sessionStorage.getItem('dlpPreviewAsStudent') === '1');
    const { confettiTrigger, triggerConfetti } = useConfetti();

    const handleDisablePreview = useCallback(() => {
        sessionStorage.removeItem('dlpPreviewAsStudent');
        setPreviewAsStudent(false);
    }, []);

    const handleGoBack = useCallback(() => {
        navigate(`/home/subject/${subjectId}/topic/${topicId}`);
    }, [navigate, subjectId, topicId]);

    const handleAnswerSelect = useCallback((index) => {
        if (answerStatus !== ANSWER_STATUS.IDLE) return;
        setSelectedAnswer(index);
    }, [answerStatus]);

    const handleCheckAnswer = useCallback(() => {
        if (answerStatus !== ANSWER_STATUS.IDLE || selectedAnswer === null || !quizData) return;
        
        const currentQuestion = quizData.questions[currentStep];
        const isCorrect = selectedAnswer === currentQuestion.correctIndex;

        setAnswersDetail((prev) => ([
            ...prev,
            {
                questionIndex: currentStep,
                questionText: currentQuestion.question || '',
                formula: currentQuestion.formula || null,
                options: Array.isArray(currentQuestion.options) ? currentQuestion.options : [],
                correctIndex: currentQuestion.correctIndex,
                userAnswerIndex: selectedAnswer,
                isCorrect
            }
        ]));
        
        if (isCorrect) {
            setAnswerStatus(ANSWER_STATUS.CORRECT);
            setCorrectCount(prev => prev + 1);
            triggerConfetti();
        } else {
            setAnswerStatus(ANSWER_STATUS.INCORRECT);
            if (navigator.vibrate) {
                navigator.vibrate(VIBRATION_DURATION);
            }
        }
    }, [answerStatus, selectedAnswer, quizData, currentStep, triggerConfetti]);

    const saveQuizResult = useCallback(async (score, correct, total, detail) => {
        if (!user?.uid) return;

        try {
            const resultRef = doc(
                db, 
                "subjects", subjectId, 
                "topics", topicId, 
                "quiz_results", 
                `${quizId}_${user.uid}`
            );
            
            await setDoc(resultRef, {
                userId: user.uid,
                userEmail: user.email || 'anon',
                quizId,
                subjectId,
                topicId,
                quizTitle: quizData?.title || 'Quiz',
                score,
                correctAnswers: correct,
                totalQuestions: total,
                completedAt: serverTimestamp(),
                passed: isPassed(score)
            }, { merge: true });

            await addDoc(collection(db, 'quizAttempts'), {
                userId: user.uid,
                userEmail: user.email || 'anon',
                quizId,
                subjectId,
                topicId,
                quizTitle: quizData?.title || 'Quiz',
                score,
                correctAnswers: correct,
                totalQuestions: total,
                completedAt: serverTimestamp(),
                passed: isPassed(score),
                answersDetail: Array.isArray(detail) ? detail : []
            });

            console.log("✅ Puntuación guardada con éxito");
        } catch (error) {
            console.error("❌ Error al guardar puntuación:", error);
        }
    }, [user, subjectId, topicId, quizId, quizData]);

    const handleNextQuestion = useCallback(async () => {
        if (!quizData) return;
        
        const total = quizData.questions.length;
        
        if (currentStep < total - 1) {
            setCurrentStep(prev => prev + 1);
            setSelectedAnswer(null);
            setAnswerStatus(ANSWER_STATUS.IDLE);
        } else {
            const score = calculateScore(correctCount, total);
            setFinalScore(score);
            setViewState(VIEW_STATES.RESULTS);
            
            if (isPassed(score)) {
                setTimeout(() => triggerConfetti(), 300);
            }
            
            await saveQuizResult(score, correctCount, total, answersDetail);
        }
    }, [quizData, currentStep, correctCount, triggerConfetti, saveQuizResult, answersDetail]);

    const handleRetry = useCallback(() => {
        setViewState(VIEW_STATES.REVIEW);
        setCurrentStep(0);
        setCorrectCount(0);
        setFinalScore(0);
        setSelectedAnswer(null);
        setAnswerStatus(ANSWER_STATUS.IDLE);
        setAnswersDetail([]);
    }, []);

    const shouldUseGrid = useMemo(() => {
        if (!quizData?.questions?.length) return false;
        const options = quizData.questions[currentStep]?.options || [];
        const maxLen = Math.max(...options.map(o => 
            typeof o === 'string' ? o.length : 0
        ));
        return maxLen < MAX_OPTION_LENGTH_FOR_GRID;
    }, [quizData, currentStep]);

    if (loading) return <LoadingSpinner />;
    if (!quizData) return null;

    const toDate = (value) => {
        if (!value) return null;
        if (value?.toDate) return value.toDate();
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const isStudent = user?.role === 'student' || previewAsStudent;
    const now = new Date();
    const assignmentStart = toDate(quizData.assignmentStartAt);
    const assignmentDue = toDate(quizData.assignmentDueAt);
    const startsInFuture = quizData.isAssignment && assignmentStart && now < assignmentStart;
    const isExpired = quizData.isAssignment && assignmentDue && now > assignmentDue;
    const canStart = !quizData.isAssignment || !isStudent || (!startsInFuture && !isExpired);
    const assignmentStatusText = quizData.isAssignment
        ? `${assignmentStart ? `Inicio: ${assignmentStart.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}` : 'Sin fecha de inicio'}${assignmentDue ? ` · Limite: ${assignmentDue.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}${startsInFuture ? ' · Aun no disponible' : ''}${isExpired ? ' · Plazo cerrado' : ''}`
        : '';

    const currentQuestion = quizData.questions[currentStep];
    const totalQuestions = quizData.questions.length;

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
            {previewAsStudent && (
                <div className="fixed top-3 right-3 z-[60] rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-2 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-amber-700">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Vista alumno temporal
                        <button
                            onClick={handleDisablePreview}
                            className="ml-2 rounded-md bg-amber-500 px-2 py-1 text-[10px] uppercase tracking-wider text-white hover:bg-amber-600 transition-colors"
                        >
                            Salir
                        </button>
                    </div>
                </div>
            )}

            {viewState === VIEW_STATES.REVIEW && (
                <ReviewView
                    quizData={quizData}
                    subjectIconKey={subjectIconKey}
                    topicGradient={topicGradient}
                    accentColor={accentColor}
                    canStart={canStart}
                    assignmentStatusText={assignmentStatusText}
                    onStart={() => setViewState(VIEW_STATES.QUIZ)}
                    onGoBack={handleGoBack}
                />
            )}

            {viewState === VIEW_STATES.QUIZ && (
                <QuizView
                    currentStep={currentStep}
                    totalQuestions={totalQuestions}
                    currentQuestion={currentQuestion}
                    selectedAnswer={selectedAnswer}
                    answerStatus={answerStatus}
                    shouldUseGrid={shouldUseGrid}
                    topicGradient={topicGradient}
                    confettiTrigger={confettiTrigger}
                    accentColor={accentColor}
                    onAnswerSelect={handleAnswerSelect}
                    onCheckAnswer={handleCheckAnswer}
                    onNextQuestion={handleNextQuestion}
                    onGoBack={() => setViewState(VIEW_STATES.REVIEW)}
                />
            )}

            {viewState === VIEW_STATES.RESULTS && (
                <ResultsView
                    finalScore={finalScore}
                    correctCount={correctCount}
                    totalQuestions={totalQuestions}
                    answersDetail={answersDetail}
                    topicGradient={topicGradient}
                    confettiTrigger={confettiTrigger}
                    accentColor={accentColor}
                    onRetry={handleRetry}
                    onGoBack={handleGoBack}
                />
            )}
        </div>
    );
};

export default Quizzes;