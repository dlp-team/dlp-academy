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
                
                let buttonStyle = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600";
                
                if (showResult) {
                    if (isCorrect) {
                        buttonStyle = "bg-emerald-100 border-emerald-500 text-emerald-800 shadow-md transform scale-[1.02]";
                    } else if (isSelected && !isCorrect) {
                        buttonStyle = "bg-red-50 border-red-200 text-red-400 opacity-70";
                    } else {
                        buttonStyle = "bg-slate-50 border-slate-100 text-slate-400 opacity-50";
                    }
                } else if (isSelected) {
                    buttonStyle = "bg-indigo-600 border-indigo-600 text-white shadow-lg transform scale-[1.02]";
                }

                return (
                    <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={showResult}
                        className={`w-full p-6 rounded-2xl border-2 text-left font-semibold text-lg transition-all duration-200 flex items-center gap-4 group ${buttonStyle}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                            ${isSelected || (showResult && isCorrect) ? 'border-current' : 'border-slate-300 text-slate-300 group-hover:border-indigo-300 group-hover:text-indigo-300'}
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