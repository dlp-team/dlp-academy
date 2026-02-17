import React, { useCallback } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { RenderLatex, ANSWER_STATUS } from './QuizCommon';

const AnswerOption = React.memo(({ 
    index, option, isCorrect, isSelected, answerStatus, topicGradient, onSelect 
}) => {
    const getOptionStyles = useCallback(() => {
        let containerClass = "border-slate-200/50 bg-white/80 text-slate-700 hover:border-slate-300 hover:bg-white hover:shadow-xl";
        let circleClass = "bg-slate-100 text-slate-500";
        let accentGradient = "";

        if (answerStatus === ANSWER_STATUS.IDLE && isSelected) {
            containerClass = `border-transparent bg-gradient-to-r ${topicGradient} text-white ring-4 ring-offset-2 shadow-2xl scale-[1.02]`;
            circleClass = "bg-white/20 text-white backdrop-blur-sm";
            accentGradient = "before:absolute before:inset-0 before:bg-white/10 before:rounded-2xl";
        } else if (answerStatus !== ANSWER_STATUS.IDLE) {
            if (isCorrect) {
                containerClass = "border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 ring-2 ring-green-400 shadow-xl shadow-green-100";
                circleClass = "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg";
            } else if (isSelected) {
                containerClass = "border-red-300 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 shadow-xl shadow-red-100";
                circleClass = "bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg";
            } else {
                containerClass = "border-slate-100/50 bg-slate-50/50 text-slate-400 opacity-40";
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
            <div className="flex-1 text-base font-bold leading-snug">
                <RenderLatex text={option} />
            </div>
            {showCorrectIcon && (
                <div className="flex items-center gap-2 animate-in slide-in-from-right">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
            )}
            {showIncorrectIcon && (
                <div className="flex items-center gap-2 animate-in slide-in-from-right">
                    <XCircle className="w-6 h-6 text-red-600" />
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