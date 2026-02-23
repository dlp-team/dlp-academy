// src/pages/Profile/components/BadgesSection.jsx
import React, { useState } from 'react';
import { Award, Star, Zap, Target, Flame, BookOpen, Trophy, Users, ChevronDown, ChevronUp, Lock } from 'lucide-react';

/**
 * BadgesSection
 * 
 * Props:
 *   - badges: array of earned badge objects { id, key, earnedAt, awardedBy? }
 *   - role: 'student' | 'teacher'
 *   - students: (teacher only) array of { uid, displayName, badges: [] }
 *   - onAwardBadge: (teacher only) async (studentUid, badgeKey) => void
 */

const BADGE_CATALOG = [
    {
        key: 'first_quiz',
        label: 'Primer Test',
        description: 'Completaste tu primer test',
        icon: Star,
        color: 'from-amber-400 to-yellow-300',
        glow: 'shadow-amber-400/40',
        textColor: 'text-amber-600 dark:text-amber-400',
        auto: true,
    },
    {
        key: 'perfect_score',
        label: 'Perfecto',
        description: 'Obtuviste 100% en un test',
        icon: Zap,
        color: 'from-emerald-400 to-green-300',
        glow: 'shadow-emerald-400/40',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        auto: true,
    },
    {
        key: 'streak_5',
        label: 'Racha x5',
        description: '5 tests aprobados seguidos',
        icon: Flame,
        color: 'from-orange-500 to-red-400',
        glow: 'shadow-orange-400/40',
        textColor: 'text-orange-600 dark:text-orange-400',
        auto: true,
    },
    {
        key: 'top_student',
        label: 'Mejor Alumno',
        description: 'Reconocimiento del profesor',
        icon: Trophy,
        color: 'from-indigo-500 to-violet-400',
        glow: 'shadow-indigo-400/40',
        textColor: 'text-indigo-600 dark:text-indigo-400',
        auto: false,
    },
    {
        key: 'participacion',
        label: 'Participación',
        description: 'Excelente participación en clase',
        icon: Users,
        color: 'from-sky-400 to-blue-400',
        glow: 'shadow-sky-400/40',
        textColor: 'text-sky-600 dark:text-sky-400',
        auto: false,
    },
    {
        key: 'esfuerzo',
        label: 'Esfuerzo',
        description: 'Destacada dedicación y esfuerzo',
        icon: Target,
        color: 'from-pink-500 to-rose-400',
        glow: 'shadow-pink-400/40',
        textColor: 'text-pink-600 dark:text-pink-400',
        auto: false,
    },
    {
        key: 'lector',
        label: 'Gran Lector',
        description: 'Completó todos los temas de una asignatura',
        icon: BookOpen,
        color: 'from-teal-400 to-cyan-400',
        glow: 'shadow-teal-400/40',
        textColor: 'text-teal-600 dark:text-teal-400',
        auto: true,
    },
];

const BadgeChip = ({ badge, earned, earnedAt, compact = false }) => {
    const Icon = badge.icon;
    return (
        <div
            className={`relative flex flex-col items-center gap-1.5 group transition-all duration-200 ${earned ? 'opacity-100' : 'opacity-35 grayscale'}`}
            title={badge.description}
        >
            <div
                className={`
                    ${compact ? 'w-10 h-10' : 'w-14 h-14'}
                    rounded-2xl bg-gradient-to-br ${badge.color}
                    flex items-center justify-center text-white
                    shadow-lg ${earned ? badge.glow : ''}
                    transition-transform duration-200
                    ${earned ? 'group-hover:scale-110 group-hover:shadow-xl' : ''}
                `}
            >
                {earned ? (
                    <Icon className={compact ? 'w-5 h-5' : 'w-7 h-7'} />
                ) : (
                    <Lock className={compact ? 'w-4 h-4' : 'w-6 h-6'} />
                )}
            </div>
            {!compact && (
                <>
                    <span className={`text-xs font-semibold text-center leading-tight ${earned ? badge.textColor : 'text-gray-400 dark:text-gray-600'}`}>
                        {badge.label}
                    </span>
                    {earned && earnedAt && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4 whitespace-nowrap">
                            {new Date(earnedAt?.toDate ? earnedAt.toDate() : earnedAt).toLocaleDateString()}
                        </span>
                    )}
                </>
            )}
        </div>
    );
};

