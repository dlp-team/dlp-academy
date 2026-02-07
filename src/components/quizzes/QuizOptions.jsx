// src/components/quizzes/QuizOptions.jsx
import React from 'react';
import { RenderLatex } from './QuizCommon';

const QuizOptions = ({ 
    options, 
    selectedOption, 
    handleOptionSelect, 
    showResult, 
    correctAnswer 
}) => {
    return (
        <div className="grid grid-cols-1 gap-4 mb-24">
            {options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === correctAnswer;
                
                let buttonStyle = "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-400";
                
                if (showResult) {
                    if (isCorrect) {
                        buttonStyle = "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300 shadow-md transform scale-[1.02]";
                    } else if (isSelected && !isCorrect) {
                        buttonStyle = "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-400 dark:text-red-400 opacity-70";
                    } else {
                        buttonStyle = "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-50";
                    }
                } else if (isSelected) {
                    buttonStyle = "bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white shadow-lg transform scale-[1.02]";
                }

                return (
                    <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={showResult}
                        className={`w-full p-6 rounded-2xl border-2 text-left font-semibold text-lg transition-all duration-200 flex items-center gap-4 group ${buttonStyle}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                            ${isSelected || (showResult && isCorrect) ? 'border-current' : 'border-slate-300 dark:border-slate-600 text-slate-300 dark:text-slate-500 group-hover:border-indigo-300 dark:group-hover:border-indigo-600 group-hover:text-indigo-300 dark:group-hover:text-indigo-400'}
                        `}>
                            {String.fromCharCode(65 + idx)}
                        </div>
                        <div className="flex-1">
                            <RenderLatex text={option} />
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default QuizOptions;