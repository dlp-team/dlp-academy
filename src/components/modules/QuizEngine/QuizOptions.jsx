// src/components/modules/QuizEngine/QuizOptions.jsx
import React, { useCallback } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { RenderLatex, ANSWER_STATUS } from './QuizCommon';

const AnswerOption = React.memo(({ 
    index, option, isCorrect, isSelected, answerStatus, topicGradient, onSelect 
}) => {
    const getOptionStyles = useCallback(() => {
        let containerClass = "border-slate-200/50 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl";
        let circleClass = "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-200";
        let accentGradient = "";

        if (answerStatus === ANSWER_STATUS.IDLE && isSelected) {
            containerClass = `border-transparent bg-gradient-to-r ${topicGradient} text-white ring-4 ring-offset-2 dark:ring-offset-slate-900 shadow-2xl scale-[1.02]`;
            circleClass = "bg-white/20 text-white backdrop-blur-sm";
            accentGradient = "before:absolute before:inset-0 before:bg-white/10 before:rounded-2xl";
        } else if (answerStatus !== ANSWER_STATUS.IDLE) {
            if (isCorrect) {
                containerClass = "border-green-400 dark:border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/35 dark:to-emerald-900/35 text-green-800 dark:text-green-200 ring-2 ring-green-400 shadow-xl shadow-green-100 dark:shadow-green-950/30";
                circleClass = "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg";
            } else if (isSelected) {
                containerClass = "border-red-300 dark:border-red-500 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/35 dark:to-pink-900/35 text-red-700 dark:text-red-200 shadow-xl shadow-red-100 dark:shadow-red-950/30";
                circleClass = "bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg";
            } else {
                containerClass = "border-slate-100/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 opacity-40";
            }
        }

        return { containerClass, circleClass, accentGradient };
    }, [answerStatus, isSelected, isCorrect, topicGradient]);

    const { containerClass, circleClass, accentGradient } = getOptionStyles();
    const showCorrectIcon = answerStatus !== ANSWER_STATUS.IDLE && isCorrect;
    const showIncorrectIcon = answerStatus === ANSWER_STATUS.INCORRECT && isSelected;

    return (
        <button
            disabled={answerStatus !== ANSWER_STATUS.IDLE}
            onClick={onSelect}
            className={`group relative w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 overflow-hidden backdrop-blur-xl ${containerClass} ${accentGradient}`}
        >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base transition-all duration-300 shrink-0 ${circleClass}`}>
                {String.fromCharCode(65 + index)}
            </div>
            <div className="flex-1 min-w-0 text-base font-bold leading-snug overflow-x-auto pr-1 [&_.katex-display]:my-0 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex]:text-[1.02em]">
                <RenderLatex text={option} />
            </div>
            {showCorrectIcon && (
                <div className="flex items-center gap-2 animate-in slide-in-from-right">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-300" />
                </div>
            )}
            {showIncorrectIcon && (
                <div className="flex items-center gap-2 animate-in slide-in-from-right">
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-300" />
                </div>
            )}
        </button>
    );
});
AnswerOption.displayName = 'AnswerOption';

const QuizOptions = React.memo(({ 
    options, correctIndex, selectedAnswer, answerStatus, shouldUseGrid, topicGradient, onSelect 
}) => (
    <div className={`grid gap-4 ${shouldUseGrid ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {options.map((option, idx) => (
            <AnswerOption
                key={idx}
                index={idx}
                option={option}
                isCorrect={idx === correctIndex}
                isSelected={selectedAnswer === idx}
                answerStatus={answerStatus}
                topicGradient={topicGradient}
                onSelect={() => onSelect(idx)}
            />
        ))}
    </div>
));

QuizOptions.displayName = 'QuizOptions';
export default QuizOptions;