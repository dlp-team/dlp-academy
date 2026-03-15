// src/pages/Quizzes/QuizReviewPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Loader2, Target, Trophy } from 'lucide-react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import QuizReviewDetail from '../../components/modules/QuizEngine/QuizReviewDetail';
import { extractColorFromGradient } from '../../components/modules/QuizEngine/QuizCommon';
import { canUserAccessSubject } from '../../utils/subjectAccessUtils';

const QuizReviewPage = ({ user }) => {
    const { subjectId, topicId, quizId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [topicGradient, setTopicGradient] = useState('from-indigo-500 to-purple-600');
    const [accentColor, setAccentColor] = useState('#4f46e5');
    const [quizTitle, setQuizTitle] = useState('Test');
    const [latestAttempt, setLatestAttempt] = useState(null);

    useEffect(() => {
        const load = async () => {
            if (!user?.uid || !subjectId || !topicId || !quizId) {
                setLoading(false);
                return;
            }

            try {
                const subjectSnap = await getDoc(doc(db, 'subjects', subjectId));
                if (!subjectSnap.exists()) {
                    navigate('/home');
                    return;
                }

                const subjectData = subjectSnap.data();
                const hasAccess = await canUserAccessSubject({ subject: { id: subjectSnap.id, ...subjectData }, user });
                if (!hasAccess) {
                    navigate('/home');
                    return;
                }

                const topicSnap = await getDoc(doc(db, 'topics', topicId));
                if (topicSnap.exists()) {
                    const topicData = topicSnap.data();
                    if (topicData.color) {
                        setTopicGradient(topicData.color);
                        const extractedColor = extractColorFromGradient(topicData.color);
                        if (extractedColor) setAccentColor(extractedColor);
                    }
                }

                const quizSnap = await getDoc(doc(db, 'quizzes', quizId));
                if (quizSnap.exists()) {
                    const data = quizSnap.data();
                    setQuizTitle(data.name || data.title || 'Test');
                }

                const attemptsQ = query(
                    collection(db, 'quizAttempts'),
                    where('userId', '==', user.uid),
                    where('quizId', '==', quizId),
                    where('topicId', '==', topicId)
                );
                const attemptsSnap = await getDocs(attemptsQ);
                const latest = attemptsSnap.docs
                    .map((attemptDoc) => ({ id: attemptDoc.id, ...attemptDoc.data() }))
                    .sort((a, b) => {
                        const aMs = a?.completedAt?.toMillis ? a.completedAt.toMillis() : 0;
                        const bMs = b?.completedAt?.toMillis ? b.completedAt.toMillis() : 0;
                        return bMs - aMs;
                    })[0] || null;

                setLatestAttempt(latest);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user?.uid, subjectId, topicId, quizId, navigate, user]);

    const scoreLabel = useMemo(() => {
        if (!latestAttempt) return 'Sin intentos';
        return `${latestAttempt.score || 0}%`;
    }, [latestAttempt]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
            <main className="max-w-4xl mx-auto px-4 py-8">
                <button
                    onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}`)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Volver al tema
                </button>

                <div className="mt-6 rounded-3xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">Revision del test</p>
                            <h1 className="text-3xl font-black mt-1">{quizTitle}</h1>
                        </div>
                        {latestAttempt && (
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Ultimo resultado</p>
                                <p className="text-3xl font-black text-slate-900">{scoreLabel}</p>
                            </div>
                        )}
                    </div>

                    {latestAttempt ? (
                        <>
                            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <Trophy className="w-4 h-4" />
                                        Aciertos
                                    </div>
                                    <p className="text-2xl font-black mt-1">{latestAttempt.correctAnswers || 0}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <Target className="w-4 h-4" />
                                        Total preguntas
                                    </div>
                                    <p className="text-2xl font-black mt-1">{latestAttempt.totalQuestions || 0}</p>
                                </div>
                            </div>
                            <QuizReviewDetail answersDetail={latestAttempt.answersDetail || []} topicGradient={topicGradient} />
                        </>
                    ) : (
                        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm font-semibold text-slate-500">
                            Aun no has completado este test. Hazlo una vez para ver la revision detallada.
                        </div>
                    )}
                </div>
            </main>

            <div className={`fixed inset-x-0 bottom-0 h-1 bg-gradient-to-r ${topicGradient}`} style={{ boxShadow: `0 0 20px ${accentColor}` }} />
        </div>
    );
};

export default QuizReviewPage;
