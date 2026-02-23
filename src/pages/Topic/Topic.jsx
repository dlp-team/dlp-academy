// src/pages/Topic/Topic.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
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

    // 2. ESTADOS LOCALES
    const [userScores, setUserScores] = useState({});
    const [scoresLoading, setScoresLoading] = useState(true);
    
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
            })) || []
        };
    }, [logic.topic, userScores]);

    // 5. PROGRESO
    const globalProgress = useMemo(() => {
        if (!enrichedTopic?.quizzes?.length) return { completed: 0, total: 0, percentage: 0 };
        const total = enrichedTopic.quizzes.length;
        const completed = enrichedTopic.quizzes.filter(q => q.score != null).length;
        return { completed, total, percentage: (completed / total) * 100 };
    }, [enrichedTopic]);

    if (!user || logic.loading || !logic.topic || !logic.subject) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-indigo-600"/></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
            <Header user={user} />
            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <TopicHeader 
                    {...logic}
                    topic={enrichedTopic} 
                    subject={logic.subject}
                    globalProgress={globalProgress}
                    handleGenerateQuizSubmit={logic.handleGenerateQuizSubmit}
                    permissions={logic.permissions}
                />
                <TopicTabs 
                    {...logic}
                    topic={enrichedTopic} 
                />
                <TopicContent 
                    {...logic}
                    topic={enrichedTopic}
                    subject={logic.subject}
                    handleManualUpload={logic.handleManualUpload}
                    uploading={logic.uploading}
                    permissions={logic.permissions}
                />
            </main>
            <TopicModals 
                {...logic}
                topic={enrichedTopic}
                subject={logic.subject}
                handleGenerateQuizSubmit={logic.handleGenerateQuizSubmit}
                viewingFile={null} 
            />
        </div>
    );
};

export default Topic;