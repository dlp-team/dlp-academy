// src/hooks/useSubjects.js
import { useState, useEffect } from 'react';
import { 
    collection, query, where, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, doc, onSnapshot, arrayUnion, arrayRemove, orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useSubjects = (user) => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentInstitutionId = user?.institutionId || null;

    const debugShare = (stage, payload = {}) => {
        console.info('[SHARE_DEBUG][subject]', {
            ts: new Date().toISOString(),
            stage,
            actorUid: user?.uid || null,
            actorEmail: user?.email || null,
            institutionId: currentInstitutionId,
            ...payload
        });
    };

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
            debugShare('start', { subjectId, email: emailLower });
            if (user?.email?.toLowerCase() === emailLower) {
                debugShare('validation_fail_self_share', { subjectId, email: emailLower });
                throw new Error("No puedes compartir contigo mismo.");
            }
            // 1. Find the user UID by email from your 'users' collection
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', emailLower));
            debugShare('user_lookup_query', { subjectId, email: emailLower });
            const querySnapshot = await getDocs(q);

            let targetUid = null;

            if (!querySnapshot.empty) {
                targetUid = querySnapshot.docs[0].id;
                const targetUserData = querySnapshot.docs[0].data() || {};
                const targetInstitutionId = targetUserData.institutionId || null;
                debugShare('user_lookup_success', { subjectId, targetUid, targetInstitutionId });

                if (targetInstitutionId && targetInstitutionId !== currentInstitutionId) {
                    debugShare('validation_fail_cross_institution', {
                        subjectId,
                        targetUid,
                        targetInstitutionId
                    });
                    throw new Error("No puedes compartir entre instituciones diferentes.");
                }
            } else {
                debugShare('validation_fail_user_not_found', { subjectId, email: emailLower });
                throw new Error("No existe ningún usuario registrado con ese correo.");
            }

            // 2. Get the current subject to check if already shared
            const subjectRef = doc(db, 'subjects', subjectId);
            const subjectSnap = await getDoc(subjectRef);

            if (!subjectSnap.exists()) {
                debugShare('validation_fail_subject_not_found', { subjectId, targetUid });
                throw new Error("No se encontró la asignatura.");
            }

            const subjectData = subjectSnap.data() || {};

            if (subjectData.ownerId && subjectData.ownerId === targetUid) {
                debugShare('validation_fail_target_is_owner', { subjectId, targetUid });
                throw new Error("No puedes compartir con el propietario.");
            }

            if (targetUid === user?.uid) {
                debugShare('validation_fail_target_is_actor', { subjectId, targetUid });
                throw new Error("No puedes compartir contigo mismo.");
            }

            // Check if already shared with this user (idempotent behavior)
            const alreadyShared =
                (Array.isArray(subjectData.sharedWithUids) && subjectData.sharedWithUids.includes(targetUid)) ||
                (Array.isArray(subjectData.sharedWith) && subjectData.sharedWith.some(entry => entry.uid === targetUid));
            debugShare('subject_loaded', {
                subjectId,
                targetUid,
                alreadyShared,
                sharedWithCount: Array.isArray(subjectData.sharedWith) ? subjectData.sharedWith.length : 0,
                sharedWithUidsCount: Array.isArray(subjectData.sharedWithUids) ? subjectData.sharedWithUids.length : 0
            });

            // 3. Build share data
            const shareData = {
                email: emailLower,
                uid: targetUid,
                role: 'viewer',
                sharedAt: new Date()
            };

            const originalSharedWith = Array.isArray(subjectData.sharedWith) ? subjectData.sharedWith : [];
            const originalSharedWithUids = Array.isArray(subjectData.sharedWithUids) ? subjectData.sharedWithUids : [];
            let sourceUpdated = false;

            // 4. Update source sharing only if needed
            if (!alreadyShared) {
                try {
                    debugShare('source_update_attempt', { subjectId, targetUid });
                    await updateDoc(subjectRef, {
                        sharedWith: arrayUnion(shareData),
                        sharedWithUids: arrayUnion(targetUid),
                        isShared: true,
                        updatedAt: new Date()
                    });
                    sourceUpdated = true;
                    debugShare('source_update_success', { subjectId, targetUid });
                } catch (err) {
                    debugShare('source_update_fail', {
                        subjectId,
                        targetUid,
                        errorCode: err?.code || null,
                        errorMessage: err?.message || String(err)
                    });
                    throw err;
                }
            }

            // 5. Ensure shortcut exists for the recipient (deterministic upsert, avoids query/index/rules read issues)
            try {
                const shortcutId = `${targetUid}_${subjectId}_subject`;
                const shortcutRef = doc(db, 'shortcuts', shortcutId);
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
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                debugShare('shortcut_upsert_attempt', {
                    subjectId,
                    targetUid,
                    shortcutId,
                    targetType: shortcutPayload.targetType
                });
                await setDoc(shortcutRef, shortcutPayload, { merge: true });
                debugShare('shortcut_upsert_success', { subjectId, targetUid, shortcutId });
            } catch (shortcutError) {
                debugShare('shortcut_step_fail', {
                    subjectId,
                    targetUid,
                    sourceUpdated,
                    errorCode: shortcutError?.code || null,
                    errorMessage: shortcutError?.message || String(shortcutError)
                });
                if (sourceUpdated) {
                    try {
                        debugShare('rollback_attempt', { subjectId, targetUid });
                        await updateDoc(subjectRef, {
                            sharedWith: originalSharedWith,
                            sharedWithUids: originalSharedWithUids,
                            isShared: originalSharedWithUids.length > 0,
                            updatedAt: new Date()
                        });
                        debugShare('rollback_success', { subjectId, targetUid });
                    } catch (rollbackError) {
                        debugShare('rollback_fail', {
                            subjectId,
                            targetUid,
                            errorCode: rollbackError?.code || null,
                            errorMessage: rollbackError?.message || String(rollbackError)
                        });
                        console.error('Subject share rollback failed:', rollbackError);
                    }
                    throw new Error('No se pudo crear el acceso directo. Se revirtió el compartido.');
                }
                throw shortcutError;
            }

            debugShare('success', { subjectId, targetUid, alreadyShared });
            return { ...shareData, alreadyShared };

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
            const subjectSnap = await getDoc(subjectRef);
            if (!subjectSnap.exists()) {
                console.error("Subject not found to unshare");
                return;
            }

            const subjectData = subjectSnap.data() || {};
            const currentSharedWith = Array.isArray(subjectData.sharedWith) ? subjectData.sharedWith : [];
            const currentSharedWithUids = Array.isArray(subjectData.sharedWithUids) ? subjectData.sharedWithUids : [];

            const newSharedWith = currentSharedWith.filter(u =>
                u.uid !== targetUid && u.email?.toLowerCase() !== emailLower
            );
            const newSharedWithUids = currentSharedWithUids.filter(uid => uid !== targetUid);

            await updateDoc(subjectRef, {
                sharedWith: newSharedWith,
                sharedWithUids: newSharedWithUids,
                isShared: newSharedWithUids.length > 0,
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