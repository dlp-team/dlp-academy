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

    // --- Chart Logic ---
    const getChartData = () => {
        let data = rawResults;
        if (filterSubject !== 'all') {
            data = rawResults.filter(r => r.subjectId === filterSubject);
        }
        return data.sort((a, b) => a.date - b.date);
    };

    const chartData = getChartData();

    // Enhanced Bar Styles: Gradient & Opacity
    const getBarStyle = (score) => {
        if (score === 100) return 'from-indigo-500/60 to-purple-600/60 hover:from-indigo-500 hover:to-purple-600 border-indigo-400/30'; 
        if (score >= 70) return 'from-emerald-400/60 to-teal-500/60 hover:from-emerald-400 hover:to-teal-500 border-emerald-400/30';
        if (score >= 50) return 'from-amber-300/60 to-orange-400/60 hover:from-amber-300 hover:to-orange-400 border-amber-400/30';
        return 'from-rose-400/60 to-red-500/60 hover:from-rose-400 hover:to-red-500 border-rose-400/30';
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

            {/* --- MINIMALIST CHART SECTION --- */}
            {/* Removed the background card container for a cleaner look */}
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

                {/* CHART CONTAINER */}
                <div className="flex h-64 w-full">
                    {/* Y-AXIS (Fixed) */}
                    <div className="flex-shrink-0 w-12 flex flex-col justify-between items-end pr-3 pb-6 text-xs font-medium text-gray-400 dark:text-gray-500 border-r border-gray-300 dark:border-gray-700 relative">
                        {/* Ticks */}
                        <div className="relative w-full flex justify-end">
                            <span className="relative top-[-6px]">100</span>
                            <div className="absolute right-[-12px] top-0 w-3 h-px bg-gray-300 dark:bg-gray-700"></div>
                        </div>
                        <div className="relative w-full flex justify-end">
                            <span className="relative top-[-6px]">75</span>
                            <div className="absolute right-[-12px] top-0 w-2 h-px bg-gray-300 dark:bg-gray-700"></div>
                        </div>
                        <div className="relative w-full flex justify-end">
                            <span className="relative top-[-6px]">50</span>
                            <div className="absolute right-[-12px] top-0 w-2 h-px bg-gray-300 dark:bg-gray-700"></div>
                        </div>
                        <div className="relative w-full flex justify-end">
                            <span className="relative top-[-6px]">25</span>
                            <div className="absolute right-[-12px] top-0 w-2 h-px bg-gray-300 dark:bg-gray-700"></div>
                        </div>
                         <div className="relative w-full flex justify-end">
                            <span className="relative top-[-6px]">0</span>
                            {/* Base line connects here naturally */}
                        </div>
                    </div>

                    {/* SCROLLABLE PLOT AREA */}
                    <div className="flex-grow overflow-x-auto pb-0 border-b border-gray-300 dark:border-gray-700 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                        {chartData.length > 0 ? (
                            <div className="h-full flex items-end px-4 gap-6 min-w-max pb-[1px]">
                                {chartData.map((data, index) => (
                                    <div key={index} className="group relative h-full flex items-end flex-col justify-end">
                                        
                                        {/* Floating Label on Hover (Punctuation) */}
                                        <div 
                                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-sm z-20 pointer-events-none"
                                            style={{ bottom: `${data.score + 5}%` }}
                                        >
                                            <span className={`px-2 py-1 rounded-md bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-gray-700 ${
                                                data.score >= 70 ? 'text-emerald-500' : 
                                                data.score >= 50 ? 'text-amber-500' : 'text-rose-500'
                                            }`}>
                                                {data.score}
                                            </span>
                                        </div>

                                        {/* THE BAR */}
                                        <div 
                                            className={`w-3 sm:w-4 rounded-t-md bg-gradient-to-t transition-all duration-500 border-t border-l border-r border-transparent ${getBarStyle(data.score)}`}
                                            style={{ 
                                                height: `${data.score}%`,
                                                boxShadow: data.score === 100 ? '0 0 15px rgba(99,102,241, 0.4)' : 'none'
                                            }}
                                        ></div>

                                        {/* Date Label (X-Axis Item) */}
                                        <div className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 font-medium rotate-0 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity absolute top-full left-1/2 -translate-x-1/2">
                                            {data.date.getDate()}/{data.date.getMonth()+1}
                                        </div>

                                        {/* Tooltip for Details */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 invisible group-hover:visible">
                                            <div className="bg-slate-900/90 dark:bg-white/90 backdrop-blur-sm text-white dark:text-slate-900 text-xs rounded-lg p-3 shadow-xl transform translate-y-1 group-hover:translate-y-0 transition-transform">
                                                <div className="font-bold mb-1 line-clamp-2">{data.quizTitle}</div>
                                                <div className="text-slate-300 dark:text-slate-500 mb-1">{data.subjectName}</div>
                                                <div className="pt-1 border-t border-white/10 dark:border-black/10 flex justify-between">
                                                    <span>{data.date.toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 opacity-50">
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