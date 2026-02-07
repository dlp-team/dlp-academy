// src/components/quizzes/QuizFeedback.jsx
import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { RenderLatex } from './QuizCommon';

const QuizFeedback = ({ 
    showResult, 
    showExplanation, 
    question, 
    selectedOption, 
    handleCheckAnswer, 
    handleNextQuestion, 
    isLastQuestion 
}) => {
    const isCorrect = selectedOption === question.correctAnswer;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 md:p-6 z-40">
            <div className="max-w-3xl mx-auto flex flex-col gap-4">
                
                {/* Explanation Banner */}
                {showExplanation && (
                    <div className={`rounded-xl p-4 animate-in slide-in-from-bottom-5 fade-in duration-300 ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800'}`}>
                        <div className="flex items-start gap-3">
                            {isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <XCircle className="w-6 h-6 text-red-500 dark:text-red-400 shrink-0" />}
                            <div>
                                <h4 className={`font-bold mb-1 ${isCorrect ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
                                    {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                                </h4>
                                <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                    <strong className={`block ${isCorrect ? 'text-slate-800 dark:text-slate-200' : 'text-slate-800 dark:text-slate-200'} mb-1 flex items-center gap-1`}><HelpCircle className="w-3 h-3" /> Explicación:</strong>
                                    <RenderLatex text={question.explanation} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <button
                    onClick={showResult ? handleNextQuestion : handleCheckAnswer}
                    disabled={selectedOption === null}
                    className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2
                        ${selectedOption === null 
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-500 cursor-not-allowed' 
                            : showResult 
                                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 hover:-translate-y-1' 
                                : 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-500 dark:hover:bg-indigo-600 hover:-translate-y-1'
                        }
                    `}
                >
                    {showResult ? (
                        <>Siguiente <ArrowRight className="w-5 h-5" /></>
                    ) : (
                        'Comprobar'
                    )}
                </button>
            </div>
        </div>
    );
};

export default QuizFeedback;