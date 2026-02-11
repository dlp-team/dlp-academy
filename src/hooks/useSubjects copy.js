// src/hooks/useSubjects.js
import { useState, useEffect, useCallback } from 'react';
import { 
    collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useSubjects = (user) => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSubjects = useCallback(async () => {
        if (!user) return;
        try {
            const q = query(collection(db, "subjects"), where("uid", "==", user.uid));
            const querySnapshot = await getDocs(q);
            
            const tempSubjects = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // Load Topics
            const subjectsWithTopics = await Promise.all(tempSubjects.map(async (subject) => {
                const topicsRef = collection(db, "subjects", subject.id, "topics");
                const topicsSnap = await getDocs(topicsRef);
                const topicsList = topicsSnap.docs.map(t => ({ id: t.id, ...t.data() }));
                return { ...subject, topics: topicsList };
            }));

            setSubjects(subjectsWithTopics);
        } catch (error) {
            console.error("Error fetching subjects:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const addSubject = async (payload) => {
        const docRef = await addDoc(collection(db, "subjects"), payload);
        const newSubject = { id: docRef.id, ...payload, topics: [] };
        setSubjects(prev => [...prev, newSubject]);
        return newSubject;
    };

    const updateSubject = async (id, payload) => {
        await updateDoc(doc(db, "subjects", id), payload);
        setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...payload } : s));
    };

    const deleteSubject = async (id) => {
        await deleteDoc(doc(db, "subjects", id));
        setSubjects(prev => prev.filter(s => s.id !== id));
    };

    const touchSubject = async (id) => {
        // Fire and forget update for "Usage" sorting
        try { updateDoc(doc(db, "subjects", id), { updatedAt: new Date() }); } catch(e){}
    };

    return { subjects, loading, addSubject, updateSubject, deleteSubject, touchSubject };
};