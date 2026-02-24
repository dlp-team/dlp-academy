// src/hooks/useSubjectManager.js
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    collection, query, doc, getDoc, onSnapshot, 
    updateDoc, deleteDoc, addDoc, serverTimestamp, 
    writeBatch, increment, orderBy, where 
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { canView } from '../../../utils/permissionUtils';

const N8N_WEBHOOK_URL = 'https://podzolic-dorethea-rancorously.ngrok-free.dev/webhook-test/711e538b-9d63-42bb-8494-873301ffdf39';

export const useSubjectManager = (user, subjectId) => {
    const navigate = useNavigate();
    const [subject, setSubject] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fileCache, setFileCache] = useState({});

    // 1. Fetch Data
    useEffect(() => {
        if (!user || !subjectId) return;

        const fetchSubject = async () => {
            try {
                const docSnap = await getDoc(doc(db, "subjects", subjectId));
                if (docSnap.exists()) {
                    const subjectData = { id: docSnap.id, ...docSnap.data() };
                    if (!canView(subjectData, user.uid)) {
                        navigate('/home');
                        setLoading(false);
                        return;
                    }
                    setSubject(subjectData);
                } else {
                    console.error("Subject not found");
                    navigate('/home');
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching subject:", error);
                navigate('/home');
                setLoading(false);
            }
        };

        fetchSubject();

        // Real-time listener for Topics (Ordered by 'order')
        const q = query(
            collection(db, "topics"),
            where("subjectId", "==", subjectId),
            orderBy("order", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const topicsData = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            }));
            setTopics(topicsData);
            setLoading(false);

            // Auto-detect: si n8n ya escribió quizzes/pdfs en el documento, marcar como completed
            topicsData.forEach(topic => {
                if (topic.status === 'generating' && (topic.quizzes?.length > 0 || topic.pdfs?.length > 0)) {
                    updateDoc(doc(db, "topics", topic.id), {
                        status: 'completed'
                    }).catch(err => console.error("Error auto-updating status:", err));
                }
            });
        });

        return () => unsubscribe();
    }, [user, subjectId, navigate]);

    // Auto-detect: escuchar subcolección "resumen" de topics en estado 'generating'
    const generatingIds = useMemo(() =>
        topics.filter(t => t.status === 'generating').map(t => t.id).join(','),
        [topics]
    );

    useEffect(() => {
        if (!subjectId || !generatingIds) return;

        const ids = generatingIds.split(',').filter(Boolean);
        if (ids.length === 0) return;

        const resumenRef = query(
            collection(db, "resumen"),
            where("topicId", "in", ids)
        );

        const unsubscribe = onSnapshot(resumenRef, (snapshot) => {
            const completedTopicIds = new Set(snapshot.docs.map(d => d.data().topicId));
            completedTopicIds.forEach(topicId => {
                updateDoc(doc(db, "topics", topicId), {
                    status: 'completed'
                }).catch(err => console.error("Auto-update resumen error:", err));
            });
        });

        return () => unsubscribe();
    }, [generatingIds, subjectId]);

    // 2. Actions for Subject
    const updateSubject = async (data) => {
        if (!subject) return;
        try {
            await updateDoc(doc(db, "subjects", subject.id), data);
            setSubject(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error("Error updating subject:", error);
        }
    };

    const deleteSubject = async () => {
        if (!subject) return;
        try {
            await deleteDoc(doc(db, "subjects", subject.id));
            navigate('/home');
        } catch (error) {
            console.error("Error deleting subject:", error);
        }
    };

    // 3. Helper: Send to N8N
    const sendToN8N = async (topicId, data, files) => {
        try {
            const formData = new FormData();
            formData.append('topicId', topicId);
            formData.append('name', data.name);
            formData.append('prompt', data.prompt);
            formData.append('subjectId', subjectId);
            formData.append('userId', user.uid);

            files.forEach((file) => {
                formData.append('files', file);
            });

            fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                body: formData
            }).catch(err => console.error("N8N Webhook Error:", err));

        } catch (error) {
            console.error("Error triggering N8N:", error);
        }
    };

    // 4. Create or Retry Topic
    const createTopic = async (data, files) => {
        const filesToSend = files.length > 0 ? files : (fileCache[data.retryId] || []);
        let topicId = data.retryId;

        if (data.isRetry && topicId) {
            const existingTopic = topics.find(t => t.id === topicId);
            if (!existingTopic) return;

            await updateDoc(doc(db, "topics", topicId), {
                name: data.name,
                prompt: data.prompt, 
                status: 'generating'
            });
        } else {
            const nextOrder = topics.length + 1;
            const numberString = nextOrder.toString().padStart(2, '0');

            const newTopic = {
                name: data.name,
                prompt: data.prompt, 
                status: 'generating',
                color: subject.color, 
                createdAt: serverTimestamp(),
                order: nextOrder, 
                number: numberString,
                subjectId: subjectId,
                ownerId: subject?.ownerId || user?.uid,
                institutionId: subject?.institutionId || user?.institutionId || null
            };
            
            const ref = await addDoc(collection(db, "topics"), newTopic);
            topicId = ref.id;
            
            await updateDoc(doc(db, "subjects", subjectId), { topicCount: increment(1) });
            
            if (files.length > 0) {
                const docsRef = collection(db, "documents");
                files.forEach(f => addDoc(docsRef, { 
                    name: f.name, 
                    type: 'pdf', 
                    size: f.size, 
                    uploadedAt: serverTimestamp(),
                    source: 'manual',
                    topicId: topicId,
                    subjectId: subjectId,
                    ownerId: subject?.ownerId || user?.uid,
                    institutionId: subject?.institutionId || user?.institutionId || null
                }));
            }
        }

        setFileCache(prev => ({ ...prev, [topicId]: filesToSend }));
        sendToN8N(topicId, data, filesToSend);
    };

    // 5. Update Topic (NEW)
    const updateTopic = async (topicId, data) => {
        try {
            await updateDoc(doc(db, "topics", topicId), data);
        } catch (error) {
            console.error("Error updating topic:", error);
            throw error;
        }
    };

    // 6. Delete Topic
    const deleteTopic = async (topicId) => {
        // Confirmation is handled in UI now, but safety check remains
        try {
            await deleteDoc(doc(db, "topics", topicId));
            await updateDoc(doc(db, "subjects", subjectId), { topicCount: increment(-1) });
        } catch (error) {
            console.error("Error deleting topic:", error);
        }
    };

    // 7. Retry Helper
    const retryTopic = async (topicId) => {
        const topic = topics.find(t => t.id === topicId);
        if (!topic) return;
        return topic; 
    };

    // 8. Handle Reorder Topics
    const handleReorderTopics = async (draggedId, targetId) => {
        if (draggedId === targetId) return;

        const currentTopics = [...topics];
        const draggedIndex = currentTopics.findIndex(t => t.id === draggedId);
        const targetIndex = currentTopics.findIndex(t => t.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const [draggedItem] = currentTopics.splice(draggedIndex, 1);
        currentTopics.splice(targetIndex, 0, draggedItem);

        setTopics(currentTopics);

        try {
            const batch = writeBatch(db);
            currentTopics.forEach((topic, index) => {
                const newOrder = index + 1;
                const newNumber = newOrder.toString().padStart(2, '0');
                
                const topicRef = doc(db, "topics", topic.id);
                batch.update(topicRef, {
                    order: newOrder,
                    number: newNumber
                });
            });
            await batch.commit();
        } catch (error) {
            console.error("Error saving reorder:", error);
        }
    };

    return {
        subject,
        topics,
        loading,
        updateSubject,      // Added
        deleteSubject,      // Added
        createTopic,
        updateTopic,        // Added
        deleteTopic,
        retryTopic,
        handleReorderTopics
    };
};