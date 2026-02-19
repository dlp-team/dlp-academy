// src/pages/Profile/components/StatsSidebar.jsx
import React, { useState } from 'react';
import { Award, Star, Zap, Target, Flame, BookOpen, Trophy, Users, Lock, X } from 'lucide-react';
import MiniStatsChart from './MiniStatsChart';

// ─── Badge Catalog ─────────────────────────────────────────────────────────────
export const BADGE_CATALOG = [
    { key: 'first_quiz',    label: 'Primer Test',   description: 'Completaste tu primer test',                 icon: Star,     color: 'from-amber-400 to-yellow-300',  glow: 'shadow-amber-400/40',   textColor: 'text-amber-600 dark:text-amber-400',   auto: true  },
    { key: 'perfect_score', label: 'Perfecto',       description: 'Obtuviste 100% en un test',                 icon: Zap,      color: 'from-emerald-400 to-green-300', glow: 'shadow-emerald-400/40', textColor: 'text-emerald-600 dark:text-emerald-400',auto: true  },
    { key: 'streak_5',      label: 'Racha x5',       description: '5 tests aprobados seguidos',                icon: Flame,    color: 'from-orange-500 to-red-400',    glow: 'shadow-orange-400/40',  textColor: 'text-orange-600 dark:text-orange-400',  auto: true  },
    { key: 'top_student',   label: 'Mejor Alumno',   description: 'Reconocimiento del profesor',               icon: Trophy,   color: 'from-indigo-500 to-violet-400', glow: 'shadow-indigo-400/40',  textColor: 'text-indigo-600 dark:text-indigo-400',  auto: false },
    { key: 'participacion', label: 'Participación',  description: 'Excelente participación en clase',          icon: Users,    color: 'from-sky-400 to-blue-400',      glow: 'shadow-sky-400/40',     textColor: 'text-sky-600 dark:text-sky-400',         auto: false },
    { key: 'esfuerzo',      label: 'Esfuerzo',       description: 'Destacada dedicación y esfuerzo',           icon: Target,   color: 'from-pink-500 to-rose-400',     glow: 'shadow-pink-400/40',    textColor: 'text-pink-600 dark:text-pink-400',       auto: false },
    { key: 'lector',        label: 'Gran Lector',    description: 'Completó todos los temas de una asignatura',icon: BookOpen, color: 'from-teal-400 to-cyan-400',     glow: 'shadow-teal-400/40',    textColor: 'text-teal-600 dark:text-teal-400',       auto: true  },
];

// ─── Badges Overlay ────────────────────────────────────────────────────────────
const BadgesOverlay = ({ badges, onClose }) => {
    const earnedKeys = new Set(badges.map(b => b.key));
    const earnedCount = earnedKeys.size;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-400/30">
                            <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">Mis Insignias</h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{earnedCount} de {BADGE_CATALOG.length} obtenidas</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress */}
                <div className="px-6 pt-5 pb-2">
                    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                        <span>Progreso</span>
                        <span>{Math.round((earnedCount / BADGE_CATALOG.length) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-700"
                            style={{ width: `${(earnedCount / BADGE_CATALOG.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Badges grid */}
                <div className="px-6 pb-6 pt-5 grid grid-cols-4 gap-5">
                    {BADGE_CATALOG.map(badge => {
                        const earnedBadge = badges.find(b => b.key === badge.key);
                        const earned = !!earnedBadge;
                        const Icon = badge.icon;
                        return (
                            <div
                                key={badge.key}
                                className={`flex flex-col items-center gap-2 transition-all duration-200 ${earned ? 'group' : 'opacity-35 grayscale'}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-white shadow-lg ${earned ? badge.glow + ' group-hover:scale-110' : ''} transition-transform duration-200`}>
                                    {earned ? <Icon className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
                                </div>
                                <span className={`text-xs font-semibold text-center leading-tight ${earned ? badge.textColor : 'text-gray-400 dark:text-gray-600'}`}>
                                    {badge.label}
                                </span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 text-center leading-tight">
                                    {earned
                                        ? (earnedBadge.earnedAt
                                            ? new Date(earnedBadge.earnedAt?.toDate ? earnedBadge.earnedAt.toDate() : earnedBadge.earnedAt).toLocaleDateString()
                                            : 'Obtenida')
                                        : badge.description}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ─── Inline Badges Card ────────────────────────────────────────────────────────
const BadgesCard = ({ badges = [], onClick }) => {
    const earnedKeys = new Set(badges.map(b => b.key));
    const earnedCount = earnedKeys.size;

    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all group"
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-400/30">
                    <Award className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Mis Insignias</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{earnedCount}/{BADGE_CATALOG.length} obtenidas</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-amber-500 transition-colors">Ver todas →</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-700"
                    style={{ width: `${(earnedCount / BADGE_CATALOG.length) * 100}%` }}
                />
            </div>

            {/* Badge icon preview */}
            <div className="flex flex-wrap gap-2">
                {BADGE_CATALOG.map(badge => {
                    const earned = earnedKeys.has(badge.key);
                    const Icon = badge.icon;
                    return (
                        <div
                            key={badge.key}
                            className={`w-9 h-9 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-white transition-all ${earned ? 'shadow-md opacity-100' : 'opacity-25 grayscale'}`}
                        >
                            {earned ? <Icon className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                        </div>
                    );
                })}
            </div>
        </button>
    );
};

// ─── Main StatsSidebar ─────────────────────────────────────────────────────────
const StatsSidebar = ({ chartData = [], role = 'student', loading = false, badges = [] }) => {
    const [showBadgesOverlay, setShowBadgesOverlay] = useState(false);

    return (
        <>
            <div className="space-y-6">
                {!loading && (
                    <MiniStatsChart
                        data={chartData}
                        title="Evolución de notas"
                        subtitle={role === 'teacher' ? 'Media de todos los alumnos' : 'Tus puntuaciones recientes'}
                        role={role}
                    />
                )}

                <BadgesCard badges={badges} onClick={() => setShowBadgesOverlay(true)} />
            </div>

            {showBadgesOverlay && (
                <BadgesOverlay badges={badges} onClose={() => setShowBadgesOverlay(false)} />
            )}
        </>
    );
};

export default StatsSidebar;