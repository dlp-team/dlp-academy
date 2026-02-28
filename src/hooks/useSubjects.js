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
            actorInstitutionId: currentInstitutionId,
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
        let sharedSubjects = [];

        const updateSubjectsState = async () => {
            const merged = [...ownedSubjects, ...sharedSubjects];
            const dedupMap = new Map();

            merged.forEach(subject => {
                const existing = dedupMap.get(subject.id);
                if (!existing || subject.isOwner === true) {
                    dedupMap.set(subject.id, subject);
                }
            });

            const tempSubjects = Array.from(dedupMap.values()).filter(subject => {
                // Owner always sees their own subjects
                if (subject?.ownerId === user?.uid) return true;
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
            ownedSubjects = snapshot.docs.map(d => ({ id: d.id, ...d.data(), isOwner: true }));
            updateSubjectsState();
        }, (error) => {
            console.error("Error listening to owned subjects:", error);
            ownedSubjects = [];
            updateSubjectsState();
        });

        const sharedQuery = query(
            collection(db, "subjects"),
            where("isShared", "==", true)
        );

        const unsubscribeShared = onSnapshot(sharedQuery, (snapshot) => {
            const userEmail = user.email?.toLowerCase() || '';
            sharedSubjects = snapshot.docs
                .filter(d => {
                    const data = d.data() || {};
                    if (data?.ownerId === user?.uid) return false;
                    if (currentInstitutionId && data?.institutionId && data.institutionId !== currentInstitutionId) {
                        return false;
                    }

                    const byUid = Array.isArray(data.sharedWithUids) && data.sharedWithUids.includes(user.uid);
                    const bySharedWith = Array.isArray(data.sharedWith) && data.sharedWith.some(share =>
                        share?.uid === user.uid || share?.email?.toLowerCase() === userEmail
                    );

                    return byUid || bySharedWith;
                })
                .map(d => ({ id: d.id, ...d.data(), isOwner: false }));
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

    const shareSubject = async (subjectId, email, role = 'viewer') => {
        try {
            const emailLower = email.toLowerCase();
            const normalizedRole = role === 'editor' ? 'editor' : 'viewer';
            debugShare('start', { subjectId, email: emailLower, role: normalizedRole });
            if (user?.email?.toLowerCase() === emailLower) {
                throw new Error("No puedes compartir contigo mismo.");
            }
            // 1. Find the user UID by email from your 'users' collection
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', emailLower));
            const querySnapshot = await getDocs(q);

            let targetUid = null;

            if (!querySnapshot.empty) {
                targetUid = querySnapshot.docs[0].id;
                const targetUserData = querySnapshot.docs[0].data() || {};
                const targetInstitutionId = targetUserData.institutionId || null;
                debugShare('user_lookup_success', { subjectId, targetUid, targetInstitutionId });
                if (targetInstitutionId && targetInstitutionId !== currentInstitutionId) {
                    throw new Error("No puedes compartir entre instituciones diferentes.");
                }
            } else {
                debugShare('user_lookup_fail', { subjectId, email: emailLower });
                throw new Error("No existe ningún usuario registrado con ese correo.");
            }

            // 2. Get the current subject to check if already shared
            const subjectRef = doc(db, 'subjects', subjectId);
            const subjectSnap = await getDoc(subjectRef);

            if (!subjectSnap.exists()) {
                throw new Error("No se encontró la asignatura.");
            }

            const subjectData = subjectSnap.data() || {};

            if (subjectData.ownerId && subjectData.ownerId === targetUid) {
                throw new Error("No puedes compartir con el propietario.");
            }

            if (targetUid === user?.uid) {
                throw new Error("No puedes compartir contigo mismo.");
            }

            // Check if already shared with this user (idempotent behavior)
            const alreadyShared =
                (Array.isArray(subjectData.sharedWithUids) && subjectData.sharedWithUids.includes(targetUid)) ||
                (Array.isArray(subjectData.sharedWith) && subjectData.sharedWith.some(entry => entry.uid === targetUid));

            const currentSharedWith = Array.isArray(subjectData.sharedWith) ? subjectData.sharedWith : [];
            const existingShare = currentSharedWith.find(entry => entry.uid === targetUid);

            // 3. Build share data
            const shareData = {
                email: emailLower,
                uid: targetUid,
                role: normalizedRole,
                canEdit: normalizedRole === 'editor',
                shareOrigin: 'direct',
                sharedAt: new Date()
            };

            const originalSharedWith = Array.isArray(subjectData.sharedWith) ? subjectData.sharedWith : [];
            const originalSharedWithUids = Array.isArray(subjectData.sharedWithUids) ? subjectData.sharedWithUids : [];
            let sourceUpdated = false;

            // 4. Update source sharing only if needed
            if (!alreadyShared) {
                try {
                    await updateDoc(subjectRef, {
                        sharedWith: arrayUnion(shareData),
                        sharedWithUids: arrayUnion(targetUid),
                        isShared: true,
                        updatedAt: new Date()
                    });
                    sourceUpdated = true;
                    debugShare('subject_source_updated_new_share', { subjectId, targetUid });
                } catch (err) {
                    debugShare('subject_source_update_fail', {
                        subjectId,
                        targetUid,
                        errorCode: err?.code || null,
                        errorMessage: err?.message || String(err)
                    });
                    throw err;
                }
            } else if ((existingShare?.role || 'viewer') !== normalizedRole) {
                const updatedSharedWith = currentSharedWith.map(entry =>
                    entry.uid === targetUid
                        ? {
                            ...entry,
                            role: normalizedRole,
                            canEdit: normalizedRole === 'editor'
                        }
                        : entry
                );

                await updateDoc(subjectRef, {
                    sharedWith: updatedSharedWith,
                    updatedAt: new Date()
                });
                debugShare('subject_source_updated_role', { subjectId, targetUid, role: normalizedRole });
            }

            // 5. Ensure shortcut exists for the recipient (deterministic upsert, avoids query/index/rules read issues)
            try {
                const shortcutId = `${targetUid}_${subjectId}_subject`;
                const shortcutRef = doc(db, 'shortcuts', shortcutId);
                const shortcutInstitutionId = subjectData?.institutionId || currentInstitutionId || null;
                const shortcutUpdatePayload = {
                    ownerId: targetUid,
                    targetId: subjectId,
                    targetType: 'subject',
                    institutionId: shortcutInstitutionId,
                    shortcutName: subjectData?.name || 'Asignatura',
                    shortcutCourse: subjectData?.course || null,
                    shortcutTags: Array.isArray(subjectData?.tags) ? subjectData.tags : [],
                    shortcutColor: subjectData?.color || 'from-slate-500 to-slate-700',
                    shortcutIcon: subjectData?.icon || 'book',
                    shortcutCardStyle: subjectData?.cardStyle || 'default',
                    shortcutModernFillColor: subjectData?.modernFillColor ?? subjectData?.fillColor ?? null,
                    updatedAt: new Date()
                };

                try {
                    await updateDoc(shortcutRef, shortcutUpdatePayload);
                    debugShare('shortcut_upsert_updated_existing', { subjectId, targetUid, shortcutId });
                } catch (updateShortcutError) {
                    const updateCode = updateShortcutError?.code || '';
                    const updateMessage = String(updateShortcutError?.message || '').toLowerCase();
                    const isNotFound =
                        updateCode === 'not-found' ||
                        updateCode === 'firestore/not-found' ||
                        updateMessage.includes('not found') ||
                        updateMessage.includes('no document');
                    const isPermissionDenied =
                        updateCode === 'permission-denied' ||
                        updateCode === 'firestore/permission-denied' ||
                        updateMessage.includes('permission') ||
                        updateMessage.includes('insufficient permissions');

                    debugShare('shortcut_update_fail', {
                        subjectId,
                        targetUid,
                        shortcutId,
                        errorCode: updateCode,
                        errorMessage: updateShortcutError?.message || String(updateShortcutError),
                        isNotFound,
                        isPermissionDenied
                    });

                    if (!isNotFound && !isPermissionDenied) {
                        throw updateShortcutError;
                    }

                    const shortcutCreatePayload = {
                        ownerId: targetUid,
                        parentId: null,
                        targetId: subjectId,
                        targetType: 'subject',
                        institutionId: shortcutInstitutionId,
                        shortcutName: subjectData?.name || 'Asignatura',
                        shortcutCourse: subjectData?.course || null,
                        shortcutTags: Array.isArray(subjectData?.tags) ? subjectData.tags : [],
                        shortcutColor: subjectData?.color || 'from-slate-500 to-slate-700',
                        shortcutIcon: subjectData?.icon || 'book',
                        shortcutCardStyle: subjectData?.cardStyle || 'default',
                        shortcutModernFillColor: subjectData?.modernFillColor ?? subjectData?.fillColor ?? null,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    await setDoc(shortcutRef, shortcutCreatePayload);
                    debugShare('shortcut_upsert_created_missing', { subjectId, targetUid, shortcutId, shortcutInstitutionId });
                }
            } catch (shortcutError) {
                debugShare('shortcut_upsert_fail', {
                    subjectId,
                    targetUid,
                    sourceUpdated,
                    errorCode: shortcutError?.code || null,
                    errorMessage: shortcutError?.message || String(shortcutError)
                });
                if (sourceUpdated) {
                    try {
                        await updateDoc(subjectRef, {
                            sharedWith: originalSharedWith,
                            sharedWithUids: originalSharedWithUids,
                            isShared: originalSharedWithUids.length > 0,
                            updatedAt: new Date()
                        });
                    } catch (rollbackError) {
                        console.error('Subject share rollback failed:', rollbackError);
                    }
                    throw new Error('No se pudo crear el acceso directo. Se revirtió el compartido.');
                }
                throw shortcutError;
            }
            debugShare('success', { subjectId, targetUid, alreadyShared });
            return {
                ...shareData,
                alreadyShared,
                roleUpdated: alreadyShared && (existingShare?.role || 'viewer') !== normalizedRole
            };

        } catch (error) {
            debugShare('fail', {
                subjectId,
                email,
                errorCode: error?.code || null,
                errorMessage: error?.message || String(error)
            });
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

    const transferSubjectOwnership = async (subjectId, nextOwnerEmail) => {
        try {
            const normalizedEmail = String(nextOwnerEmail || '').trim().toLowerCase();
            if (!normalizedEmail) {
                throw new Error('Debes seleccionar un usuario válido para transferir la propiedad.');
            }

            if (normalizedEmail === (user?.email || '').toLowerCase()) {
                throw new Error('No puedes transferir la propiedad a tu propio usuario.');
            }

            const subjectRef = doc(db, 'subjects', subjectId);
            const subjectSnap = await getDoc(subjectRef);

            if (!subjectSnap.exists()) {
                throw new Error('No se encontró la asignatura.');
            }

            const subjectData = subjectSnap.data() || {};
            const currentOwnerUid = subjectData?.ownerId || null;

            if (!currentOwnerUid || currentOwnerUid !== user?.uid) {
                throw new Error('Solo el propietario actual puede transferir la propiedad.');
            }

            const currentSharedWith = Array.isArray(subjectData.sharedWith) ? subjectData.sharedWith : [];
            const currentSharedWithUids = Array.isArray(subjectData.sharedWithUids) ? subjectData.sharedWithUids : [];
            const recipientShareEntry = currentSharedWith.find(entry => (entry?.email || '').toLowerCase() === normalizedEmail);
            const nextOwnerUid = recipientShareEntry?.uid || null;

            if (!nextOwnerUid || !currentSharedWithUids.includes(nextOwnerUid)) {
                throw new Error('Solo puedes transferir la propiedad a un usuario que ya tenga acceso compartido.');
            }

            const updatedSharedWith = currentSharedWith
                .filter(entry => entry?.uid !== nextOwnerUid && (entry?.email || '').toLowerCase() !== normalizedEmail);
            const updatedSharedWithUids = currentSharedWithUids.filter(uid => uid !== nextOwnerUid);

            const currentOwnerEmail = (user?.email || subjectData?.ownerEmail || '').toLowerCase();
            const hasCurrentOwnerShare = updatedSharedWith.some(entry =>
                entry?.uid === currentOwnerUid || (entry?.email || '').toLowerCase() === currentOwnerEmail
            );

            if (!hasCurrentOwnerShare) {
                updatedSharedWith.push({
                    uid: currentOwnerUid,
                    email: currentOwnerEmail,
                    role: 'editor',
                    canEdit: true,
                    shareOrigin: 'ownership-transfer',
                    sharedAt: new Date()
                });
                if (!updatedSharedWithUids.includes(currentOwnerUid)) {
                    updatedSharedWithUids.push(currentOwnerUid);
                }
            }

            const currentOwnerShortcutId = `${currentOwnerUid}_${subjectId}_subject`;
            const currentOwnerShortcutRef = doc(db, 'shortcuts', currentOwnerShortcutId);
            await setDoc(currentOwnerShortcutRef, {
                ownerId: currentOwnerUid,
                parentId: subjectData?.folderId ?? null,
                targetId: subjectId,
                targetType: 'subject',
                institutionId: subjectData?.institutionId || currentInstitutionId || null,
                hiddenInManual: false,
                shortcutName: subjectData?.name || 'Asignatura',
                shortcutCourse: subjectData?.course || null,
                shortcutTags: Array.isArray(subjectData?.tags) ? subjectData.tags : [],
                shortcutColor: subjectData?.color || 'from-slate-500 to-slate-700',
                shortcutIcon: subjectData?.icon || 'book',
                shortcutCardStyle: subjectData?.cardStyle || 'default',
                shortcutModernFillColor: subjectData?.modernFillColor ?? subjectData?.fillColor ?? null,
                updatedAt: new Date(),
                createdAt: new Date()
            }, { merge: true });

            const subjectUpdatePayload = {
                ownerId: nextOwnerUid,
                ownerEmail: recipientShareEntry?.email || normalizedEmail,
                ownerName: recipientShareEntry?.displayName || recipientShareEntry?.name || '',
                sharedWith: updatedSharedWith,
                sharedWithUids: updatedSharedWithUids,
                isShared: updatedSharedWithUids.length > 0,
                updatedAt: new Date()
            };

            await updateDoc(subjectRef, subjectUpdatePayload);

            return {
                success: true,
                previousOwnerUid: currentOwnerUid,
                newOwnerUid: nextOwnerUid,
                newOwnerEmail: normalizedEmail
            };
        } catch (error) {
            console.error('Error transferring subject ownership:', error);
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
        unshareSubject,
        transferSubjectOwnership
    };
};