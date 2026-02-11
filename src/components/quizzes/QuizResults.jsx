import React from 'react';
import { Trophy, Target, Award } from 'lucide-react';
import ConfettiEffect from './QuizFeedback';
import { isPassed } from './QuizCommon';

const ResultsView = React.memo(({ 
    finalScore, correctCount, totalQuestions, topicGradient, confettiTrigger, accentColor, onRetry, onGoBack 
}) => {
    const passed = isPassed(finalScore);
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6">
            <ConfettiEffect triggerKey={confettiTrigger} accentColor={accentColor} />
            
            <div className="max-w-lg w-full relative">
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-[3rem] blur-3xl opacity-20`} />
                
                <div className="relative bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-10 text-center border border-white/50 overflow-hidden">
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
                            <p className="text-lg font-bold text-slate-600">
                                {passed ? '¡Excelente trabajo! 🎉' : 'Sigue practicando 💪'}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 my-10">
                            <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm p-6 rounded-3xl border border-white/50 shadow-lg">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Award className={`w-5 h-5 ${passed ? 'text-green-600' : 'text-slate-400'}`} />
                                </div>
                                <div className="text-4xl font-black text-slate-900">{correctCount}</div>
                                <div className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mt-1">Aciertos</div>
                            </div>
                            <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm p-6 rounded-3xl border border-white/50 shadow-lg">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Target className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="text-4xl font-black text-slate-900">{totalQuestions}</div>
                                <div className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mt-1">Total</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button 
                                onClick={onRetry} 
                                className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-2xl font-bold text-base transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
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
                    </div>
                </div>
            </div>
        </div>
    );
});

ResultsView.displayName = 'ResultsView';
export default ResultsView;