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
            // 1. Query subjects created by the user (Owned)
            const ownedQuery = query(
                collection(db, "subjects"), 
                where("uid", "==", user.uid)
            );

            // 2. Query subjects shared with the user (Shared)
            const sharedQuery = query(
                collection(db, "subjects"), 
                where("sharedWith", "array-contains", user.uid)
            );

            // 3. Execute both queries in parallel
            const [ownedSnap, sharedSnap] = await Promise.allSettled([
                getDocs(ownedQuery),
                getDocs(sharedQuery)
            ]);

            const allDocsMap = new Map();

            // Process Owned
            if (ownedSnap.status === 'fulfilled') {
                ownedSnap.value.docs.forEach(d => {
                    allDocsMap.set(d.id, { id: d.id, ...d.data() });
                });
            } else {
                console.error("Error fetching owned subjects:", ownedSnap.reason);
            }

            // Process Shared
            if (sharedSnap.status === 'fulfilled') {
                sharedSnap.value.docs.forEach(d => {
                    allDocsMap.set(d.id, { id: d.id, ...d.data() });
                });
            } else {
                console.error("Error fetching shared subjects (check console for index link?):", sharedSnap.reason);
            }

            const tempSubjects = Array.from(allDocsMap.values());

            // 3. LOAD TOPICS (Only for the subjects we found)
            const subjectsWithTopics = await Promise.all(tempSubjects.map(async (subject) => {
                try {
                    const topicsRef = collection(db, "subjects", subject.id, "topics");
                    const topicsSnap = await getDocs(topicsRef);
                    const topicsList = topicsSnap.docs.map(t => ({ id: t.id, ...t.data() }));
                    // Simple sort
                    topicsList.sort((a, b) => (a.order || 0) - (b.order || 0));
                    return { ...subject, topics: topicsList };
                } catch (e) {
                    console.warn(`Failed to load topics for subject ${subject.id}`, e);
                    return { ...subject, topics: [] };
                }
            }));

            setSubjects(subjectsWithTopics);

        } catch (error) {
            console.error("Critical Error in useSubjects:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const addSubject = async (payload) => {
        const docRef = await addDoc(collection(db, "subjects"), payload);
        // Return the ID explicitly to handle the folder link correctly
        return docRef.id; 
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
        // Fire and forget update for "Usage" view sorting
        try {
            const subjectRef = doc(db, "subjects", id);
            await updateDoc(subjectRef, { 
                lastAccessed: new Date() 
            });
        } catch (e) {
            console.error("Error updating lastAccessed", e);
        }
    };

    return { 
        subjects, 
        loading, 
        addSubject, 
        updateSubject, 
        deleteSubject,
        touchSubject
    };
};