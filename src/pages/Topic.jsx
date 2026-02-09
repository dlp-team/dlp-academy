import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Header from '../components/layout/Header';
import { useTopicLogic } from '../hooks/useTopicLogic';

// Firebase imports
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// UI Components
import TopicHeader from '../components/topic/TopicHeader';
import TopicTabs from '../components/topic/TopicTabs';
import TopicContent from '../components/topic/TopicContent';
import TopicModals from '../components/topic/TopicModals';

// CONFIGURACIÓN N8N
const N8N_WEBHOOK_URL = 'TU_URL_DE_N8N_AQUI'; 

const Topic = ({ user }) => {
    // 1. Inicializamos tu lógica base
    const logic = useTopicLogic(user);

    // 2. ESTADO LOCAL: Puntuaciones del usuario
    const [userScores, setUserScores] = useState({});

    // 3. EFECTO: Escuchar puntuaciones en tiempo real
    useEffect(() => {
        if (!user || !logic.subjectId || !logic.topicId) return;

        const resultsRef = collection(db, "subjects", logic.subjectId, "topics", logic.topicId, "quiz_results");
        const q = query(resultsRef, where("userId", "==", user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const scoresMap = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                scoresMap[data.quizId] = data.score;
            });
            setUserScores(scoresMap);
        });

        return () => unsubscribe();
    }, [user, logic.subjectId, logic.topicId]);

    // 4. FUNCIÓN GENERAR (N8N)
    const handleGenerateQuizSubmit = async (e) => {
        e.preventDefault();
        
        logic.setShowQuizModal(false);

        // UI Optimista
        const tempId = `gen-${Date.now()}`;
        const tempQuiz = { 
            id: tempId, 
            name: logic.quizFormData.title, 
            type: 'generating', 
            createdAt: new Date().toISOString() 
        };

        const topicRef = doc(db, "subjects", logic.subjectId, "topics", logic.topicId);
        
        try {
            const docSnap = await getDoc(topicRef);
            if (docSnap.exists()) {
                const currentQuizzes = docSnap.data().quizzes || [];
                await updateDoc(topicRef, { quizzes: [...currentQuizzes, tempQuiz] });
            }
        } catch (error) { console.error("Error UI:", error); return; }

        try {
            logic.setIsGeneratingQuiz(true);
            
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...logic.quizFormData, 
                    subjectId: logic.subjectId, 
                    topicId: logic.topicId, 
                    tempId: tempId 
                })
            });

            if (!response.ok) throw new Error('Error en N8N');
            
            const result = await response.json();
            const finalId = result.quizId || tempId;

            const realQuiz = {
                id: finalId,
                name: logic.quizFormData.title,
                type: logic.quizFormData.level === 'Avanzado' ? 'advanced' : 'basic'
            };

            const freshDoc = await getDoc(topicRef);
            if (freshDoc.exists()) {
                const freshQuizzes = freshDoc.data().quizzes || [];
                const updatedQuizzes = freshQuizzes.map(q => q.id === tempId ? realQuiz : q);
                await updateDoc(topicRef, { quizzes: updatedQuizzes });
            }

        } catch (error) {
            console.error("Fallo N8N:", error);
            const failDoc = await getDoc(topicRef);
            if (failDoc.exists()) {
                const rolledBack = (failDoc.data().quizzes || []).filter(q => q.id !== tempId);
                await updateDoc(topicRef, { quizzes: rolledBack });
            }
            logic.setToast({ show: true, message: "Error al generar", type: "error" });
        } finally {
            logic.setIsGeneratingQuiz(false);
        }
    };

    // 5. MERGE DE DATOS IMPORTANTE
    // Si enrichedTopic no está listo (porque logic.topic aún es null), usamos null
    // Si está listo, le inyectamos las scores.
    const enrichedTopic = logic.topic ? {
        ...logic.topic,
        quizzes: logic.topic.quizzes?.map(q => ({
            ...q,
            score: userScores[q.id] // Inyección de nota
        }))
    } : null;

    // Loading State
    if (!user || logic.loading || !logic.topic || !logic.subject) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <TopicHeader 
                    {...logic}
                    // 👇 AQUÍ ESTABA EL FALLO: Usamos enrichedTopic en lugar de logic.topic
                    topic={enrichedTopic} 
                    handleGenerateQuizSubmit={handleGenerateQuizSubmit}
                />

                <TopicTabs 
                    {...logic}
                    // 👇 AQUÍ TAMBIÉN: Para que los contadores (badges) sean correctos si los hubiera
                    topic={enrichedTopic} 
                />

                <TopicContent 
                    {...logic}
                    topic={enrichedTopic} 
                />
            </main>

            <TopicModals 
                {...logic}
                topic={enrichedTopic} // También aquí por si acaso
                handleGenerateQuizSubmit={handleGenerateQuizSubmit}
            />
        </div>
    );
};

export default Topic;