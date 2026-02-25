// src/components/modules/QuizEngine/QuizCommon.jsx
import React, { useMemo } from 'react';
import { 
    RefreshCcw, Zap, Trophy, ArrowRight, HelpCircle, CheckCircle2, XCircle 
} from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import { ICON_MAP } from '../../../utils/subjectConstants';
import 'katex/dist/katex.min.css';

// ==================== CONSTANTS ====================

export const ANSWER_STATUS = {
    IDLE: 'idle',
    CORRECT: 'correct',
    INCORRECT: 'incorrect'
};

export const VIEW_STATES = {
    LOADING: 'loading',
    REVIEW: 'review',
    QUIZ: 'quiz',
    RESULTS: 'results'
};

export const COLOR_MAP = {
    blue: '#2563eb',
    indigo: '#4f46e5',
    purple: '#9333ea',
    green: '#16a34a',
    red: '#dc2626',
    orange: '#ea580c',
    amber: '#d97706',
    teal: '#0d9488',
    cyan: '#0891b2',
    pink: '#db2777',
    rose: '#e11d48'
};

export const DEFAULT_QUIZ = {
    title: "Test de Prueba",
    subtitle: "Matemáticas",
    formulas: [],
    questions: [{ question: "Error al cargar", options: ["Error"], correctIndex: 0 }]
};

export const PASSING_SCORE = 50;
export const CONFETTI_COUNT = 50;
export const CONFETTI_DURATION = 2500;
export const VIBRATION_DURATION = 200;
export const MAX_OPTION_LENGTH_FOR_GRID = 50;

// ==================== UTILITY FUNCTIONS ====================

export const extractColorFromGradient = (gradient) => {
    if (!gradient) return null;
    const mainColorName = gradient.split(' ')[0].replace('from-', '').split('-')[0];
    return COLOR_MAP[mainColorName] || null;
};

export const calculateScore = (correctCount, totalQuestions) => 
    Math.round((correctCount / totalQuestions) * 100);

export const isPassed = (score) => score >= PASSING_SCORE;

// ==================== SHARED COMPONENTS ====================

export const RenderLatex = React.memo(({ text }) => {
    if (!text) return null;
    if (typeof text !== 'string') return text;

    // Simplified regex — $[^$]+$ catches ANY content between dollar signs
    const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^$]+\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\])/g;

    // If no math delimiters found at all, check for bare LaTeX commands
    if (!mathRegex.test(text)) {
        if (/\\(?:frac|sqrt|int|sum|prod|lim|vec|partial|alpha|beta|gamma|delta|theta|lambda|pi|infty|cdot|times|div|pm|leq|geq|neq|approx|nabla|text|mathrm|mathbf|begin|end|left|right)/.test(text)) {
            try { return <InlineMath math={text} errorColor="#dc2626" />; }
            catch { return <span>{text}</span>; }
        }
        return <span>{text}</span>;
    }

    // Reset lastIndex after .test()
    mathRegex.lastIndex = 0;
    const parts = text.split(mathRegex);

    return (
        <span>
            {parts.map((part, index) => {
                if (!part) return null;

                // Display math: $$...$$
                if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
                    const math = part.slice(2, -2).trim();
                    if (!math) return null;
                    try { return <BlockMath key={index} math={math} errorColor="#dc2626" />; }
                    catch { return <code key={index} className="text-red-500 text-xs bg-red-50 px-1 rounded">{math}</code>; }
                }

                // Inline math: $...$
                if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
                    const math = part.slice(1, -1);
                    if (!math) return null;
                    try { return <InlineMath key={index} math={math} errorColor="#dc2626" />; }
                    catch { return <code key={index} className="text-red-500 text-xs bg-red-50 px-1 rounded">{math}</code>; }
                }

                // Inline math: \(...\)
                if (part.startsWith('\\(') && part.endsWith('\\)')) {
                    const math = part.slice(2, -2);
                    if (!math) return null;
                    try { return <InlineMath key={index} math={math} errorColor="#dc2626" />; }
                    catch { return <code key={index} className="text-red-500 text-xs bg-red-50 px-1 rounded">{math}</code>; }
                }

                // Display math: \[...\]
                if (part.startsWith('\\[') && part.endsWith('\\]')) {
                    const math = part.slice(2, -2).trim();
                    if (!math) return null;
                    try { return <BlockMath key={index} math={math} errorColor="#dc2626" />; }
                    catch { return <code key={index} className="text-red-500 text-xs bg-red-50 px-1 rounded">{math}</code>; }
                }

                // Plain text
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
});
RenderLatex.displayName = 'RenderLatex';

