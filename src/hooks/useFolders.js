// src/hooks/useFolders.js
import { useState, useEffect } from 'react';
import { 
    collection, query, where, addDoc, updateDoc, deleteDoc, doc, 
    getDoc, setDoc, arrayUnion, arrayRemove, onSnapshot, writeBatch, getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { isInvalidFolderMove } from '../utils/folderUtils';

export const useFolders = (user) => {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentInstitutionId = user?.institutionId || null;

    const debugShare = () => {};

    useEffect(() => {
        if (!user) {
            setFolders([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const ownedQuery = query(collection(db, "folders"), where("ownerId", "==", user.uid));
        const sharedQuery = query(collection(db, "folders"), where("isShared", "==", true));

        let ownedFolders = [];
        let sharedFolders = [];

        const updateState = () => {
            const allFolders = [...ownedFolders, ...sharedFolders];
            setFolders(allFolders);
            setLoading(false);
        };

        const unsubscribeOwned = onSnapshot(ownedQuery, (snapshot) => {
            ownedFolders = snapshot.docs
                .map(d => ({ id: d.id, ...d.data(), parentId: d.data().parentId || null, isOwner: true }))
                .filter(folder => {
                    // Owner always sees their own folders
                    if (folder?.ownerId === user?.uid) return true;
                    if (!currentInstitutionId || !folder?.institutionId) return true;
                    return folder.institutionId === currentInstitutionId;
                });
            updateState();
        });

        const unsubscribeShared = onSnapshot(sharedQuery, (snapshot) => {
            sharedFolders = snapshot.docs.filter(d => {
                const data = d.data();
                const userEmail = user.email?.toLowerCase() || '';
                if (currentInstitutionId && data?.institutionId && data.institutionId !== currentInstitutionId) {
                    return false;
                }
                return data.sharedWith?.some(share => 
                    share.email?.toLowerCase() === userEmail || share.uid === user.uid
                );
            }).map(d => ({ 
                id: d.id, ...d.data(), parentId: d.data().parentId || null, isOwner: false 
            }));
            updateState();
        });

        return () => { unsubscribeOwned(); unsubscribeShared(); };
    }, [user, currentInstitutionId]);

    // --- ATOMIC HELPERS ---

    const addSubjectToFolder = async (folderId, subjectId) => {
        if (!folderId) return;
        
        const batch = writeBatch(db);
        
        // 1. Set subject's folderId
        const subjectRef = doc(db, "subjects", subjectId);
        
        // 2. Get folder's shared users and propagate to subject
        try {
            const folderRef = doc(db, "folders", folderId);
            const folderSnap = await getDoc(folderRef);
            if (folderSnap.exists()) {
                const sharedWithUids = folderSnap.data().sharedWithUids || [];
                const sharedWith = folderSnap.data().sharedWith || [];
                // Get current subject's shared users and add folder's users
                const subjectSnap = await getDoc(subjectRef);
                let newSharedWithUids = subjectSnap.exists() ? (subjectSnap.data().sharedWithUids || []) : [];
                let newSharedWith = subjectSnap.exists() ? (subjectSnap.data().sharedWith || []) : [];
                // Add all folder's shared users (UIDs)
                sharedWithUids.forEach(uid => {
                    if (!newSharedWithUids.includes(uid)) {
                        newSharedWithUids.push(uid);
                    }
                });
                // Add all folder's shared users (user data)
                sharedWith.forEach(userObj => {
                    if (!newSharedWith.some(u => u.uid === userObj.uid)) {
                        newSharedWith.push(userObj);
                    }
                });
                // Update subject with folder reference and propagated sharing
                batch.update(subjectRef, {
                    folderId: folderId,
                    sharedWith: newSharedWith,
                    sharedWithUids: newSharedWithUids,
                    isShared: newSharedWithUids.length > 0,
                    updatedAt: new Date()
                });
            }
        } catch (e) {
            console.error("Error propagating folder sharing to subject:", e);
        }
        
        await batch.commit();
    };

    // --- CORE ACTIONS ---
    const addFolder = async (payload) => {
        const sanitizedPayload = {
            name: payload?.name || '',
            description: payload?.description || '',
            color: payload?.color || 'from-amber-400 to-amber-600',
            tags: Array.isArray(payload?.tags) ? payload.tags : [],
            cardStyle: payload?.cardStyle || 'default',
            modernFillColor: payload?.modernFillColor || null,
            parentId: payload?.parentId || null
        };

        const parentId = sanitizedPayload.parentId || null;
        let sharedWith = [];
        let sharedWithUids = [];
        let isShared = false;
        // If parentId exists, inherit sharing from parent
        if (parentId) {
            try {
                const parentSnap = await getDoc(doc(db, "folders", parentId));
                if (parentSnap.exists()) {
                    const parentData = parentSnap.data();
                    sharedWith = parentData.sharedWith || [];
                    sharedWithUids = parentData.sharedWithUids || [];
                    isShared = parentData.isShared || false;
                }
            } catch (e) {
                console.error("Error inheriting sharing from parent folder:", e);
            }
        }
        const docRef = await addDoc(collection(db, "folders"), {
            ...sanitizedPayload,
            ownerId: user.uid,
            ownerEmail: user.email,
            institutionId: payload?.institutionId || currentInstitutionId,
            sharedWith,
            sharedWithUids,
            isShared,
            parentId: parentId,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return { id: docRef.id, ...sanitizedPayload };
    };

    const updateFolder = async (id, payload) => {
        const sanitizedPayload = {
            ...(payload?.name !== undefined ? { name: payload.name } : {}),
            ...(payload?.description !== undefined ? { description: payload.description } : {}),
            ...(payload?.color !== undefined ? { color: payload.color } : {}),
            ...(payload?.tags !== undefined ? { tags: Array.isArray(payload.tags) ? payload.tags : [] } : {}),
            ...(payload?.cardStyle !== undefined ? { cardStyle: payload.cardStyle } : {}),
            ...(payload?.modernFillColor !== undefined ? { modernFillColor: payload.modernFillColor } : {}),
            ...(payload?.parentId !== undefined ? { parentId: payload.parentId } : {}),
            ...(payload?.sharedWith !== undefined ? { sharedWith: payload.sharedWith } : {}),
            ...(payload?.sharedWithUids !== undefined ? { sharedWithUids: payload.sharedWithUids } : {}),
            ...(payload?.isShared !== undefined ? { isShared: payload.isShared } : {}),
            ...(payload?.institutionId !== undefined ? { institutionId: payload.institutionId } : {}),
            ...(payload?.ownerId !== undefined ? { ownerId: payload.ownerId } : {}),
            ...(payload?.ownerEmail !== undefined ? { ownerEmail: payload.ownerEmail } : {}),
            updatedAt: new Date()
        };

        await updateDoc(doc(db, "folders", id), sanitizedPayload);
    };

    const deleteFolder = async (id) => {
        const folder = folders.find(f => f.id === id);
        if (!folder) return;

        const batch = writeBatch(db);

        // Helper to recursively delete folders and their contents
        const deleteFolderRecursive = async (folderId) => {
            const folderToDelete = folders.find(f => f.id === folderId);
            if (!folderToDelete) return;

            // 1. Delete all child subjects (query by folderId)
            try {
                const subjectsSnap = await getDocs(
                    query(collection(db, "subjects"), where("folderId", "==", folderId))
                );
                subjectsSnap.forEach(docSnap => {
                    const subjectRef = doc(db, "subjects", docSnap.id);
                    batch.delete(subjectRef);
                });
            } catch (e) {
                console.error("Error fetching subjects for deletion:", e);
            }

            // 2. Recursively delete all child folders (query by parentId)
            try {
                const childFoldersSnap = await getDocs(
                    query(collection(db, "folders"), where("parentId", "==", folderId))
                );
                for (const childDoc of childFoldersSnap.docs) {
                    await deleteFolderRecursive(childDoc.id);
                }
            } catch (e) {
                console.error("Error fetching child folders for deletion:", e);
            }

            // 3. Delete the folder itself
            const folderRef = doc(db, "folders", folderId);
            batch.delete(folderRef);
        };

        // Start recursive deletion
        await deleteFolderRecursive(id);

        // Commit all deletions in one batch
        await batch.commit();
    };

    const deleteFolderOnly = async (id) => {
        const folder = folders.find(f => f.id === id);
        if (!folder) return;

        const batch = writeBatch(db);
        const parentId = folder.parentId || null;

        // 1. Move all child subjects to parent (query by folderId)
        try {
            const subjectsSnap = await getDocs(
                query(collection(db, "subjects"), where("folderId", "==", id))
            );
            subjectsSnap.forEach(docSnap => {
                const subjectRef = doc(db, "subjects", docSnap.id);
                batch.update(subjectRef, { 
                    folderId: parentId,
                    updatedAt: new Date()
                });
            });
        } catch (e) {
            console.error("Error fetching subjects to move:", e);
        }

        // 2. Move all child folders to parent (query by parentId)
        try {
            const childFoldersSnap = await getDocs(
                query(collection(db, "folders"), where("parentId", "==", id))
            );
            childFoldersSnap.forEach(docSnap => {
                const childRef = doc(db, "folders", docSnap.id);
                batch.update(childRef, {
                    parentId: parentId,
                    updatedAt: new Date()
                });
            });
        } catch (e) {
            console.error("Error fetching child folders to move:", e);
        }

        // 4. Commit all changes
        await batch.commit();

        // 5. Delete the folder itself
        await deleteDoc(doc(db, "folders", id));
    };

    const shareFolder = async (folderId, email, role = 'viewer') => {

        if (user && user.email && user.email.toLowerCase() === email.toLowerCase()) {
            debugShare('validation_fail_self_share', { folderId, email: email.toLowerCase() });
            alert("No puedes compartir una carpeta contigo mismo.");
            return;
        }

        try {
            const emailLower = email.toLowerCase();
            debugShare('start', { folderId, email: emailLower, role });
            
            // 1. Find the user UID by email from your 'users' collection
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', emailLower));
            debugShare('user_lookup_query', { folderId, email: emailLower });
            const querySnapshot = await getDocs(q);

            let targetUid = null;

            if (!querySnapshot.empty) {
                targetUid = querySnapshot.docs[0].id;
                const targetUserData = querySnapshot.docs[0].data() || {};
                const targetInstitutionId = targetUserData.institutionId || null;
                debugShare('user_lookup_success', { folderId, targetUid, targetInstitutionId });
                if (targetInstitutionId && targetInstitutionId !== currentInstitutionId) {
                    debugShare('validation_fail_cross_institution', { folderId, targetUid, targetInstitutionId });
                    alert("No puedes compartir entre instituciones diferentes.");
                    return;
                }
            } else {
                debugShare('validation_fail_user_not_found', { folderId, email: emailLower });
                console.warn(`User with email ${emailLower} not found.`);
                alert(`No se encontró usuario con el correo ${email}. El usuario debe crear una cuenta primero.`);
                return;
            }

            // 2. Now you have the verified UID securely
            const shareData = {
                email: emailLower,
                uid: targetUid,
                role,
                sharedAt: new Date()
            };

            // 3. Update the folder document
            const folderRef = doc(db, 'folders', folderId);
            const folderSnap = await getDoc(folderRef);

            if (!folderSnap.exists()) {
                debugShare('validation_fail_folder_not_found', { folderId, targetUid });
                console.error("Folder not found");
                return;
            }

            const folderData = folderSnap.data();
            const originalFolderSharedWith = Array.isArray(folderData.sharedWith) ? folderData.sharedWith : [];
            const originalFolderSharedWithUids = Array.isArray(folderData.sharedWithUids) ? folderData.sharedWithUids : [];
            const subjectsRollbackState = [];
            let sourceUpdated = false;
            
            // Check if already shared with this user (idempotent behavior)
            const alreadyShared = folderData.sharedWith?.some(s => s.uid === targetUid);
            debugShare('folder_loaded', {
                folderId,
                targetUid,
                alreadyShared,
                sharedWithCount: Array.isArray(folderData.sharedWith) ? folderData.sharedWith.length : 0,
                sharedWithUidsCount: Array.isArray(folderData.sharedWithUids) ? folderData.sharedWithUids.length : 0
            });
            
           const batch = writeBatch(db);

            // A) Update the Folder only when needed
            if (!alreadyShared) {
                debugShare('source_update_enqueued_folder', { folderId, targetUid });
                batch.update(folderRef, {
                    sharedWith: arrayUnion(shareData),      // For UI display
                    sharedWithUids: arrayUnion(targetUid),  // For Security Rules & Perms
                    isShared: true,
                    updatedAt: new Date()
                });
            }

            // B) Retroactively update ALL Subjects inside this folder (query by folderId)
            if (!alreadyShared) {
                try {
                    const subjectsSnap = await getDocs(
                        query(collection(db, "subjects"), where("folderId", "==", folderId))
                    );
                    debugShare('source_update_subjects_query_success', {
                        folderId,
                        targetUid,
                        subjectsCount: subjectsSnap.size
                    });
                    subjectsSnap.forEach(docSnap => {
                        const subjectData = docSnap.data() || {};
                        subjectsRollbackState.push({
                            id: docSnap.id,
                            sharedWith: Array.isArray(subjectData.sharedWith) ? subjectData.sharedWith : [],
                            sharedWithUids: Array.isArray(subjectData.sharedWithUids) ? subjectData.sharedWithUids : []
                        });
                        const subjectRef = doc(db, "subjects", docSnap.id);
                        batch.update(subjectRef, {
                            isShared: true,
                            sharedWith: arrayUnion(shareData),
                            sharedWithUids: arrayUnion(targetUid)
                        });
                    });
                } catch (e) {
                    debugShare('source_update_subjects_query_fail', {
                        folderId,
                        targetUid,
                        errorCode: e?.code || null,
                        errorMessage: e?.message || String(e)
                    });
                    console.error("Error sharing subjects in folder:", e);
                }
            }

            // 6. COMMIT CHANGES
            debugShare('source_update_commit_attempt', { folderId, targetUid, alreadyShared });
            await batch.commit();
            debugShare('source_update_commit_success', { folderId, targetUid, alreadyShared });
            if (!alreadyShared) {
                sourceUpdated = true;
            }

            // 7. Ensure folder shortcut exists for recipient (deterministic upsert)
            try {
                const shortcutId = `${targetUid}_${folderId}_folder`;
                const shortcutRef = doc(db, 'shortcuts', shortcutId);
                const shortcutPayload = {
                    ownerId: targetUid,
                    parentId: null,
                    targetId: folderId,
                    targetType: 'folder',
                    institutionId: currentInstitutionId,
                    shortcutName: folderData.name || null,
                    shortcutTags: Array.isArray(folderData.tags) ? folderData.tags : [],
                    shortcutColor: folderData.color || null,
                    shortcutCardStyle: folderData.cardStyle || null,
                    shortcutModernFillColor: folderData.modernFillColor || null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                debugShare('shortcut_upsert_attempt', { folderId, targetUid, shortcutId });
                await setDoc(shortcutRef, shortcutPayload, { merge: true });
                debugShare('shortcut_upsert_success', { folderId, targetUid, shortcutId });
            } catch (shortcutError) {
                debugShare('shortcut_step_fail', {
                    folderId,
                    targetUid,
                    sourceUpdated,
                    errorCode: shortcutError?.code || null,
                    errorMessage: shortcutError?.message || String(shortcutError)
                });
                if (sourceUpdated) {
                    try {
                        debugShare('rollback_attempt', {
                            folderId,
                            targetUid,
                            subjectsRollbackCount: subjectsRollbackState.length
                        });
                        const rollbackBatch = writeBatch(db);
                        rollbackBatch.update(folderRef, {
                            sharedWith: originalFolderSharedWith,
                            sharedWithUids: originalFolderSharedWithUids,
                            isShared: originalFolderSharedWithUids.length > 0,
                            updatedAt: new Date()
                        });

                        subjectsRollbackState.forEach(subject => {
                            rollbackBatch.update(doc(db, 'subjects', subject.id), {
                                sharedWith: subject.sharedWith,
                                sharedWithUids: subject.sharedWithUids,
                                isShared: subject.sharedWithUids.length > 0,
                                updatedAt: new Date()
                            });
                        });

                        await rollbackBatch.commit();
                        debugShare('rollback_success', { folderId, targetUid });
                    } catch (rollbackError) {
                        debugShare('rollback_fail', {
                            folderId,
                            targetUid,
                            errorCode: rollbackError?.code || null,
                            errorMessage: rollbackError?.message || String(rollbackError)
                        });
                        console.error('Folder share rollback failed:', rollbackError);
                    }
                    throw new Error('No se pudo crear el acceso directo. Se revirtió el compartido.');
                }
                throw shortcutError;
            }

            debugShare('success', { folderId, targetUid, alreadyShared });
            return shareData;

        } catch (error) {
            console.error("Error sharing folder:", error);
            throw error; // Re-throw so UI can handle it
        }
    };

    const unshareFolder = async (folderId, email) => {
        try {
            const emailLower = email.toLowerCase();
            // A. Find the user UID for this email (to remove from arrays)
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', emailLower));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                console.error("User not found to unshare");
                return;
            }
            const targetUid = querySnapshot.docs[0].id;

            // B. Get Folder to find sharing info
            const folderRef = doc(db, 'folders', folderId);
            const folderSnap = await getDoc(folderRef);
            if (!folderSnap.exists()) {
                console.error("Folder not found to unshare");
                return;
            }
            const folderData = folderSnap.data();
            
            // Filter out the user from the sharedWith array object
            const currentSharedWith = Array.isArray(folderData.sharedWith) ? folderData.sharedWith : [];
            const currentSharedWithUids = Array.isArray(folderData.sharedWithUids) ? folderData.sharedWithUids : [];
            const newSharedWith = currentSharedWith.filter(u =>
                u.uid !== targetUid && u.email?.toLowerCase() !== emailLower
            );
            const newSharedWithUids = currentSharedWithUids.filter(uid => uid !== targetUid);

            const batch = writeBatch(db);

            // C. Update Folder
            batch.update(folderRef, {
                sharedWith: newSharedWith,        // Update the visual list
                sharedWithUids: newSharedWithUids, // Remove permissions
                isShared: newSharedWithUids.length > 0, // Update isShared flag
                updatedAt: new Date()
            });

            // D. Remove from Subjects (query by folderId)
            try {
                const subjectsSnap = await getDocs(
                    query(collection(db, "subjects"), where("folderId", "==", folderId))
                );
                subjectsSnap.forEach(docSnap => {
                    const subjectRef = doc(db, "subjects", docSnap.id);
                    const subjectData = docSnap.data() || {};
                    const subjectSharedWith = Array.isArray(subjectData.sharedWith) ? subjectData.sharedWith : [];
                    const subjectSharedWithUids = Array.isArray(subjectData.sharedWithUids) ? subjectData.sharedWithUids : [];
                    const newSubjectSharedWith = subjectSharedWith.filter(u =>
                        u.uid !== targetUid && u.email?.toLowerCase() !== emailLower
                    );
                    const newSubjectSharedWithUids = subjectSharedWithUids.filter(uid => uid !== targetUid);

                    batch.update(subjectRef, {
                        sharedWith: newSubjectSharedWith,
                        sharedWithUids: newSubjectSharedWithUids,
                        isShared: newSubjectSharedWithUids.length > 0,
                        updatedAt: new Date()
                    });
                });
            } catch (e) {
                console.error("Error unsharing subjects in folder:", e);
            }

            await batch.commit();
            return true;

        } catch (error) {
            console.error("Error unsharing folder:", error);
            throw error;
        }
    };

    // --- MOVEMENT & HIERARCHY LOGIC ---

    /**
     * Move Subject Between Folders
     * Simplified approach: Just update the subject's folderId in Firestore
     * No more manipulating subjectIds arrays in folders
     */
    const moveSubjectBetweenFolders = async (subjectId, fromFolderId, toFolderId, options = {}) => {
        // Prevent useless move
        if (fromFolderId === toFolderId) return;

        const preserveSharing = options?.preserveSharing === true;

        let newFolderSharedUids = [];
        let oldFolderSharedUids = [];
        let targetFolderSharedWith = [];

        // Resolve folder sharing info (prefer local cache)
        const cachedTargetFolder = toFolderId ? folders.find(f => f.id === toFolderId) : null;
        const cachedSourceFolder = fromFolderId ? folders.find(f => f.id === fromFolderId) : null;

        if (cachedTargetFolder) {
            newFolderSharedUids = cachedTargetFolder.sharedWithUids || [];
            targetFolderSharedWith = cachedTargetFolder.sharedWith || [];
        }
        if (cachedSourceFolder) {
            oldFolderSharedUids = cachedSourceFolder.sharedWithUids || [];
        }

        // Fetch missing folder sharing info if not cached
        try {
            if (toFolderId && !cachedTargetFolder) {
                const targetFolderSnap = await getDoc(doc(db, "folders", toFolderId));
                if (targetFolderSnap.exists()) {
                    const targetData = targetFolderSnap.data();
                    newFolderSharedUids = targetData.sharedWithUids || [];
                    targetFolderSharedWith = targetData.sharedWith || [];
                }
            }

            if (fromFolderId && !cachedSourceFolder) {
                const sourceFolderSnap = await getDoc(doc(db, "folders", fromFolderId));
                if (sourceFolderSnap.exists()) {
                    oldFolderSharedUids = sourceFolderSnap.data().sharedWithUids || [];
                }
            }
        } catch (e) {
            console.error("Error fetching folder sharing info:", e);
        }

        // Update subject's folderId and sharing
        const subRef = doc(db, "subjects", subjectId);
        
        const subjectUpdate = {
            folderId: toFolderId || null,
            updatedAt: new Date(),
            isShared: newFolderSharedUids.length > 0
        };

        if (preserveSharing) {
            try {
                const currentSubSnap = await getDoc(subRef);
                if (currentSubSnap.exists()) {
                    const existingSharedWithUids = currentSubSnap.data().sharedWithUids || [];
                    subjectUpdate.isShared = existingSharedWithUids.length > 0;
                }
                await updateDoc(subRef, subjectUpdate);
            } catch (error) {
                console.error('Error moving subject while preserving sharing:', error);
                throw error;
            }
            return;
        }

        // If no sharing transition needed, simple update
        if (oldFolderSharedUids.length === 0 && newFolderSharedUids.length === 0) {
            try {
                await updateDoc(subRef, subjectUpdate);
            } catch (error) {
                console.error('Error updating subject:', error);
                throw error;
            }
            return;
        }

        // Sharing transition: update sharing arrays
        try {
            const currentSubSnap = await getDoc(subRef);
            if (currentSubSnap.exists()) {
                const currentSharedWithUids = currentSubSnap.data().sharedWithUids || [];
                const currentSharedWith = currentSubSnap.data().sharedWith || [];
                let newSharedWithUids = [...currentSharedWithUids];
                let newSharedWith = [...currentSharedWith];
                
                // Remove old folder's shared users
                newSharedWithUids = newSharedWithUids.filter(uid => !oldFolderSharedUids.includes(uid));
                newSharedWith = newSharedWith.filter(u => !oldFolderSharedUids.includes(u.uid));
                
                // Add new folder's shared users
                newFolderSharedUids.forEach(uid => {
                    if (!newSharedWithUids.includes(uid)) {
                        newSharedWithUids.push(uid);
                    }
                });
                targetFolderSharedWith.forEach(userObj => {
                    if (!newSharedWith.some(u => u.uid === userObj.uid)) {
                        newSharedWith.push(userObj);
                    }
                });
                
                subjectUpdate.sharedWith = newSharedWith;
                subjectUpdate.sharedWithUids = newSharedWithUids;
            }
        } catch (e) {
            console.error("Error computing subject sharing:", e);
        }

        try {
            await updateDoc(subRef, subjectUpdate);
        } catch (error) {
            console.error('Error updating subject with sharing:', error);
            throw error;
        }
    };

    // Alias for compatibility
    const moveSubjectToParent = (subjectId, currentFolderId, parentId) => 
        moveSubjectBetweenFolders(subjectId, currentFolderId, parentId);


    const moveFolderToParent = async (folderId, currentParentId, newParentId, options = {}) => {
        if (folderId === newParentId) return;
        if (isInvalidFolderMove(folderId, newParentId, folders)) {
            console.warn('🚫 BLOCKED: Cannot move a folder into its own subfolder.');
            return;
        }

        const batch = writeBatch(db);

        const folderRef = doc(db, "folders", folderId);
        let updatePayload = { parentId: newParentId || null, updatedAt: new Date() };

        if (newParentId) {
            const newParentRef = doc(db, "folders", newParentId);
            if (!options.preserveSharing) {
                try {
                    const parentSnap = await getDoc(newParentRef);
                    if (parentSnap.exists()) {
                        const parentData = parentSnap.data();
                        updatePayload.sharedWith = parentData.sharedWith || [];
                        updatePayload.sharedWithUids = parentData.sharedWithUids || [];
                        updatePayload.isShared = (parentData.sharedWithUids || []).length > 0;
                    }
                } catch (e) {
                    console.error("Error propagating sharing when moving folder:", e);
                }
            }
        }
        batch.update(folderRef, updatePayload);

        await batch.commit();
    };

    // Helper: DFS to check if 'targetId' is inside 'sourceId'

    // --- NEW: ROBUST MOVE FOLDER BETWEEN PARENTS (Added this) ---
    // This is the clean function you need for the list view drag & drop
    const moveFolderBetweenParents = async (folderId, fromParentId, toParentId) => {
        if (folderId === toParentId) return; // Cannot move into self
        if (fromParentId === toParentId) return; // No change

        // Check for Circular Dependency
        if (isInvalidFolderMove(folderId, toParentId, folders)) {
            alert("No puedes mover una carpeta dentro de sí misma.");
            return;
        }

        const batch = writeBatch(db);

        // 1. Update Folder Itself (change parentId only, no array operations needed)
        const folderRef = doc(db, "folders", folderId);
        batch.update(folderRef, { parentId: toParentId || null, updatedAt: new Date() });

        await batch.commit();
    };

    return { 
        folders, loading, addFolder, updateFolder, deleteFolder, deleteFolderOnly,
        shareFolder, unshareFolder, 
        moveSubjectToParent, moveFolderToParent, moveSubjectBetweenFolders,
        addSubjectToFolder,
        moveFolderBetweenParents // Export the new function
    };
};