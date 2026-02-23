// src/pages/Profile/hooks/useUserStatistics.js
import { useState, useEffect } from 'react';
import { db } from '../../../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

const useUserStatistics = (subjects, userId) => {
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
                    const topicsRef = query(collection(db, 'topics'), where('subject_id', '==', subject.id));
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

    // Chart Data Preparation
    const getChartData = (filterSubject) => {
        let data = rawResults;
        if (filterSubject !== 'all') {
            data = rawResults.filter(r => r.subjectId === filterSubject);
        }
        return data.sort((a, b) => a.date - b.date);
    };

    // Bar color logic
    const getBarGradient = (score) => {
        if (score === 100) {
            return 'bg-gradient-to-t from-green-600 to-emerald-500 border-yellow-400 shadow-[0_0_15px_rgba(34,197,94,0.6)]';
        }
        if (score >= 70) {
            return 'bg-gradient-to-t from-emerald-500 to-green-500 border-green-400/50';
        }
        if (score >= 60) {
            return 'bg-gradient-to-t from-amber-500 to-emerald-700 border-emerald-600/30';
        }
        if (score >= 50) {
            return 'bg-gradient-to-t from-orange-500 to-amber-500 border-amber-400/30';
        }
        if (score >= 45) {
            return 'bg-gradient-to-t from-red-600 to-orange-600 border-orange-500/30';
        }
        return 'bg-gradient-to-t from-red-950 to-red-700 border-red-600/30';
    };

    return {
        stats,
        loading,
        getChartData,
        getBarGradient
    };
};

export default useUserStatistics;
