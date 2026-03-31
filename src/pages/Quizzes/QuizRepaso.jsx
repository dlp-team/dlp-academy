// src/pages/Quizzes/QuizRepaso.jsx
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ChevronLeft, Loader2, Target } from 'lucide-react';
import { arrayUnion, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
    ANSWER_STATUS,
    MAX_OPTION_LENGTH_FOR_GRID,
    VIEW_STATES,
    VIBRATION_DURATION,
    calculateScore,
    isPassed,
    ProgressBar,
    QuizFooter,
    RenderLatex,
    SubjectIcon
} from '../../components/modules/QuizEngine/QuizCommon';
import QuizHeader from '../../components/modules/QuizEngine/QuizHeader';
import QuizOptions from '../../components/modules/QuizEngine/QuizOptions';
import QuestionCard from '../../components/modules/QuizEngine/QuizQuestion';
import ResultsView from '../../components/modules/QuizEngine/QuizResults';
import ConfettiEffect, { useConfetti } from '../../components/modules/QuizEngine/QuizFeedback';

const QuizRepaso = ({ user }) => {
    const { subjectId, topicId } = useParams();
    const navigate = useNavigate();
    const backToTopicRoute = subjectId && topicId
        ? `/home/subject/${subjectId}/topic/${topicId}`
        : '/home';

    const [viewState, setViewState] = useState(VIEW_STATES.REVIEW);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answerStatus, setAnswerStatus] = useState(ANSWER_STATUS.IDLE);
    const [correctCount, setCorrectCount] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [answersDetail, setAnswersDetail] = useState([]);
    const [masteredInSession, setMasteredInSession] = useState([]);
    const [saving, setSaving] = useState(false);
    const { confettiTrigger, triggerConfetti } = useConfetti();

    const { failedQuestions, failedQuestionsLoadError } = useMemo(() => {
        try {
            const raw = sessionStorage.getItem('repasoQuestions');
            const parsed = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(parsed)) {
                return {
                    failedQuestions: [],
                    failedQuestionsLoadError: 'No se pudieron leer las preguntas guardadas de repaso.'
                };
            }
            return {
                failedQuestions: parsed,
                failedQuestionsLoadError: ''
            };
        } catch {
            return {
                failedQuestions: [],
                failedQuestionsLoadError: 'No se pudieron leer las preguntas guardadas de repaso.'
            };
        }
    }, []);

    const quizData = useMemo(() => ({
        title: 'Repaso de errores del tema',
        subtitle: 'Solo preguntas que aun fallas',
        formulas: [],
        questions: failedQuestions.map((entry) => ({
            ...entry,
            question: entry.questionText || 'Pregunta',
            options: Array.isArray(entry.options) ? entry.options : [],
            correctIndex: entry.correctIndex,
            formula: entry.formula || null
        }))
    }), [failedQuestions]);

    const topicGradient = 'from-rose-500 to-red-600';
    const accentColor = '#e11d48';
    const subjectIconKey = 'book';

    const handleGoBack = useCallback(() => {
        navigate(backToTopicRoute);
    }, [navigate, backToTopicRoute]);

    const persistMastered = useCallback(async () => {
        if (!user?.uid || !masteredInSession.length) return;

        setSaving(true);
        try {
            const ref = doc(db, 'repasoMastered', `${user.uid}__${topicId}`);
            await setDoc(ref, {
                userId: user.uid,
                topicId,
                updatedAt: serverTimestamp(),
                masteredQuestions: arrayUnion(...masteredInSession)
            }, { merge: true });
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    }, [user?.uid, topicId, masteredInSession]);

    const handleAnswerSelect = useCallback((index) => {
        if (answerStatus !== ANSWER_STATUS.IDLE) return;
        setSelectedAnswer(index);
    }, [answerStatus]);

    const handleCheckAnswer = useCallback(() => {
        if (answerStatus !== ANSWER_STATUS.IDLE || selectedAnswer === null || !quizData.questions.length) return;

        const currentQuestion = quizData.questions[currentStep];
        const isCorrect = selectedAnswer === currentQuestion.correctIndex;

        setAnswersDetail((prev) => ([
            ...prev,
            {
                questionIndex: currentQuestion.questionIndex,
                questionText: currentQuestion.question,
                formula: currentQuestion.formula,
                options: currentQuestion.options,
                correctIndex: currentQuestion.correctIndex,
                userAnswerIndex: selectedAnswer,
                isCorrect
            }
        ]));

        if (isCorrect) {
            setAnswerStatus(ANSWER_STATUS.CORRECT);
            setCorrectCount((prev) => prev + 1);
            setMasteredInSession((prev) => {
                const key = `${currentQuestion.quizId}::${currentQuestion.questionIndex}`;
                const exists = prev.some((entry) => `${entry.quizId}::${entry.questionIndex}` === key);
                if (exists) return prev;
                return [...prev, { quizId: currentQuestion.quizId, questionIndex: currentQuestion.questionIndex }];
            });
            triggerConfetti();
        } else {
            setAnswerStatus(ANSWER_STATUS.INCORRECT);
            if (navigator.vibrate) navigator.vibrate(VIBRATION_DURATION);
        }
    }, [answerStatus, selectedAnswer, quizData.questions, currentStep, triggerConfetti]);

    const handleNextQuestion = useCallback(async () => {
        const total = quizData.questions.length;
        if (currentStep < total - 1) {
            setCurrentStep((prev) => prev + 1);
            setSelectedAnswer(null);
            setAnswerStatus(ANSWER_STATUS.IDLE);
            return;
        }

        const score = calculateScore(correctCount, total || 1);
        setFinalScore(score);
        setViewState(VIEW_STATES.RESULTS);
        if (isPassed(score)) setTimeout(() => triggerConfetti(), 300);
        await persistMastered();
    }, [quizData.questions.length, currentStep, correctCount, triggerConfetti, persistMastered]);

    const handleRetry = useCallback(() => {
        setViewState(VIEW_STATES.REVIEW);
        setCurrentStep(0);
        setCorrectCount(0);
        setFinalScore(0);
        setSelectedAnswer(null);
        setAnswerStatus(ANSWER_STATUS.IDLE);
        setAnswersDetail([]);
        setMasteredInSession([]);
    }, []);

    const shouldUseGrid = useMemo(() => {
        if (!quizData.questions.length) return false;
        const options = quizData.questions[currentStep]?.options || [];
        const maxLen = Math.max(...options.map((option) => (typeof option === 'string' ? option.length : 0)), 0);
        return maxLen < MAX_OPTION_LENGTH_FOR_GRID;
    }, [quizData.questions, currentStep]);

    const totalQuestions = quizData.questions.length;
    const currentQuestion = quizData.questions[currentStep];

    if (!quizData.questions.length) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
                <div className="max-w-xl w-full rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center shadow-lg">
                    <Target className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No hay preguntas para repasar</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Cuando falles preguntas en los tests del tema apareceran aqui para practicar.</p>
                    {failedQuestionsLoadError && (
                        <p className="mb-4 rounded-xl border border-amber-200 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-900/30 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-200">
                            {failedQuestionsLoadError}
                        </p>
                    )}
                    <button onClick={handleGoBack} className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold">Volver al tema</button>
                </div>
            </div>
        );
    }

    if (saving) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-red-600 dark:text-red-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
            {viewState === VIEW_STATES.REVIEW && (
                <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/40 pb-20">
                    <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-white/50 dark:border-slate-700/70 sticky top-0 z-40 shadow-sm">
                        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                            <button onClick={handleGoBack} className="p-2.5 hover:bg-white/80 dark:hover:bg-slate-800 rounded-2xl transition-all duration-300 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:shadow-lg group">
                                <ChevronLeft className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                            <span className="text-xs font-black text-slate-500 dark:text-slate-300 uppercase tracking-[0.2em] px-4 py-1.5 rounded-full bg-slate-100/50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/70">
                                Repaso
                            </span>
                            <div className="w-11" />
                        </div>
                    </div>

                    <div className="max-w-2xl mx-auto px-4 py-10">
                        <div className="relative mb-10">
                            <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-[2rem] blur-3xl opacity-20`} />
                            <div className="relative bg-white/80 dark:bg-slate-900/85 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 dark:border-slate-700/70 p-10 text-center overflow-hidden">
                                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${topicGradient} rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2`} />
                                <div className="relative z-10">
                                    <div className="mb-6 flex justify-center">
                                        <SubjectIcon iconKey={subjectIconKey} topicGradient={topicGradient} />
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight leading-tight">
                                        <RenderLatex text={quizData.title} />
                                    </h1>
                                    <p className={`text-lg font-bold bg-gradient-to-r ${topicGradient} bg-clip-text text-transparent`}>
                                        <RenderLatex text={quizData.subtitle} />
                                    </p>
                                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-medium">{quizData.questions.length} preguntas pendientes</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setViewState(VIEW_STATES.QUIZ)}
                            className={`group relative w-full text-white py-5 rounded-2xl font-black text-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden bg-gradient-to-r ${topicGradient} hover:-translate-y-1`}
                        >
                            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                            <span className="relative z-10 flex items-center gap-3">
                                Comenzar repaso
                                <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {viewState === VIEW_STATES.QUIZ && (
                <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/40 pb-40">
                    <ConfettiEffect triggerKey={confettiTrigger} accentColor={accentColor} />
                    <ProgressBar current={currentStep + 1} total={totalQuestions} gradient={topicGradient} />
                    <QuizHeader current={currentStep + 1} total={totalQuestions} onClose={() => setViewState(VIEW_STATES.REVIEW)} />
                    <main className="px-4 max-w-3xl mx-auto">
                        <QuestionCard questionNumber={currentStep + 1} question={currentQuestion.question} formula={currentQuestion.formula} topicGradient={topicGradient} />
                        <QuizOptions
                            options={currentQuestion.options}
                            correctIndex={currentQuestion.correctIndex}
                            selectedAnswer={selectedAnswer}
                            answerStatus={answerStatus}
                            shouldUseGrid={shouldUseGrid}
                            topicGradient={topicGradient}
                            onSelect={handleAnswerSelect}
                        />
                    </main>
                    <QuizFooter
                        answerStatus={answerStatus}
                        selectedAnswer={selectedAnswer}
                        isLastQuestion={currentStep === totalQuestions - 1}
                        topicGradient={topicGradient}
                        onCheck={handleCheckAnswer}
                        onNext={handleNextQuestion}
                    />
                </div>
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

export default QuizRepaso;
