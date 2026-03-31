// src/components/modules/QuizEngine/QuizResults.jsx
import React, { useState } from 'react';
import { Trophy, Target, Award } from 'lucide-react';
import ConfettiEffect from './QuizFeedback';
import { isPassed } from './QuizCommon';
import QuizReviewDetail from './QuizReviewDetail';

const ResultsView = React.memo(({ 
    finalScore, correctCount, totalQuestions, answersDetail, topicGradient, confettiTrigger, accentColor, onRetry, onGoBack 
}: any) => {
    const passed = isPassed(finalScore);
    const [showReview, setShowReview] = useState(false);
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
            <ConfettiEffect triggerKey={confettiTrigger} accentColor={accentColor} />
            
            <div className="max-w-3xl w-full relative">
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-[3rem] blur-3xl opacity-20`} />
                
                <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-10 text-center border border-white/50 dark:border-slate-700/70 overflow-hidden">
                    {/* Decorative elements */}
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${topicGradient} rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2`} />
                    
                    <div className="relative z-10">
                        {/* Trophy Icon */}
                        <div className={`w-28 h-28 rounded-full mx-auto mb-8 flex items-center justify-center relative ${
                            passed ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 'bg-gradient-to-br from-red-400 to-pink-600'
                        } shadow-2xl`}>
                            <div className={`absolute inset-0 rounded-full blur-2xl ${
                                passed ? 'bg-green-400' : 'bg-red-400'
                            } opacity-50 animate-pulse`} />
                            <div className="relative">
                                {passed ? <Trophy className="w-14 h-14 text-white" /> : <Target className="w-14 h-14 text-white" />}
                            </div>
                        </div>
                        
                        {/* Score */}
                        <div className="mb-4">
                            <h2 className={`text-7xl md:text-8xl font-black mb-3 tracking-tighter bg-gradient-to-r ${
                                passed ? 'from-green-600 to-emerald-600' : 'from-red-600 to-pink-600'
                            } bg-clip-text text-transparent`}>
                                {finalScore}%
                            </h2>
                            <p className="text-lg font-bold text-slate-600 dark:text-slate-300">
                                {passed ? '¡Excelente trabajo! 🎉' : 'Sigue practicando 💪'}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 my-10">
                            <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/90 dark:to-slate-900/80 backdrop-blur-sm p-6 rounded-3xl border border-white/50 dark:border-slate-700/70 shadow-lg">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Award className={`w-5 h-5 ${passed ? 'text-green-600' : 'text-slate-400'}`} />
                                </div>
                                <div className="text-4xl font-black text-slate-900 dark:text-white">{correctCount}</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mt-1">Aciertos</div>
                            </div>
                            <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/90 dark:to-slate-900/80 backdrop-blur-sm p-6 rounded-3xl border border-white/50 dark:border-slate-700/70 shadow-lg">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Target className="w-5 h-5 text-slate-400 dark:text-slate-300" />
                                </div>
                                <div className="text-4xl font-black text-slate-900 dark:text-white">{totalQuestions}</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mt-1">Total</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button 
                                onClick={onRetry} 
                                className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-2xl font-bold text-base transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Intentar de nuevo
                            </button>
                            <button 
                                onClick={onGoBack} 
                                className={`group relative w-full py-4 text-white rounded-2xl font-bold text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 bg-gradient-to-r ${topicGradient} overflow-hidden`}
                            >
                                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                                <span className="relative z-10">Volver al Tema</span>
                            </button>
                        </div>

                        {Array.isArray(answersDetail) && answersDetail.length > 0 && (
                            <div className="mt-8 text-left">
                                <button
                                    onClick={() => setShowReview((prev) => !prev)}
                                    className="w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 font-semibold transition-colors"
                                >
                                    {showReview ? 'Ocultar revision detallada' : 'Ver revision detallada'}
                                </button>
                                {showReview && (
                                    <QuizReviewDetail answersDetail={answersDetail} topicGradient={topicGradient} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

ResultsView.displayName = 'ResultsView';
export default ResultsView;