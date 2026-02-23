// src/hooks/useSubjects.js
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

        let ownedSubjects = [];

        const updateSubjectsState = async () => {
            const tempSubjects = [...ownedSubjects];

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

        return () => {
            unsubscribeOwned();
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
                return;
            }

            // 2. Get the current subject to check if already shared
            const subjectRef = doc(db, 'subjects', subjectId);
            const subjectSnap = await getDocs(query(collection(db, 'subjects'), where('__name__', '==', subjectId)));

            if (subjectSnap.empty) {
                return;
            }

            const subjectData = subjectSnap.docs[0].data();

            // Check if already shared with this user (fix: check by uid in sharedWith array)
            const alreadyShared = Array.isArray(subjectData.sharedWith) && subjectData.sharedWith.some(entry => entry.uid === targetUid);
            if (alreadyShared) {
                return;
            }

            // 3. Update the subject with the new shared user
            const shareData = {
                email: emailLower,
                uid: targetUid,
                role: 'viewer',
                sharedAt: new Date()
            };
            try {
                await updateDoc(subjectRef, {
                    sharedWith: arrayUnion(shareData),
                    sharedWithUids: arrayUnion(targetUid),
                    isShared: true,
                    updatedAt: new Date()
                });
            } catch (err) {
                throw err;
            }

            // Ensure exactly one shortcut exists for the newly shared user
            const existingShortcutQuery = query(
                collection(db, 'shortcuts'),
                where('ownerId', '==', targetUid),
                where('targetId', '==', subjectId),
                where('targetType', '==', 'subject')
            );
            const existingShortcutSnap = await getDocs(existingShortcutQuery);

            if (existingShortcutSnap.empty) {
                const shortcutPayload = {
                    ownerId: targetUid,
                    parentId: null,
                    targetId: subjectId,
                    targetType: 'subject',
                    institutionId: user?.institutionId || 'default',
                    shortcutName: subjectData.name || null,
                    shortcutCourse: subjectData.course || null,
                    shortcutColor: subjectData.color || null,
                    shortcutIcon: subjectData.icon || null,
                    shortcutCardStyle: subjectData.cardStyle || null,
                    shortcutModernFillColor: subjectData.modernFillColor || null,
                    createdAt: new Date()
                };
                try {
                    await addDoc(collection(db, 'shortcuts'), shortcutPayload);
                } catch (err) {
                    throw err;
                }
            } else if (existingShortcutSnap.docs.length > 1) {
                // Keep one, remove accidental duplicates
                const duplicateDocs = existingShortcutSnap.docs.slice(1);
                await Promise.all(duplicateDocs.map(d => deleteDoc(doc(db, 'shortcuts', d.id))));
            }

            return shareData;

        } catch (error) {
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