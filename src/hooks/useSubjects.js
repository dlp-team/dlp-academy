import { useState, useEffect } from 'react';
import { 
    collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, arrayUnion, arrayRemove
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
            where("sharedWithUids", "array-contains", user.uid)
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

    const shareSubject = async (subjectId, email) => {
        try {
            const emailLower = email.toLowerCase();
            
            // 1. Find the user UID by email from your 'users' collection
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', emailLower));
            const querySnapshot = await getDocs(q);

            let targetUid = null;

            if (!querySnapshot.empty) {
                targetUid = querySnapshot.docs[0].id; 
            } else {
                console.warn(`User with email ${emailLower} not found.`);
                alert(`No se encontró usuario con el correo ${email}. El usuario debe crear una cuenta primero.`);
                return;
            }

            // 2. Get the current subject to check if already shared
            const subjectRef = doc(db, 'subjects', subjectId);
            const subjectSnap = await getDocs(query(collection(db, 'subjects'), where('__name__', '==', subjectId)));
            
            if (subjectSnap.empty) {
                console.error("Subject not found");
                return;
            }

            const subjectData = subjectSnap.docs[0].data();
            
            // Check if already shared with this user
            const alreadyShared = subjectData.sharedWith?.includes(targetUid);
            if (alreadyShared) {
                alert("Esta asignatura ya está compartida con este usuario.");
                return;
            }

            // 3. Update the subject with the new shared user
            const shareData = {
                email: emailLower,
                uid: targetUid,
                role: 'viewer',
                sharedAt: new Date()
            };
            await updateDoc(subjectRef, {
                sharedWith: arrayUnion(shareData),
                sharedWithUids: arrayUnion(targetUid),
                isShared: true,
                updatedAt: new Date()
            });
            console.log(`Subject ${subjectId} shared with ${emailLower}`);
            return shareData;

        } catch (error) {
            console.error("Error sharing subject:", error);
            alert("Error al compartir la asignatura: " + error.message);
            throw error;
        }
    };

    const unshareSubject = async (subjectId, email) => {
        try {
            const emailLower = email.toLowerCase();
            
            // 1. Find the user UID for this email
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', emailLower));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                console.error("User not found to unshare");
                return;
            }
            const targetUid = querySnapshot.docs[0].id;

            // 2. Update the subject
            const subjectRef = doc(db, 'subjects', subjectId);
            // Get current sharedWith array to find the user object
            const subjectSnap = await getDocs(query(collection(db, 'subjects'), where('__name__', '==', subjectId)));
            let userObj = null;
            if (!subjectSnap.empty) {
                const subjectData = subjectSnap.docs[0].data();
                userObj = (subjectData.sharedWith || []).find(u => u.uid === targetUid) || null;
            }
            await updateDoc(subjectRef, {
                sharedWith: userObj ? arrayRemove(userObj) : [],
                sharedWithUids: arrayRemove(targetUid),
                updatedAt: new Date()
            });
            console.log(`Subject ${subjectId} unshared with ${emailLower}`);
            return true;

        } catch (error) {
            console.error("Error unsharing subject:", error);
            throw error;
        }
    };

    return { 
        subjects, 
        loading, 
        addSubject, 
        updateSubject, 
        deleteSubject,
        touchSubject,
        shareSubject,
        unshareSubject
    };
};