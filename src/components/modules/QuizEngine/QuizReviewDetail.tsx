// src/components/modules/QuizEngine/QuizReviewDetail.jsx
import React from 'react';
import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import { BlockMath } from 'react-katex';
import { RenderLatex } from './QuizCommon';

const QuizReviewDetail = ({ answersDetail = [], topicGradient }: any) => {
    if (!answersDetail.length) return null;

    return (
        <div className="mt-5 space-y-4 text-left">
            {answersDetail.map((entry: any, index: any) => {
                const userAnswer = typeof entry.userAnswerIndex === 'number' ? entry.options?.[entry.userAnswerIndex] : null;
                const correctAnswer = typeof entry.correctIndex === 'number' ? entry.options?.[entry.correctIndex] : null;

                return (
                    <article
                        key={`${entry.questionIndex}-${index}`}
                        className="rounded-2xl border border-slate-200/80 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-5 shadow-sm"
                    >
                        <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${topicGradient} text-white font-black text-sm flex items-center justify-center shrink-0`}>
                                {entry.questionIndex + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-2 leading-snug">
                                    <RenderLatex text={entry.questionText || 'Pregunta'} />
                                </h4>
                                {entry.formula && (
                                    <div className="mb-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 overflow-x-auto">
                                        <BlockMath math={entry.formula} />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className={`rounded-xl px-3 py-2 border ${entry.isCorrect ? 'border-emerald-200 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-900/25' : 'border-red-200 dark:border-red-700/60 bg-red-50 dark:bg-red-900/25'}`}>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Tu respuesta</p>
                                        <p className={`text-sm font-semibold ${entry.isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                                            {userAnswer ? <RenderLatex text={userAnswer} /> : 'Sin respuesta'}
                                        </p>
                                    </div>

                                    {!entry.isCorrect && (
                                        <div className="rounded-xl px-3 py-2 border border-emerald-200 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-900/25">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Respuesta correcta</p>
                                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                                {correctAnswer ? <RenderLatex text={correctAnswer} /> : 'No disponible'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="shrink-0 pt-0.5">
                                {entry.isCorrect ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
                                )}
                            </div>
                        </div>
                    </article>
                );
            })}

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <Circle className="w-3.5 h-3.5" />
                <span>Mostrando todas las preguntas del intento.</span>
            </div>
        </div>
    );
};

export default QuizReviewDetail;
