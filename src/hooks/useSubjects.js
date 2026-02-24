// src/hooks/useSubjects.js
import { useState, useEffect } from 'react';
import { 
    collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, arrayUnion, arrayRemove, orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useSubjects = (user) => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentInstitutionId = user?.institutionId || null;

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
            where("ownerId", "==", user.uid)
        );

        let ownedSubjects = [];

        const updateSubjectsState = async () => {
            const tempSubjects = ownedSubjects.filter(subject => {
                // Owner always sees their own subjects
                if (subject?.ownerId === user?.uid || subject?.uid === user?.uid) return true;
                // For institutional subjects, check institution match
                if (!currentInstitutionId || !subject?.institutionId) return true;
                return subject.institutionId === currentInstitutionId;
            });

            // Load topics for all subjects
            const subjectsWithTopics = await Promise.all(tempSubjects.map(async (subject) => {
                try {
                    const topicsRef = query(
                        collection(db, "topics"),
                        where("subjectId", "==", subject.id),
                        orderBy("order", "asc")
                    );
                    const topicsSnap = await getDocs(topicsRef);
                    const topicsList = topicsSnap.docs.map(t => ({ id: t.id, ...t.data() }));
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
    }, [user, currentInstitutionId]);

    const addSubject = async (payload) => {
        const docRef = await addDoc(collection(db, "subjects"), {
            ...payload,
            ownerId: payload?.ownerId || user.uid,
            institutionId: payload?.institutionId || currentInstitutionId
        });
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
                const targetUserData = querySnapshot.docs[0].data() || {};
                const targetInstitutionId = targetUserData.institutionId || null;

                if (targetInstitutionId && targetInstitutionId !== currentInstitutionId) {
                    throw new Error("No puedes compartir entre instituciones diferentes.");
                }
            } else {
                throw new Error("No existe ningún usuario registrado con ese correo.");
            }

            // 2. Get the current subject to check if already shared
            const subjectRef = doc(db, 'subjects', subjectId);
            const subjectSnap = await getDocs(query(collection(db, 'subjects'), where('__name__', '==', subjectId)));

            if (subjectSnap.empty) {
                throw new Error("No se encontró la asignatura.");
            }

            const subjectData = subjectSnap.docs[0].data();

            // Check if already shared with this user (idempotent behavior)
            const alreadyShared = Array.isArray(subjectData.sharedWith) && subjectData.sharedWith.some(entry => entry.uid === targetUid);

            // 3. Build share data
            const shareData = {
                email: emailLower,
                uid: targetUid,
                role: 'viewer',
                sharedAt: new Date()
            };

            // 4. Update source sharing only if needed
            if (!alreadyShared) {
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
            }

            // 5. Ensure exactly one shortcut exists for the recipient (even if already shared)
            const existingShortcutQuery = query(
                collection(db, 'shortcuts'),
                where('ownerId', '==', targetUid),
                where('targetId', '==', subjectId),
                where('targetType', '==', 'subject')
            );
            const existingShortcutSnap = await getDocs(existingShortcutQuery);
            const existingShortcutDocs = existingShortcutSnap.docs.filter(d => {
                const data = d.data() || {};
                return !data.institutionId || data.institutionId === currentInstitutionId;
            });

            if (existingShortcutDocs.length === 0) {
                const shortcutPayload = {
                    ownerId: targetUid,
                    parentId: null,
                    targetId: subjectId,
                    targetType: 'subject',
                    institutionId: currentInstitutionId,
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
            } else {
                const primaryShortcut = existingShortcutDocs[0];
                await updateDoc(doc(db, 'shortcuts', primaryShortcut.id), {
                    institutionId: currentInstitutionId,
                    updatedAt: new Date()
                });
                if (existingShortcutDocs.length > 1) {
                    // Keep one, remove accidental duplicates
                    const duplicateDocs = existingShortcutDocs.slice(1);
                    await Promise.all(duplicateDocs.map(d => deleteDoc(doc(db, 'shortcuts', d.id))));
                }
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