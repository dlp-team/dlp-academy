import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
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

    // Extraemos el gradiente o usamos uno por defecto para estados de carga/error
    const activeGradient = logic.topicGradient || 'from-indigo-600 to-violet-600';

    // 2. Loading State (Premium)
    if (logic.loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
                {/* Fondo sutil animado */}
                <div className={`absolute inset-0 bg-gradient-to-br ${activeGradient} opacity-5 blur-3xl animate-pulse`}></div>
                
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-tr ${activeGradient} blur-xl opacity-30 rounded-full`}></div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl shadow-indigo-500/10 border border-slate-100 dark:border-slate-800">
                            <Loader2 className={`w-10 h-10 animate-spin text-transparent bg-clip-text bg-gradient-to-tr ${activeGradient}`} />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-slate-800 dark:text-white font-black text-lg tracking-tight">Preparando el desafío</p>
                        <p className="text-slate-400 text-sm font-medium animate-pulse">Sincronizando preguntas...</p>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Error/Empty State
    if (!logic.quizData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
                <div className="text-center max-w-md w-full bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Quiz no disponible</h2>
                    <p className="text-slate-500 mb-8">No hemos podido encontrar los datos de este entrenamiento.</p>
                    <button 
                        onClick={logic.handleGoBack} 
                        className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                    >
                        Volver al Inicio
                    </button>
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
                topicGradient={activeGradient} // Pasamos el gradiente al resultado
                handleRetry={logic.handleRetry}
                handleGoBack={logic.handleGoBack}
            />
        );
    }

    // 5. Render Active Quiz View
    const currentQuestion = logic.quizData.questions[logic.currentQuestionIndex];
    
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans relative overflow-hidden transition-colors duration-500">
            
            {/* Decoración de fondo dinámica basada en el tema */}
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${activeGradient}`}></div>
            <div className={`absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br ${activeGradient} opacity-5 blur-[100px] rounded-full pointer-events-none`}></div>
            <div className={`absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none z-10`}></div>

            <div className="max-w-3xl mx-auto px-4 py-6 md:py-10 pb-40 relative z-0">
                
                {/* Header */}
                <QuizHeader 
                    quizData={logic.quizData}
                    currentQuestionIndex={logic.currentQuestionIndex}
                    streak={logic.streak}
                    score={logic.score}
                    handleGoBack={logic.handleGoBack}
                    getProgressColor={logic.getProgressColor}
                    getStreakColor={logic.getStreakColor}
                    topicGradient={activeGradient} // Nuevo prop para colorear la barra de progreso
                />

                {/* ANIMACIÓN ENTRE PREGUNTAS:
                    Usamos key={currentQuestion.id} (o el índice) para forzar a React a recrear el DOM
                    y disparar la animación 'animate-in' cada vez que cambia la pregunta.
                */}
                <div 
                    key={logic.currentQuestionIndex} 
                    className="animate-in slide-in-from-bottom-8 fade-in duration-500 ease-out"
                >
                    {/* Question Card */}
                    <QuizQuestion 
                        question={currentQuestion} 
                    />

                    {/* Options */}
                    <QuizOptions 
                        options={currentQuestion.options}
                        selectedOption={logic.selectedOption}
                        handleOptionSelect={logic.handleOptionSelect}
                        showResult={logic.showResult}
                        correctAnswer={currentQuestion.correctAnswer}
                        topicGradient={activeGradient} // Nuevo prop para colorear selección
                    />
                </div>
            </div>

            {/* Bottom Controls & Feedback (Fixed at bottom) */}
            <QuizFeedback 
                showResult={logic.showResult}
                showExplanation={logic.showExplanation}
                question={currentQuestion}
                selectedOption={logic.selectedOption}
                handleCheckAnswer={logic.handleCheckAnswer}
                handleNextQuestion={logic.handleNextQuestion}
                isLastQuestion={logic.currentQuestionIndex === logic.quizData.questions.length - 1}
                topicGradient={activeGradient} // Nuevo prop para colorear el botón principal
            />
        </div>
    );
};

export default Quizzes;