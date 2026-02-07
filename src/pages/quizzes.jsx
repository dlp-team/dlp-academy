// src/pages/Quizzes.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useQuizzesLogic } from '../hooks/useQuizzesLogic';

// Sub-components
import QuizHeader from '../components/quizzes/QuizHeader';
import QuizQuestion from '../components/quizzes/QuizQuestion';
import QuizOptions from '../components/quizzes/QuizOptions';
import QuizFeedback from '../components/quizzes/QuizFeedback';
import QuizResults from '../components/quizzes/QuizResults';

const Quizzes = ({ user }) => {
    // 1. Initialize Logic
    const logic = useQuizzesLogic(user);

    // 2. Loading State
    if (logic.loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">Cargando Quiz...</p>
                </div>
            </div>
        );
    }

    // 3. Error/Empty State
    if (!logic.quizData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center max-w-md p-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Quiz no encontrado</h2>
                    <button onClick={logic.handleGoBack} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Volver</button>
                </div>
            </div>
        );
    }

    // 4. Render Results View
    if (logic.quizFinished) {
        return (
            <QuizResults 
                score={logic.score}
                correctCount={logic.correctCount}
                quizData={logic.quizData}
                topicGradient={logic.topicGradient}
                handleRetry={logic.handleRetry}
                handleGoBack={logic.handleGoBack}
            />
        );
    }

    // 5. Render Active Quiz View
    const currentQuestion = logic.quizData.questions[logic.currentQuestionIndex];
    
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <div className="max-w-3xl mx-auto px-4 py-6 md:py-10 pb-32">
                
                {/* Header */}
                <QuizHeader 
                    quizData={logic.quizData}
                    currentQuestionIndex={logic.currentQuestionIndex}
                    streak={logic.streak}
                    score={logic.score}
                    handleGoBack={logic.handleGoBack}
                    getProgressColor={logic.getProgressColor}
                    getStreakColor={logic.getStreakColor}
                />

                {/* Question Card */}
                <QuizQuestion question={currentQuestion} />

                {/* Options */}
                <QuizOptions 
                    options={currentQuestion.options}
                    selectedOption={logic.selectedOption}
                    handleOptionSelect={logic.handleOptionSelect}
                    showResult={logic.showResult}
                    correctAnswer={currentQuestion.correctAnswer}
                />
            </div>

            {/* Bottom Controls & Feedback */}
            <QuizFeedback 
                showResult={logic.showResult}
                showExplanation={logic.showExplanation}
                question={currentQuestion}
                selectedOption={logic.selectedOption}
                handleCheckAnswer={logic.handleCheckAnswer}
                handleNextQuestion={logic.handleNextQuestion}
                isLastQuestion={logic.currentQuestionIndex === logic.quizData.questions.length - 1}
            />
        </div>
    );
};

export default Quizzes;