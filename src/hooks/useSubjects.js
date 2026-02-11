import { useState, useEffect } from 'react';
import { 
    collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useSubjects = (user) => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setSubjects([]);
            setLoading(false);
            return;
        }

        setLoading(true);

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

        let ownedSubjects = [];
        let sharedSubjects = [];

        const updateSubjectsState = async () => {
            // Merge owned and shared subjects, avoiding duplicates
            const allSubjectsMap = new Map();

            ownedSubjects.forEach(s => allSubjectsMap.set(s.id, s));
            sharedSubjects.forEach(s => allSubjectsMap.set(s.id, s));

            const tempSubjects = Array.from(allSubjectsMap.values());

            // Load topics for all subjects
            const subjectsWithTopics = await Promise.all(tempSubjects.map(async (subject) => {
                try {
                    const topicsRef = collection(db, "subjects", subject.id, "topics");
                    const topicsSnap = await getDocs(topicsRef);
                    const topicsList = topicsSnap.docs.map(t => ({ id: t.id, ...t.data() }));
                    topicsList.sort((a, b) => (a.order || 0) - (b.order || 0));
                    return { ...subject, topics: topicsList };
                } catch (e) {
                    console.warn(`Failed to load topics for subject ${subject.id}`, e);
                    return { ...subject, topics: [] };
                }
            }));

            setSubjects(subjectsWithTopics);
            setLoading(false);
        };

        // Real-time listener for owned subjects
        const unsubscribeOwned = onSnapshot(ownedQuery, (snapshot) => {
            ownedSubjects = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            updateSubjectsState();
        }, (error) => {
            console.error("Error listening to owned subjects:", error);
            ownedSubjects = [];
            updateSubjectsState();
        });

        // Real-time listener for shared subjects
        const unsubscribeShared = onSnapshot(sharedQuery, (snapshot) => {
            sharedSubjects = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            updateSubjectsState();
        }, (error) => {
            console.error("Error listening to shared subjects:", error);
            sharedSubjects = [];
            updateSubjectsState();
        });

        return () => {
            unsubscribeOwned();
            unsubscribeShared();
        };
    }, [user]);

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