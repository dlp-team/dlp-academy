// src/pages/Profile/components/Notas.jsx
import React, { useState } from 'react';
import {
    ClipboardList, ChevronDown, ChevronUp, ArrowRight,
    TrendingUp, CheckCircle2, XCircle, BookOpen, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Notas — full-width panel
 *
 * Props:
 *   - subjectPerformance: [{ id, name, color, average, passRate, quizCount }]
 *   - recentActivity:     [{ id, quizTitle, subjectName, score, passed, date }]
 *   - role:               'student' | 'teacher'
 *   - teacherDashboardPath: string
 */

const gradeInfo = (score) => {
    if (score >= 90) return { label: 'Sobresaliente', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', bar: '#22c55e' };
    if (score >= 70) return { label: 'Notable',        color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-900/20',       bar: '#3b82f6' };
    if (score >= 60) return { label: 'Bien',           color: 'text-sky-600 dark:text-sky-400',         bg: 'bg-sky-50 dark:bg-sky-900/20',         bar: '#0ea5e9' };
    if (score >= 50) return { label: 'Aprobado',       color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-900/20',     bar: '#f59e0b' };
    return             { label: 'Suspenso',            color: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-900/20',         bar: '#ef4444' };
};

const ScoreRing = ({ score, size = 48 }) => {
    const radius = (size - 6) / 2;
    const circ = 2 * Math.PI * radius;
    const { bar, color } = gradeInfo(score);
    return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-100 dark:text-gray-700" />
                <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={bar} strokeWidth="3"
                    strokeDasharray={`${(score/100)*circ} ${circ}`} strokeLinecap="round" />
            </svg>
            <span className={`absolute text-xs font-bold ${color}`}>{score}</span>
        </div>
    );
};

const Notas = ({
    subjectPerformance = [],
    recentActivity = [],
    role = 'student',
    teacherDashboardPath = '/dashboard/stats',
}) => {
    const [showFinalGrades, setShowFinalGrades] = useState(false);
    const navigate = useNavigate ? useNavigate() : null;

    const overallAvg = subjectPerformance.length > 0
        ? Math.round(subjectPerformance.reduce((a, b) => a + b.average, 0) / subjectPerformance.length)
        : null;

    const overall = overallAvg !== null ? gradeInfo(overallAvg) : null;
    const passed  = recentActivity.filter(a => a.passed).length;
    const passRate = recentActivity.length > 0 ? Math.round((passed / recentActivity.length) * 100) : 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors overflow-hidden">

            {/* ── Top summary row ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5">
                {/* Icon + title */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-400/30 shrink-0">
                        <ClipboardList className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Notas</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{subjectPerformance.length} asignaturas · {recentActivity.length} tests</p>
                    </div>
                </div>

                {/* KPI chips */}
                {overall && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${overall.color} ${overall.bg}`}>
                            <Star className="w-3.5 h-3.5" />
                            {overallAvg}% · {overall.label}
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${passRate >= 70 ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'}`}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {passRate}% aprobados
                        </div>
                    </div>
                )}
            </div>

            {/* ── Quick subject bars ───────────────────────────────────────── */}
            {subjectPerformance.length > 0 && (
                <div className="px-6 pb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
                        {subjectPerformance.map(sub => {
                            const { bar, color } = gradeInfo(sub.average);
                            return (
                                <div key={sub.id}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate pr-2">{sub.name}</span>
                                        <span className={`font-bold shrink-0 ${color}`}>{sub.average}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${sub.average}%`, backgroundColor: bar }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Recent activity strip ────────────────────────────────────── */}
            {recentActivity.length > 0 && (
                <div className="px-6 pt-4 pb-2">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Actividad reciente
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {recentActivity.slice(0, 6).map(a => (
                            <div
                                key={a.id}
                                className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border text-center min-w-[80px] ${
                                    a.passed
                                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
                                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                }`}
                            >
                                <span className={`text-base font-bold ${a.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{a.score}%</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight max-w-[72px] truncate">{a.subjectName}</span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{a.date.toLocaleDateString('es', { day: '2-digit', month: 'short' })}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Toggle: Notas Finales ────────────────────────────────────── */}
            <div className="border-t border-gray-100 dark:border-gray-700 mt-3">
                <button
                    className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    onClick={() => setShowFinalGrades(f => !f)}
                >
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notas Finales por asignatura</span>
                    </div>
                    {showFinalGrades ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {showFinalGrades && (
                    <div className="border-t border-gray-50 dark:border-gray-700/50">
                        {subjectPerformance.length === 0 ? (
                            <div className="px-6 py-6 text-center text-sm text-gray-400">No hay datos.</div>
                        ) : (
                            <>
                                <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {subjectPerformance.map(sub => {
                                        const { label, color, bg } = gradeInfo(sub.average);
                                        return (
                                            <div key={sub.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors">
                                                <ScoreRing score={sub.average} size={44} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{sub.name}</span>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${color} ${bg}`}>{label}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">{sub.quizCount} tests</span>
                                                        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                                            {sub.passRate >= 50
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

                                {role === 'teacher' && (
                                    <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                        <button
                                            onClick={() => navigate && navigate(teacherDashboardPath)}
                                            className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                        >
                                            Ver estadísticas detalladas <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notas;