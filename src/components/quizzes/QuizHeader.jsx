// src/components/quizzes/QuizHeader.jsx
import React from 'react';
import { X, Zap } from 'lucide-react';

const QuizHeader = ({ 
    quizData, 
    currentQuestionIndex, 
    streak, 
    score, 
    handleGoBack, 
    getProgressColor, 
    getStreakColor 
}) => {
    return (
        <div className="flex items-center justify-between mb-8">
            <button onClick={handleGoBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
            </button>
            
            <div className="flex-1 mx-6">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    <span>Progreso</span>
                    <span>{currentQuestionIndex + 1} / {quizData.questions.length}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ease-out rounded-full ${getProgressColor()}`} 
                        style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1 font-black ${getStreakColor()} transition-colors`}>
                    <Zap className={`w-5 h-5 ${streak > 0 ? 'fill-current' : ''}`} />
                    <span>{streak}</span>
                </div>
                <div className="bg-slate-900 text-white px-3 py-1 rounded-lg font-mono font-bold text-sm">
                    {score} pts
                </div>
            </div>
        </div>
    );
};

export default QuizHeader;