const BadgesSection = ({ badges = [], role = 'student', students = [], onAwardBadge }) => {
    const [expanded, setExpanded] = useState(false);
    const [awardingStudent, setAwardingStudent] = useState(null);
    const [awardingBadge, setAwardingBadge] = useState(null);
    const [awarding, setAwarding] = useState(false);

    const earnedKeys = new Set(badges.map(b => b.key));
    const earnedCount = earnedKeys.size;

    const handleAward = async (studentUid, badgeKey) => {
        if (!onAwardBadge) return;
        setAwarding(true);
        try {
            await onAwardBadge(studentUid, badgeKey);
        } finally {
            setAwarding(false);
            setAwardingStudent(null);
            setAwardingBadge(null);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors overflow-hidden">
            {/* Header */}
            <button
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                onClick={() => setExpanded(e => !e)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-400/30">
                        <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                            {role === 'teacher' ? 'Gestión de Insignias' : 'Mis Insignias'}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {role === 'student'
                                ? `${earnedCount} de ${BADGE_CATALOG.length} obtenidas`
                                : `${students.length} alumnos`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Preview of earned badges */}
                    {role === 'student' && (
                        <div className="flex -space-x-2">
                            {BADGE_CATALOG.filter(b => earnedKeys.has(b.key)).slice(0, 4).map(b => {
                                const Icon = b.icon;
                                return (
                                    <div key={b.key} className={`w-7 h-7 rounded-lg bg-gradient-to-br ${b.color} flex items-center justify-center text-white border-2 border-white dark:border-gray-800 shadow`}>
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                );
                            })}
                            {earnedCount > 4 && (
                                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 border-2 border-white dark:border-gray-800">
                                    +{earnedCount - 4}
                                </div>
                            )}
                        </div>
                    )}
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
            </button>

            {/* Content */}
            {expanded && (
                <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700 pt-4">
                    {role === 'student' ? (
                        /* Student view: grid of all badges */
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-6 mt-2">
                            {BADGE_CATALOG.map(badge => {
                                const earnedBadge = badges.find(b => b.key === badge.key);
                                return (
                                    <BadgeChip
                                        key={badge.key}
                                        badge={badge}
                                        earned={!!earnedBadge}
                                        earnedAt={earnedBadge?.earnedAt}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        /* Teacher view: list of students + ability to award */
                        <div className="space-y-4 mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Pulsa sobre un alumno para ver y otorgar sus insignias.
                            </p>
                            {students.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">No hay alumnos disponibles.</p>
                            ) : (
                                students.map(student => {
                                    const studentEarned = new Set((student.badges || []).map(b => b.key));
                                    const isOpen = awardingStudent === student.uid;
                                    return (
                                        <div key={student.uid} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                                            <button
                                                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                                                onClick={() => setAwardingStudent(isOpen ? null : student.uid)}
                                            >
                                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{student.displayName}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex -space-x-1.5">
                                                        {BADGE_CATALOG.filter(b => studentEarned.has(b.key)).slice(0, 3).map(b => {
                                                            const Icon = b.icon;
                                                            return (
                                                                <div key={b.key} className={`w-6 h-6 rounded-md bg-gradient-to-br ${b.color} flex items-center justify-center text-white border border-white dark:border-gray-800`}>
                                                                    <Icon className="w-3 h-3" />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <span className="text-xs text-gray-400">{studentEarned.size}/{BADGE_CATALOG.length}</span>
                                                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                                </div>
                                            </button>

                                            {isOpen && (
                                                <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/20">
                                                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
                                                        {BADGE_CATALOG.map(badge => {
                                                            const earned = studentEarned.has(badge.key);
                                                            const Icon = badge.icon;
                                                            return (
                                                                <button
                                                                    key={badge.key}
                                                                    disabled={earned || badge.auto || awarding}
                                                                    onClick={() => handleAward(student.uid, badge.key)}
                                                                    className={`flex flex-col items-center gap-1 group transition-all ${earned ? 'opacity-100' : badge.auto ? 'opacity-30 cursor-default' : 'opacity-50 hover:opacity-100 cursor-pointer'}`}
                                                                    title={badge.auto ? 'Automática' : earned ? 'Ya obtenida' : `Otorgar: ${badge.label}`}
                                                                >
                                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-white shadow-md transition-transform ${!earned && !badge.auto ? 'group-hover:scale-110' : ''}`}>
                                                                        {earned ? <Icon className="w-5 h-5" /> : badge.auto ? <Lock className="w-4 h-4" /> : <Icon className="w-5 h-5" />}
                                                                    </div>
                                                                    <span className="text-[10px] text-center text-gray-500 dark:text-gray-400 font-medium leading-tight">{badge.label}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-3">Las insignias automáticas (🔒) se otorgan por el sistema. Las demás puedes concederlas tú.</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BadgesSection;