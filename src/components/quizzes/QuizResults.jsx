// src/components/quizzes/QuizResults.jsx
import React from 'react';
import { Trophy, Target, RefreshCcw } from 'lucide-react';
import { ConfettiEffect } from './QuizCommon';

const QuizResults = ({
    score,
    correctCount,
    quizData,
    topicGradient,
    handleRetry,
    handleGoBack
}) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
            {score > 0 && <ConfettiEffect triggerKey={true} />}
            
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center relative z-10 animate-in zoom-in-95 duration-500">
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${topicGradient} flex items-center justify-center shadow-lg shadow-indigo-500/30`}>
                    <Trophy className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-black text-slate-800 mb-2">¡Quiz Completado!</h2>
                <p className="text-slate-500 font-medium mb-8">Has dominado este tema</p>

                <div className="bg-slate-900 text-white rounded-2xl p-6 mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Puntuación Final</div>
                    <div className="text-5xl font-black tracking-tighter group-hover:scale-110 transition-transform">{score}</div>
                </div>

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
    );
};

export default QuizResults;