// src/hooks/useSubjectManager.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    collection, query, doc, getDoc, onSnapshot, 
    updateDoc, deleteDoc, addDoc, serverTimestamp, 
    writeBatch, increment, orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const N8N_WEBHOOK_URL = 'https://podzolic-dorethea-rancorously.ngrok-free.dev/webhook-test/711e538b-9d63-42bb-8494-873301ffdf39';

export const useSubjectManager = (user, subjectId) => {
    const navigate = useNavigate();
    const [subject, setSubject] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fileCache, setFileCache] = useState({}); // Stores files for retrying

    // 1. Fetch Data
    useEffect(() => {
        if (!user || !subjectId) return;

        const fetchSubject = async () => {
            try {
                const docSnap = await getDoc(doc(db, "subjects", subjectId));
                if (docSnap.exists()) {
                    setSubject({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("Subject not found");
                    navigate('/home');
                }
            } catch (error) {
                console.error("Error fetching subject:", error);
            }
        };

        fetchSubject();

        // Real-time listener for Topics (Ordered by 'order')
        const q = query(
            collection(db, "subjects", subjectId, "topics"),
            orderBy("order", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const topicsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTopics(topicsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, subjectId, navigate]);

    // 2. Helper: Send to N8N
    const sendToN8N = async (topicId, data, files) => {
        try {
            const formData = new FormData();
            formData.append('topicId', topicId);
            formData.append('title', data.title);
            formData.append('prompt', data.prompt);
            formData.append('subjectId', subjectId);
            formData.append('userId', user.uid);

            files.forEach((file) => {
                formData.append('files', file);
            });

            // Fire and forget (don't await response to keep UI fast)
            fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                body: formData
            }).catch(err => console.error("N8N Webhook Error:", err));

        } catch (error) {
            console.error("Error triggering N8N:", error);
        }
    };

    // 3. Create or Retry Topic
    const createTopic = async (data, files) => {
        const filesToSend = files.length > 0 ? files : (fileCache[data.retryId] || []);
        let topicId = data.retryId;

        if (data.isRetry && topicId) {
            // Retry Logic
            const existingTopic = topics.find(t => t.id === topicId);
            if (!existingTopic) {
                console.error("Cannot retry: Topic not found");
                return;
            }

            await updateDoc(doc(db, "subjects", subjectId, "topics", topicId), {
                title: data.title, 
                prompt: data.prompt, 
                status: 'generating'
            });
        } else {
            // Create Logic
            const nextOrder = topics.length + 1;
            // Pad number with zero (e.g. 1 -> "01")
            const numberString = nextOrder.toString().padStart(2, '0');

            const newTopic = {
                title: data.title, 
                prompt: data.prompt, 
                status: 'generating',
                color: subject.color, 
                createdAt: serverTimestamp(),
                order: nextOrder, 
                number: numberString,
                pdfs: [], 
                quizzes: []
            };
            
            const ref = await addDoc(collection(db, "subjects", subjectId, "topics"), newTopic);
            topicId = ref.id;
            
            await updateDoc(doc(db, "subjects", subjectId), { topicCount: increment(1) });
            
            // Upload Metadata
            if (files.length > 0) {
                const docsRef = collection(db, "subjects", subjectId, "topics", topicId, "documents");
                files.forEach(f => addDoc(docsRef, { 
                    name: f.name, 
                    type: 'pdf', 
                    size: f.size, 
                    uploadedAt: serverTimestamp() 
                }));
            }
        }

        // Update Cache and Send
        setFileCache(prev => ({ ...prev, [topicId]: filesToSend }));
        sendToN8N(topicId, data, filesToSend);
    };

    // 4. Delete Topic
    const deleteTopic = async (topicId) => {
        if (!window.confirm("¿Estás seguro de eliminar este tema?")) return;
        try {
            await deleteDoc(doc(db, "subjects", subjectId, "topics", topicId));
            await updateDoc(doc(db, "subjects", subjectId), { topicCount: increment(-1) });
        } catch (error) {
            console.error("Error deleting topic:", error);
        }
    };

    // 5. Retry Helper (Prepares data for Modal)
    const retryTopic = async (topicId) => {
        const topic = topics.find(t => t.id === topicId);
        if (!topic) return;
        return topic; 
    };

    // 6. Handle Reorder Topics (Drag & Drop)
    const handleReorderTopics = async (draggedId, targetId) => {
        if (draggedId === targetId) return;

        // A. Local Reordering (Optimistic UI)
        const currentTopics = [...topics];
        const draggedIndex = currentTopics.findIndex(t => t.id === draggedId);
        const targetIndex = currentTopics.findIndex(t => t.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const [draggedItem] = currentTopics.splice(draggedIndex, 1);
        currentTopics.splice(targetIndex, 0, draggedItem);

        // Update state immediately so UI doesn't lag
        setTopics(currentTopics);

        // B. Batch Update Firestore
        try {
            const batch = writeBatch(db);
            
            currentTopics.forEach((topic, index) => {
                const newOrder = index + 1;
                const newNumber = newOrder.toString().padStart(2, '0'); // "01", "02"...
                
                const topicRef = doc(db, "subjects", subjectId, "topics", topic.id);
                batch.update(topicRef, {
                    order: newOrder,
                    number: newNumber
                });
            });

            await batch.commit();
            console.log("Reorder saved successfully");
        } catch (error) {
            console.error("Error saving reorder:", error);
        }
    };

    return {
        subject,
        topics,
        loading,
        createTopic,
        deleteTopic,
        retryTopic,
        handleReorderTopics
    };
};