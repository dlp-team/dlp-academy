// src/pages/Topic/Topic.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useTopicLogic } from './hooks/useTopicLogic';

// Firebase imports
import { 
    collection, query, where, onSnapshot, doc, getDoc, 
    updateDoc, orderBy, addDoc, serverTimestamp 
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
    
    // ✅ SEPARAMOS LOS ESTADOS
    const [manualMaterials, setManualMaterials] = useState([]); // Para "Mis Archivos"
    const [aiMaterials, setAiMaterials] = useState([]);         // Para "Generados por IA"
    const [materialsLoading, setMaterialsLoading] = useState(true);
    const [isUploadingLocal, setIsUploadingLocal] = useState(false);

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

    // 4. EFECTO PRINCIPAL: Cargar LISTAS DE ARCHIVOS
    useEffect(() => {
        if (!logic.subjectId || !logic.topicId) return;

        setMaterialsLoading(true);

        // A) Escuchar carpeta 'materials' (Tus PDFs subidos) -> Va a manualMaterials
        const manualRef = collection(db, "subjects", logic.subjectId, "topics", logic.topicId, "materials");
        const qManual = query(manualRef, orderBy("createdAt", "desc")); 

        const unsubManual = onSnapshot(qManual, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                origin: 'upload', // Etiqueta
                type: 'pdf'
            }));
            setManualMaterials(docs);
        }, (err) => console.log("Error loading uploads:", err));

        // B) Escuchar carpeta 'resumen' (Generados por IA) -> Va a aiMaterials
        const aiRef = collection(db, "subjects", logic.subjectId, "topics", logic.topicId, "resumen");
        
        const unsubAi = onSnapshot(aiRef, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                origin: 'AI',        // Etiqueta clave
                type: 'summary',     // Icono
                // Aseguramos que tenga un nombre visible
                name: doc.data().title || doc.data().name || doc.data().topic || 'Resumen Generado',
                date: doc.data().createdAt?.toDate() || new Date()
            }));
            console.log("Resúmenes IA encontrados:", docs); 
            setAiMaterials(docs);
            setMaterialsLoading(false);
        }, (error) => {
            console.error("Error cargando resumenes:", error);
            setMaterialsLoading(false);
        });

        // Limpieza
        return () => {
            unsubManual();
            unsubAi();
        };
    }, [logic.subjectId, logic.topicId]);

    // 5. FUNCIÓN DE SUBIDA MANUAL
    const handleLocalUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 1048576) { 
            logic.setToast({ show: true, message: "Archivo muy grande (>1MB).", type: "error" });
            return;
        }

        setIsUploadingLocal(true);

        try {
            const toBase64 = file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });

            const base64String = await toBase64(file);
            const materialsRef = collection(db, "subjects", logic.subjectId, "topics", logic.topicId, "materials");
            
            await addDoc(materialsRef, {
                name: file.name,
                url: base64String,
                type: 'pdf',
                origin: 'upload',
                createdAt: serverTimestamp()
            });

            logic.setToast({ show: true, message: "Archivo subido", type: "success" });
        } catch (error) {
            console.error("Error subiendo:", error);
            logic.setToast({ show: true, message: "Error al subir", type: "error" });
        } finally {
            setIsUploadingLocal(false);
            e.target.value = null; 
        }
    };

    // 6. GENERAR QUIZ (Lógica N8N)
    const handleGenerateQuizSubmit = async (e) => {
        e.preventDefault();
        logic.setShowQuizModal(false);

        const tempId = `gen-${Date.now()}`;
        const tempQuiz = { id: tempId, name: logic.quizFormData.title, type: 'generating', createdAt: new Date().toISOString() };

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
                body: JSON.stringify({ ...logic.quizFormData, subjectId: logic.subjectId, topicId: logic.topicId, tempId: tempId })
            });

            if (!response.ok) throw new Error('Error en N8N');
            // La actualización real del quiz se espera por parte de N8N o recarga manual
        } catch (error) {
            console.error("Fallo N8N:", error);
            logic.setToast({ show: true, message: "Error al generar", type: "error" });
        } finally {
            logic.setIsGeneratingQuiz(false);
        }
    };

    // 7. MERGE DE DATOS (AQUÍ ESTÁ LA CLAVE DEL ARREGLO)
    const enrichedTopic = useMemo(() => {
        if (!logic.topic) return null;

        return {
            ...logic.topic,
            // 🔹 ASIGNAMOS CADA LISTA A SU CAMPO CORRECTO
            pdfs: aiMaterials,       // "Generados por IA" lee topic.pdfs
            uploads: manualMaterials, // "Mis Archivos" lee topic.uploads
            
            quizzes: logic.topic.quizzes?.map(q => ({
                ...q,
                score: userScores[q.id] ?? null
            })) || []
        };
    }, [logic.topic, aiMaterials, manualMaterials, userScores]);

    // 8. PROGRESO
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
                    handleGenerateQuizSubmit={handleGenerateQuizSubmit}
                />
                <TopicTabs 
                    {...logic}
                    topic={enrichedTopic} 
                />
                <TopicContent 
                    {...logic}
                    topic={enrichedTopic}
                    subject={logic.subject}
                    handleManualUpload={handleLocalUpload}
                    uploading={isUploadingLocal}
                />
            </main>
            <TopicModals 
                {...logic}
                topic={enrichedTopic}
                subject={logic.subject}
                handleGenerateQuizSubmit={handleGenerateQuizSubmit}
                viewingFile={null} 
            />
        </div>
    );
};

export default Topic;