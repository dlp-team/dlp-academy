// src/pages/Topic/Topic.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { Eye, GraduationCap, Loader2 } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useTopicLogic } from './hooks/useTopicLogic';

// Firebase imports
import {
    collection, query, where, onSnapshot
} from 'firebase/firestore';
import { db } from '../../firebase/config';

// UI Components
import TopicHeader from './components/TopicHeader';
import TopicTabs from './components/TopicTabs';
import TopicContent from './components/TopicContent';
import TopicModals from './components/TopicModals';

// CONFIGURACIÓN N8N
const N8N_WEBHOOK_URL = 'TU_URL_DE_N8N_AQUI'; 

const Topic = ({ user }) => {
    // 1. Lógica base
    const logic = useTopicLogic(user);
    const { isDark, toggleDarkMode } = useDarkMode();

    // 2. ESTADOS LOCALES
    const [userScores, setUserScores] = useState({});
    const [scoresLoading, setScoresLoading] = useState(true);
    const [previewAsStudent, setPreviewAsStudent] = useState(false);
    const canUsePreview = user?.role !== 'student';

    useEffect(() => {
        if (!canUsePreview) {
            sessionStorage.removeItem('dlpPreviewAsStudent');
            return;
        }

        if (previewAsStudent) {
            sessionStorage.setItem('dlpPreviewAsStudent', '1');
            return;
        }

        sessionStorage.removeItem('dlpPreviewAsStudent');
    }, [previewAsStudent, canUsePreview]);
    // 3. EFECTO: Escuchar puntuaciones (Quizzes)
    useEffect(() => {
        if (!user || !logic.subjectId || !logic.topicId) {
            setScoresLoading(false);
            return;
        }
        setScoresLoading(true);

        const resultsRef = collection(db, "subjects", logic.subjectId, "topics", logic.topicId, "quiz_results");
        const q = query(resultsRef, where("userId", "==", user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const scoresMap = {};
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                if (data.quizId && data.score !== undefined) {
                    scoresMap[data.quizId] = data.score;
                }
            });
            setUserScores(scoresMap);
            setScoresLoading(false);
        });

        return () => unsubscribe();
    }, [user, logic.subjectId, logic.topicId]);

    // 4. MERGE DE DATOS
    const enrichedTopic = useMemo(() => {
        if (!logic.topic) return null;

        return {
            ...logic.topic,
            pdfs: logic.topic.pdfs || [],
            uploads: logic.topic.uploads || [],
            quizzes: logic.topic.quizzes?.map(q => ({
                ...q,
                score: userScores[q.id] ?? null
            })) || [],
            exams: logic.topic.exams || []
        };
    }, [logic.topic, userScores]);

    // 5. PROGRESO
    const globalProgress = useMemo(() => {
        if (!enrichedTopic?.quizzes?.length) return { completed: 0, total: 0, percentage: 0 };
        const total = enrichedTopic.quizzes.length;
        const completed = enrichedTopic.quizzes.filter(q => q.score != null).length;
        return { completed, total, percentage: (completed / total) * 100 };
    }, [enrichedTopic]);

    const effectivePermissions = useMemo(() => {
        if (!previewAsStudent) return logic.permissions;
        return {
            ...logic.permissions,
            canEdit: false,
            canDelete: false,
            showEditUI: false,
            showDeleteUI: false,
            isViewer: true
        };
    }, [logic.permissions, previewAsStudent]);

    if (!user || logic.loading || !logic.topic || !logic.subject) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" strokeWidth={2} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
            <Header user={user} />
            <main className="pt-20 pb-16 px-6 max-w-7xl mx-auto">
                {canUsePreview && (
                    <div className="mb-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {previewAsStudent ? (
                                <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            ) : (
                                <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            )}
                            <span>{previewAsStudent ? 'Modo Alumno activo (solo lectura temporal)' : 'Modo Profesor activo'}</span>
                        </div>
                        <button
                            onClick={() => setPreviewAsStudent((prev) => !prev)}
                            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${previewAsStudent ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900'}`}
                        >
                            {previewAsStudent ? 'Salir modo alumno' : 'Activar modo alumno'}
                        </button>
                    </div>
                )}

                <TopicHeader 
                    {...logic}
                    topic={enrichedTopic} 
                    subject={logic.subject}
                    globalProgress={globalProgress}
                    handleGenerateQuizSubmit={logic.handleGenerateQuizSubmit}
                    permissions={effectivePermissions}
                />
                <div className="mt-8">
                    <TopicTabs 
                        {...logic}
                        permissions={effectivePermissions}
                        topic={enrichedTopic} 
                    />
                </div>
                <div className="mt-8">
                    <TopicContent 
                        {...logic}
                        topic={enrichedTopic}
                        subject={logic.subject}
                        handleManualUpload={logic.handleManualUpload}
                        uploading={logic.uploading}
                        permissions={effectivePermissions}
                    />
                </div>
            </main>

            {!previewAsStudent && (
                <TopicModals 
                    {...logic}
                    topic={enrichedTopic}
                    subject={logic.subject}
                    handleGenerateQuizSubmit={logic.handleGenerateQuizSubmit}
                    viewingFile={null} 
                />
            )}
        </div>
    );
};

export default Topic;