// src/components/quizzes/QuizQuestion.jsx
import React from 'react';
import { RenderLatex } from './QuizCommon';

const QuizQuestion = ({ question }) => {
    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-6 min-h-[200px] flex items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50"></div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed">
                <RenderLatex text={question.question} />
            </h2>
        </div>
    );
};

export default QuizQuestion;