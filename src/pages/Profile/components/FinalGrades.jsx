// src/pages/Profile/components/FinalGrades.jsx
import React, { useState } from 'react';
import { ClipboardList, ChevronDown, ChevronUp, ArrowRight, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * FinalGrades
 * 
 * Props:
 *   - subjectPerformance: array of { id, name, color, average, passRate, quizCount }
 *   - role: 'student' | 'teacher'
 *   - recentActivity: array of { id, quizTitle, subjectName, score, passed, date }
 *   - teacherDashboardPath: string (path to redirect teacher)
 */

const gradeLabel = (score) => {
    if (score >= 90) return { label: 'Sobresaliente', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
    if (score >= 70) return { label: 'Notable', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    if (score >= 60) return { label: 'Bien', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' };
    if (score >= 50) return { label: 'Aprobado', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' };
    return { label: 'Suspenso', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
};

const ScoreRing = ({ score, size = 48 }) => {
    const radius = (size - 6) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDash = (score / 100) * circumference;
    const { color } = gradeLabel(score);
    const strokeColor = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-100 dark:text-gray-700" />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={strokeColor} strokeWidth="3"
                    strokeDasharray={`${strokeDash} ${circumference}`} strokeLinecap="round" />
            </svg>
            <span className={`absolute text-xs font-bold ${color}`}>{score}</span>
        </div>
    );
};

const FinalGrades = ({
    subjectPerformance = [],
    role = 'student',
    recentActivity = [],
    teacherDashboardPath = '/dashboard/stats',
}) => {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate ? useNavigate() : null;

    const overallAvg = subjectPerformance.length > 0
        ? Math.round(subjectPerformance.reduce((a, b) => a + b.average, 0) / subjectPerformance.length)
        : null;

    const { label: overallLabel, color: overallColor, bg: overallBg } = overallAvg !== null ? gradeLabel(overallAvg) : { label: '--', color: 'text-gray-400', bg: '' };

    const handleNavigate = () => {
        if (navigate) navigate(teacherDashboardPath);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors overflow-hidden">
            {/* Header - always visible */}
            <button
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                onClick={() => setExpanded(e => !e)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-400/30">
                        <ClipboardList className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                            {role === 'teacher' ? 'Estadísticas Generales' : 'Notas Finales'}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {subjectPerformance.length} asignaturas
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {overallAvg !== null && (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${overallColor} ${overallBg}`}>
                            {overallAvg}% · {overallLabel}
                        </div>
                    )}
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
            </button>

            {/* Expanded content */}
            {expanded && (
                <div className="border-t border-gray-100 dark:border-gray-700">
                    {subjectPerformance.length === 0 ? (
                        <div className="px-6 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                            No hay datos de notas disponibles.
                        </div>
                    ) : (
                        <>
                            {/* Subject grades list */}
                            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {subjectPerformance.map((sub) => {
                                    const { label, color, bg } = gradeLabel(sub.average);
                                    return (
                                        <div key={sub.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                            <ScoreRing score={sub.average} size={44} />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{sub.name}</span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${color} ${bg}`}>{label}</span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">{sub.quizCount} tests</span>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                                        {sub.passRate >= 70
                                                            ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                            : <XCircle className="w-3 h-3 text-red-400" />}
                                                        {sub.passRate}% aprobados
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Recent activity snippet */}
                            {recentActivity.length > 0 && (
                                <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/10">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        Últimas actividades
                                    </p>
                                    <div className="space-y-1.5">
                                        {recentActivity.slice(0, 3).map((a) => (
                                            <div key={a.id} className="flex items-center justify-between text-xs">
                                                <span className="text-gray-600 dark:text-gray-300 truncate max-w-[60%]">{a.quizTitle}</span>
                                                <span className={`font-bold ${a.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{a.score}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CTA for teacher */}
                            {role === 'teacher' && (
                                <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                    <button
                                        onClick={handleNavigate}
                                        className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Ver estadísticas detalladas
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default FinalGrades;