export const FormulaDisplay = React.memo(({ formula, size = 'text-lg' }) => (
    <div className={`${size} font-serif text-slate-800 select-text overflow-x-auto py-1`}>
        <BlockMath math={formula} />
    </div>
));
FormulaDisplay.displayName = 'FormulaDisplay';

export const LoadingSpinner = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col items-center justify-center">
        <div className="relative">
            <RefreshCcw className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <div className="absolute inset-0 w-12 h-12 bg-indigo-400 rounded-full blur-xl opacity-50 animate-pulse" />
        </div>
        <p className="text-slate-600 text-sm font-semibold animate-pulse">Cargando tu test...</p>
    </div>
);

export const SubjectIcon = React.memo(({ iconKey, topicGradient }) => {
    const SubjectIconComponent = ICON_MAP[iconKey];
    return (
        <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300`} />
            <div className={`relative inline-flex items-center justify-center w-20 h-20 rounded-3xl shadow-2xl bg-gradient-to-br ${topicGradient} text-white transform transition-transform duration-300 group-hover:scale-105`}>
                {SubjectIconComponent ? (
                    <SubjectIconComponent className="w-10 h-10" />
                ) : (
                    <span className="text-4xl font-black">{iconKey}</span>
                )}
            </div>
        </div>
    );
});
SubjectIcon.displayName = 'SubjectIcon';

export const ProgressBar = React.memo(({ current, total, gradient }) => (
    <div className="fixed top-0 left-0 right-0 z-30 h-2 bg-slate-200/50 backdrop-blur-sm">
        <div 
            className={`h-full transition-all duration-700 ease-out bg-gradient-to-r ${gradient} shadow-lg relative`}
            style={{ width: `${(current / total) * 100}%` }}
        >
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-sm" />
        </div>
    </div>
));
ProgressBar.displayName = 'ProgressBar';

export const QuizFooter = React.memo(({ 
    answerStatus, selectedAnswer, isLastQuestion, topicGradient, onCheck, onNext 
}) => (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-6 pt-4 px-4 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-2xl p-3 rounded-3xl shadow-2xl border border-white/50 flex items-center justify-between gap-4 pl-6">
            <div className="hidden md:flex items-center gap-3">
                {answerStatus === ANSWER_STATUS.CORRECT && (
                    <span className="text-green-600 font-black flex items-center gap-2 text-sm px-4 py-2 rounded-2xl bg-green-50">
                        <CheckCircle2 className="w-5 h-5"/> ¡Correcto!
                    </span>
                )}
                {answerStatus === ANSWER_STATUS.INCORRECT && (
                    <span className="text-red-600 font-black flex items-center gap-2 text-sm px-4 py-2 rounded-2xl bg-red-50">
                        <XCircle className="w-5 h-5"/> Incorrecto
                    </span>
                )}
                {answerStatus === ANSWER_STATUS.IDLE && (
                    <span className="text-slate-500 font-bold flex items-center gap-2 text-sm px-4 py-2 rounded-2xl bg-slate-100">
                        <HelpCircle className="w-5 h-5"/> Selecciona una opción
                    </span>
                )}
            </div>

            <button
                disabled={selectedAnswer === null && answerStatus === ANSWER_STATUS.IDLE}
                onClick={answerStatus === ANSWER_STATUS.IDLE ? onCheck : onNext}
                className={`group relative flex-1 md:flex-none md:w-52 h-14 rounded-2xl font-black text-base text-white transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden ${
                    answerStatus === ANSWER_STATUS.IDLE 
                        ? `bg-gradient-to-r ${topicGradient} hover:shadow-2xl hover:-translate-y-0.5` 
                        : answerStatus === ANSWER_STATUS.CORRECT 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-2xl hover:-translate-y-0.5' 
                            : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:shadow-2xl hover:-translate-y-0.5'
                }`}
            >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                <span className="relative z-10 flex items-center gap-2">
                    {answerStatus === ANSWER_STATUS.IDLE ? (
                        <>Comprobar <Zap className="w-5 h-5" /></>
                    ) : isLastQuestion ? (
                        <>Finalizar <Trophy className="w-5 h-5" /></>
                    ) : (
                        <>Siguiente <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" /></>
                    )}
                </span>
            </button>
        </div>
    </div>
));
QuizFooter.displayName = 'QuizFooter';