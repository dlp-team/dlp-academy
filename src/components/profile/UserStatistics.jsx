// src/components/profile/UserStatistics.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config'; 
import { collection, getDocs } from 'firebase/firestore';
import { 
    BarChart3, 
    CheckCircle2, 
    Trophy, 
    ArrowUpRight, 
    Clock, 
    Calendar,
    Filter,
    Loader2
} from 'lucide-react';

const UserStatistics = ({ subjects, userId }) => {
    const [stats, setStats] = useState({
        totalQuizzes: 0,
        averageScore: 0,
        passRate: 0,
        totalQuestions: 0,
        recentActivity: [],
        subjectPerformance: []
    });
    const [rawResults, setRawResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterSubject, setFilterSubject] = useState('all');

    // Tooltip State
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null });

    useEffect(() => {
        const fetchDeepStats = async () => {
            if (!subjects || subjects.length === 0 || !userId) {
                setLoading(false);
                return;
            }

            try {
                let allResults = [];
                let subjectStatsMap = {};

                subjects.forEach(sub => {
                    subjectStatsMap[sub.id] = {
                        id: sub.id,
                        name: sub.name,
                        color: sub.color,
                        totalScore: 0,
                        quizCount: 0,
                        passedCount: 0
                    };
                });

                for (const subject of subjects) {
                    const topicsRef = collection(db, 'subjects', subject.id, 'topics');
                    const topicsSnapshot = await getDocs(topicsRef);

                    for (const topicDoc of topicsSnapshot.docs) {
                        const resultsRef = collection(db, 'subjects', subject.id, 'topics', topicDoc.id, 'quiz_results');
                        const resultsSnapshot = await getDocs(resultsRef);

                        resultsSnapshot.forEach(doc => {
                            const data = doc.data();
                            if (data.userId === userId) {
                                const resultEntry = {
                                    id: doc.id,
                                    ...data,
                                    subjectId: subject.id,
                                    subjectName: subject.name,
                                    subjectColor: subject.color,
                                    date: data.completedAt?.toDate ? data.completedAt.toDate() : new Date(data.completedAt)
                                };

                                allResults.push(resultEntry);

                                if (subjectStatsMap[subject.id]) {
                                    subjectStatsMap[subject.id].totalScore += (data.score || 0);
                                    subjectStatsMap[subject.id].quizCount += 1;
                                    if (data.passed) subjectStatsMap[subject.id].passedCount += 1;
                                }
                            }
                        });
                    }
                }

                const totalQuizzes = allResults.length;
                const totalScore = allResults.reduce((acc, curr) => acc + (curr.score || 0), 0);
                const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
                const passedCount = allResults.filter(r => r.passed).length;
                const passRate = totalQuizzes > 0 ? Math.round((passedCount / totalQuizzes) * 100) : 0;
                const totalQuestions = allResults.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);

                const subjectPerformance = Object.values(subjectStatsMap)
                    .filter(s => s.quizCount > 0)
                    .map(s => ({
                        ...s,
                        average: Math.round(s.totalScore / s.quizCount),
                        passRate: Math.round((s.passedCount / s.quizCount) * 100)
                    }))
                    .sort((a, b) => b.average - a.average);

                const recentActivity = [...allResults]
                    .sort((a, b) => b.date - a.date)
                    .slice(0, 5);

                setRawResults(allResults);
                setStats({
                    totalQuizzes,
                    averageScore,
                    passRate,
                    totalQuestions,
                    recentActivity,
                    subjectPerformance
                });

            } catch (error) {
                console.error("Error fetching detailed stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeepStats();
    }, [subjects, userId]);

    // --- Chart Data Preparation ---
    const getChartData = () => {
        let data = rawResults;
        if (filterSubject !== 'all') {
            data = rawResults.filter(r => r.subjectId === filterSubject);
        }
        // Sort by date ascending
        return data.sort((a, b) => a.date - b.date);
    };

    const chartData = getChartData();

    // --- COLOR LOGIC (REFINED) ---
    const getBarGradient = (score) => {
        // 100% - Pure Strong Green + Gold Border
        if (score === 100) {
            return 'bg-gradient-to-t from-green-600 to-emerald-500 border-yellow-400 shadow-[0_0_15px_rgba(34,197,94,0.6)]';
        }
        
        // 70% to <100% - Strong, Intense, Saturated Green
        if (score >= 70) {
            return 'bg-gradient-to-t from-emerald-500 to-green-500 border-green-400/50';
        }

        // 60% to <70% - Yellow/Orange -> Normal Green (Obscure)
        if (score >= 60) {
            // Transition from amber to a darker/standard green
            return 'bg-gradient-to-t from-amber-500 to-emerald-700 border-emerald-600/30';
        }

        // 50% to <60% - Yellow/Orange
        if (score >= 50) {
            return 'bg-gradient-to-t from-orange-500 to-amber-500 border-amber-400/30';
        }

        // 45% to <50% - Red -> Orange
        if (score >= 45) {
            return 'bg-gradient-to-t from-red-600 to-orange-600 border-orange-500/30';
        }

        // 0% to <45% - Dark Red -> Red
        return 'bg-gradient-to-t from-red-950 to-red-700 border-red-600/30';
    };

    // Tooltip Handlers
    const handleMouseEnter = (e, data) => {
        setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            data: data
        });
    };

    const handleMouseMove = (e) => {
        if (tooltip.visible) {
            setTooltip(prev => ({
                ...prev,
                x: e.clientX,
                y: e.clientY
            }));
        }
    };

    const handleMouseLeave = () => {
        setTooltip(prev => ({ ...prev, visible: false }));
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
    if (stats.totalQuizzes === 0) return null;

    return (
        <div className="mt-8 space-y-8 animate-fade-in pb-12">
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-500" />
                Estadísticas Detalladas
            </h2>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Tests Completados" 
                    value={stats.totalQuizzes} 
                    icon={<CheckCircle2 className="w-5 h-5 text-blue-500" />}
                    subtext={`${stats.totalQuestions} preguntas respondidas`}
                />
                <StatCard 
                    title="Promedio General" 
                    value={`${stats.averageScore}%`} 
                    icon={<Trophy className="w-5 h-5 text-yellow-500" />}
                    subtext="Puntuación media"
                />
                <StatCard 
                    title="Tasa de Aprobado" 
                    value={`${stats.passRate}%`} 
                    icon={<ArrowUpRight className="w-5 h-5 text-emerald-500" />}
                    subtext="Tests aprobados"
                />
                <StatCard 
                    title="Tiempo Dedicado" 
                    value="--" 
                    icon={<Clock className="w-5 h-5 text-purple-500" />}
                    subtext="Calculando..."
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Subject Performance */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Rendimiento por Asignatura
                    </h3>
                    <div className="space-y-6">
                        {stats.subjectPerformance.map((sub, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{sub.name}</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100">{sub.average}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            sub.average >= 70 ? 'bg-emerald-500' : 
                                            sub.average >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                                        }`}
                                        style={{ width: `${sub.average}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-500" />
                        Actividad Reciente
                    </h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                        {stats.recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group">
                                <div className={`mt-1 min-w-[10px] h-2.5 w-2.5 rounded-full ${activity.passed ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate pr-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {activity.quizTitle}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {activity.subjectName}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {activity.date.toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`text-sm font-bold ${activity.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {activity.score}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* CUSTOM CURSOR TOOLTIP */}
            {tooltip.visible && tooltip.data && (
                <div 
                    className="fixed z-50 pointer-events-none transform -translate-y-1/2 ml-4 px-3 py-2 bg-slate-900/90 dark:bg-slate-100/90 backdrop-blur-md rounded-lg shadow-xl border border-slate-700 dark:border-slate-300"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${
                             tooltip.data.score >= 70 ? 'text-emerald-400 dark:text-emerald-600' : 
                             tooltip.data.score >= 50 ? 'text-amber-400 dark:text-amber-600' : 'text-red-400 dark:text-red-600'
                        }`}>
                            {tooltip.data.score}%
                        </span>
                        <div className="h-4 w-px bg-white/20 dark:bg-black/20"></div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-white dark:text-slate-900 max-w-[150px] truncate">
                                {tooltip.data.quizTitle}
                            </span>
                            <span className="text-[10px] text-slate-300 dark:text-slate-500">
                                {tooltip.data.date.toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CHART SECTION --- */}
            <div className="pt-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-2">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Evolución</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Histórico de puntuaciones</p>
                    </div>
                    
                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => setFilterSubject('all')}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                filterSubject === 'all' 
                                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' 
                                : 'bg-transparent border border-gray-300 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                            }`}
                        >
                            Todos
                        </button>
                        {subjects.map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => setFilterSubject(sub.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                                    filterSubject === sub.id
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-transparent border border-gray-300 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${sub.color}`}></span>
                                {sub.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CHART CONTAINER - NO SCROLL */}
                <div className="flex h-64 w-full pr-2">
                    {/* Y-AXIS (Fixed) */}
                    <div className="flex-shrink-0 w-12 flex flex-col justify-between items-end pr-3 pb-6 text-xs font-medium text-gray-400 dark:text-gray-500 border-r border-gray-300 dark:border-gray-700 relative">
                        <div className="relative w-full flex justify-end"><span className="-translate-y-1/2">100</span><div className="absolute -right-3 top-0 w-2 h-px bg-gray-300 dark:bg-gray-700"></div></div>
                        <div className="relative w-full flex justify-end"><span className="-translate-y-1/2">75</span><div className="absolute -right-3 top-0 w-2 h-px bg-gray-300 dark:bg-gray-700"></div></div>
                        <div className="relative w-full flex justify-end"><span className="-translate-y-1/2">50</span><div className="absolute -right-3 top-0 w-2 h-px bg-gray-300 dark:bg-gray-700"></div></div>
                        <div className="relative w-full flex justify-end"><span className="-translate-y-1/2">25</span><div className="absolute -right-3 top-0 w-2 h-px bg-gray-300 dark:bg-gray-700"></div></div>
                        <div className="relative w-full flex justify-end"><span className="-translate-y-1/2">0</span></div>
                    </div>

                    {/* PLOT AREA - Flex container */}
                    <div className="flex-grow flex items-end border-b border-gray-300 dark:border-gray-700 pb-[1px] relative">
                        {chartData.length > 0 ? (
                            <div className="w-full h-full flex items-end justify-between gap-1">
                                {chartData.map((data, index) => (
                                    <div 
                                        key={index} 
                                        className="group relative h-full flex items-end flex-col justify-end flex-1"
                                        onMouseEnter={(e) => handleMouseEnter(e, data)}
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        
                                        {/* THE BAR */}
                                        <div 
                                            className={`w-full min-w-[2px] max-w-[20px] mx-auto rounded-t-sm transition-all duration-300 opacity-80 group-hover:opacity-100 border-t border-l border-r border-transparent ${getBarGradient(data.score)}`}
                                            style={{ 
                                                height: `${data.score}%`,
                                                // Enhance max score shadow
                                                boxShadow: data.score === 100 ? '0 0 10px rgba(34,197,94, 0.4)' : 'none'
                                            }}
                                        ></div>

                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 opacity-50">
                                <Filter className="w-8 h-8 mb-2" />
                                <p className="text-sm">Sin datos</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </div>
    );
};

// Helper Sub-component for KPI Cards
const StatCard = ({ title, value, icon, subtext }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors hover:shadow-md">
        <div className="flex justify-between items-start mb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</span>
            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {icon}
            </div>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</div>
        <div className="text-xs text-gray-400 dark:text-gray-500">{subtext}</div>
    </div>
);

export default UserStatistics;