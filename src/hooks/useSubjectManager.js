// src/hooks/useSubjectManager.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    collection, query, doc, getDoc, onSnapshot, 
    updateDoc, deleteDoc, addDoc, serverTimestamp, 
    writeBatch, increment 
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
                }
            } catch (error) { console.error(error); }
        };
        fetchSubject();

        // Real-time Topics
        const q = query(collection(db, "subjects", subjectId, "topics"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setTopics(loaded.sort((a, b) => (a.order || 0) - (b.order || 0)));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, subjectId]);

    // 2. Subject Actions
    const updateSubject = async (data) => {
        await updateDoc(doc(db, "subjects", subjectId), data);
        setSubject(prev => ({ ...prev, ...data }));
    };

    const deleteSubject = async () => {
        await deleteDoc(doc(db, "subjects", subjectId));
        navigate('/home');
    };

    // 3. Topic Actions
    const deleteTopic = async (topicId) => {
        await deleteDoc(doc(db, "subjects", subjectId, "topics", topicId));
        await updateDoc(doc(db, "subjects", subjectId), { topicCount: increment(-1) });
    };

    const saveTopicOrder = async (reorderedList) => {
        const batch = writeBatch(db);
        reorderedList.forEach((t) => {
            const ref = doc(db, "subjects", subjectId, "topics", t.id);
            batch.update(ref, { number: t.number, order: t.order });
        });
        await batch.commit();
    };

    // 4. N8N & Generation Logic
    const sendToN8N = async (topicId, topicData, attachedFiles) => {
        const formData = new FormData();
        formData.append('topicId', topicId);
        formData.append('title', topicData.title);
        formData.append('prompt', topicData.prompt || '');
        formData.append('subject', subject.name);
        formData.append('course', subject.course);
        formData.append('my_value', JSON.stringify(topics));
        
        if (attachedFiles?.length) {
            attachedFiles.forEach(f => formData.append('files', f));
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 600000); // 10 mins

        try {
            const res = await fetch(N8N_WEBHOOK_URL, { 
                method: 'POST', body: formData, signal: controller.signal 
            });
            clearTimeout(timeout);
            if (!res.ok) throw new Error(`Status: ${res.status}`);
            
            const result = await res.json();
            await updateDoc(doc(db, "subjects", subjectId, "topics", topicId), {
                status: 'completed',
                pdfs: result.pdfs || [],
                quizzes: result.quizzes || []
            });
        } catch (error) {
            await updateDoc(doc(db, "subjects", subjectId, "topics", topicId), { status: 'error' });
        }
    };

    const createTopic = async (data, files, retryId = null) => {
        let topicId = retryId;
        const filesToSend = files.length > 0 ? files : (retryId ? fileCache[retryId] || [] : []);

        if (retryId) {
             // Retry Logic
            if (filesToSend.length === 0 && files.length === 0) {
                 // Warning logic could go here, but we'll proceed
            }
            await updateDoc(doc(db, "subjects", subjectId, "topics", retryId), {
                title: data.title, prompt: data.prompt, status: 'generating'
            });
        } else {
            // Create Logic
            const nextOrder = topics.length + 1;
            const newTopic = {
                title: data.title, prompt: data.prompt, status: 'generating',
                color: subject.color, createdAt: serverTimestamp(),
                order: nextOrder, number: nextOrder.toString().padStart(2, '0'),
                pdfs: [], quizzes: []
            };
            const ref = await addDoc(collection(db, "subjects", subjectId, "topics"), newTopic);
            topicId = ref.id;
            await updateDoc(doc(db, "subjects", subjectId), { topicCount: increment(1) });
            
            // Upload Metadata
            if (files.length > 0) {
                const docsRef = collection(db, "subjects", subjectId, "topics", topicId, "documents");
                files.forEach(f => addDoc(docsRef, { name: f.name, type: 'pdf', size: f.size, uploadedAt: serverTimestamp() }));
            }
        }

        // Update Cache and Send
        setFileCache(prev => ({ ...prev, [topicId]: filesToSend }));
        sendToN8N(topicId, data, filesToSend);
    };

    return {
        subject, topics, loading, fileCache,
        updateSubject, deleteSubject, 
        createTopic, deleteTopic, saveTopicOrder
    };
};