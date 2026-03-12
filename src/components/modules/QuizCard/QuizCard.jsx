// src/components/modules/QuizCard/QuizCard.jsx
import React, { useRef } from 'react';
import { Timer, Play, RotateCcw, Trophy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { RenderLatex } from '../QuizEngine/QuizCommon';
import 'katex/dist/katex.min.css';

const QuizCard = ({
    quiz,
    navigate,
    subjectId,
    topicId,
    permissions,
    activeMenuId,
    setActiveMenuId,
    handleMenuClick,
    deleteQuiz
}) => {
    const menuId = useRef(`quiz-menu-${quiz.id || Math.random().toString(36).substr(2, 9)}`).current;
    const hasScore = quiz.score !== undefined && quiz.score !== null;
    const isPassed = hasScore && quiz.score >= 50;
    const isMenuOpen = activeMenuId === menuId;

    const colorSchemes = {
        emerald: {
            bar: 'bg-emerald-500',
            icon: 'bg-emerald-100 dark:bg-emerald-950/40',
            badge: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30',
            button: 'bg-emerald-500 text-white hover:bg-emerald-600 dark:hover:bg-emerald-600'
        },
        blue: {
            bar: 'bg-blue-500',
            icon: 'bg-blue-100 dark:bg-blue-950/40',
            badge: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30',
            button: 'bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-600'
        },
        violet: {
            bar: 'bg-violet-500',
            icon: 'bg-violet-100 dark:bg-violet-950/40',
            badge: 'text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/30',
            button: 'bg-violet-500 text-white hover:bg-violet-600 dark:hover:bg-violet-600'
        },
        slate: {
            bar: 'bg-slate-500',
            icon: 'bg-slate-100 dark:bg-slate-950/40',
            badge: 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/30',
            button: 'bg-slate-500 text-white hover:bg-slate-600 dark:hover:bg-slate-600'
        }
    };

    const getQuizIcon = (type, level) => {
        if (level) {
            const levelLower = level.toLowerCase();
            if (levelLower.includes('básico') || levelLower.includes('basico') || levelLower.includes('principiante'))
                return { icon: '🧪', colorKey: 'emerald', level: 'Básico' };
            if (levelLower.includes('intermedio') || levelLower.includes('medio'))
                return { icon: '📖', colorKey: 'blue', level: 'Intermedio' };
            if (levelLower.includes('avanzado') || levelLower.includes('experto'))
                return { icon: '🏆', colorKey: 'violet', level: 'Avanzado' };
        }

        switch(type) {
            case 'basic': return { icon: '🧪', colorKey: 'emerald', level: 'Básico' };
            case 'advanced': return { icon: '📖', colorKey: 'blue', level: 'Intermedio' };
            case 'final': return { icon: '🏆', colorKey: 'violet', level: 'Avanzado' };
            default: return { icon: '📝', colorKey: 'slate', level: 'Test' };
        }
    };

    const { icon, level: displayLevel, colorKey } = getQuizIcon(quiz.type, quiz.level);
    const colors = colorSchemes[colorKey];

    return (
        <div
            className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
            onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}`)}
        >
            {/* Card body */}
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl h-full flex flex-col group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-all duration-300">

                {/* Color accent bar */}
                <div className={`h-1 ${colors.bar}`} />

                <div className="relative p-4 flex flex-col gap-3 flex-1">

                    {/* Header: Icon + Level + Menu */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-lg ${colors.icon} flex items-center justify-center text-lg flex-shrink-0`}>
                                {icon}
                            </div>
                            {/* Level badge */}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${colors.badge}`}>
                                {displayLevel}
                            </span>
                        </div>

                        {/* Menu button */}
                        {permissions?.canEdit && (
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleMenuClick ? handleMenuClick(e, menuId) : setActiveMenuId(isMenuOpen ? null : menuId); }}
                                    className="p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                                {isMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                                        <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-40 text-sm text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}/edit`); }}
                                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-semibold text-indigo-600 dark:text-indigo-400 transition-colors"
                                            >
                                                <Pencil className="w-3.5 h-3.5" /> Editar
                                            </button>
                                            <div className="border-t border-slate-100 dark:border-slate-700 my-0.5" />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); if (deleteQuiz) deleteQuiz(quiz.id); }}
                                                className="w-full px-3 py-1.5 text-left hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 flex items-center gap-2 font-semibold transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quiz title */}
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2 text-sm leading-tight" title={quiz.name}>
                            <RenderLatex text={quiz.name || "Test"} />
                        </h3>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                        <Timer className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>15 min aprox</span>
                    </div>

                    {/* Score bar (only if completed) */}
                    {hasScore && (
                        <div className="mt-auto space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Puntuación</span>
                                <span className={`font-bold text-sm ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                    {quiz.score}%
                                </span>
                            </div>
                            <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        isPassed ? 'bg-emerald-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${quiz.score}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Action button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}`); }}
                        className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 mt-auto ${
                            hasScore
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                : `${colors.button} shadow-sm hover:shadow-md`
                        }`}
                    >
                        {hasScore ? (
                            <>
                                <RotateCcw className="w-3.5 h-3.5" /> Reintentar
                            </>
                        ) : (
                            <>
                                <Play className="w-3.5 h-3.5 fill-current" /> Empezar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizCard;
};

export default QuizCard;
