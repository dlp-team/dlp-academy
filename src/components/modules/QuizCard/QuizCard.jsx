// src/components/modules/QuizCard/QuizCard.jsx
import React, { useRef } from 'react';
import { Timer, Play, RotateCcw, Trophy, XCircle, ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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

    const getQuizIcon = (type, level) => {
        if (level) {
            const levelLower = level.toLowerCase();
            if (levelLower.includes('básico') || levelLower.includes('basico') || levelLower.includes('principiante'))
                return { icon: '🧪', color: 'from-emerald-500 to-teal-600', level: 'Básico' };
            if (levelLower.includes('intermedio') || levelLower.includes('medio'))
                return { icon: '📖', color: 'from-blue-500 to-indigo-600', level: 'Intermedio' };
            if (levelLower.includes('avanzado') || levelLower.includes('experto'))
                return { icon: '🏆', color: 'from-violet-500 to-purple-600', level: 'Avanzado' };
        }

        switch(type) {
            case 'basic': return { icon: '🧪', color: 'from-emerald-500 to-teal-600', level: 'Básico' };
            case 'advanced': return { icon: '📖', color: 'from-blue-500 to-indigo-600', level: 'Intermedio' };
            case 'final': return { icon: '🏆', color: 'from-violet-500 to-purple-600', level: 'Avanzado' };
            default: return { icon: '📝', color: 'from-slate-500 to-slate-600', level: 'Test' };
        }
    };

    const { icon, level: displayLevel, color } = getQuizIcon(quiz.type, quiz.level);

    const handleEditClick = (e) => {
        e.stopPropagation();
        setActiveMenuId(null);
        navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}/edit`);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setActiveMenuId(null);
        if (deleteQuiz) deleteQuiz(quiz.id);
    };

    return (
        <div
            className="group relative rounded-3xl overflow-visible transition-all duration-500 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}`)}
        >
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-3xl blur-2xl opacity-0 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity duration-500`} />

            {/* Card body */}
            <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl overflow-visible group-hover:border-slate-200 dark:group-hover:border-slate-700 group-hover:shadow-2xl dark:group-hover:shadow-slate-950/50 transition-all duration-500">

                {/* Color bar top */}
                <div className="relative h-1.5 overflow-hidden rounded-t-3xl">
                    <div className={`absolute inset-0 bg-gradient-to-r ${color}`} />
                </div>

                {/* Decorative bg elements */}
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${color} rounded-full blur-3xl opacity-5 dark:opacity-10 -translate-y-1/2 translate-x-1/4`} />

                {/* 3-dot menu */}
                {permissions?.canEdit && (
                    <div className="absolute top-4 right-4 z-30">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleMenuClick ? handleMenuClick(e, menuId) : setActiveMenuId(isMenuOpen ? null : menuId); }}
                            className="p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                        {isMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-40 text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95">
                                    <button
                                        onClick={handleEditClick}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400"
                                    >
                                        <Pencil className="w-4 h-4" /> Editar Test
                                    </button>
                                    <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                                    <button
                                        onClick={handleDeleteClick}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" /> Eliminar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="relative p-6 flex flex-col gap-5">

                    {/* Header row: icon + level badge + score */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Icon */}
                            <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                <span className="text-xl">{icon}</span>
                            </div>
                            {/* Level badge */}
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r ${color} text-white shadow-sm`}>
                                {displayLevel}
                            </span>
                        </div>

                        {/* Score badge */}
                        {hasScore && (
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-all duration-300 ${
                                isPassed
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
                                    : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800'
                            }`}>
                                {isPassed ? (
                                    <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <XCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                                )}
                                <span className={`text-xs font-black ${
                                    isPassed ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-300'
                                }`}>
                                    {quiz.score}%
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Quiz name */}
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight line-clamp-2 mb-1.5 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" title={quiz.name}>
                            <RenderLatex text={quiz.name || "Test Práctico"} />
                        </h3>
                        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-sm font-medium">
                            <div className="flex items-center gap-1.5">
                                <Timer className="w-3.5 h-3.5" />
                                <span>15 min aprox</span>
                            </div>
                            {hasScore && (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                    isPassed
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400'
                                }`}>
                                    {isPassed ? 'Aprobado' : 'No aprobado'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Score bar (only if completed) */}
                    {hasScore && (
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                                <span className="text-slate-400 dark:text-slate-500">Puntuación</span>
                                <span className={isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}>{quiz.score}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                                        isPassed ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-red-400 to-rose-500'
                                    }`}
                                    style={{ width: `${quiz.score}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Action button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}`); }}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                            hasScore
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                : `bg-gradient-to-r ${color} text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`
                        }`}
                    >
                        {hasScore ? (
                            <>
                                <RotateCcw className="w-4 h-4" /> Reintentar
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 fill-current" /> Comenzar
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizCard;
