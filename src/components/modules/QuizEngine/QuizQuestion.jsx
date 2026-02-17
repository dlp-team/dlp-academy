import React from 'react';
import { BlockMath } from 'react-katex';
import { RenderLatex } from './QuizCommon';

const QuestionCard = React.memo(({ questionNumber, question, formula, topicGradient }) => (
    <div className="relative mb-8 group">
        <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        <div className="relative bg-white/90 backdrop-blur-2xl rounded-[2rem] p-8 md:p-10 shadow-xl border border-white/50 overflow-hidden">
            {/* Top accent */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${topicGradient} rounded-t-[2rem]`} />
            
            {/* Decorative corner */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${topicGradient} opacity-5 rounded-bl-full`} />
            
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-relaxed text-center relative z-10">
                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${topicGradient} text-white text-lg font-black mr-4 shadow-lg`}>
                    {questionNumber}
                </span>
                <RenderLatex text={question} />
            </h2>

            {formula && (
                <div className="mt-8 bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-100 shadow-inner">
                    <div className="flex justify-center">
                        <BlockMath math={formula} />
                    </div>
                </div>
            )}
        </div>
    </div>
));

QuestionCard.displayName = 'QuestionCard';
export default QuestionCard;