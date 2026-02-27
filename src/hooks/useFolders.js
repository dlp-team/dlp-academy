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
            throw new Error("No puedes compartir una carpeta contigo mismo.");
        }

        try {
            const emailLower = email.toLowerCase();
            const normalizedRole = role === 'editor' ? 'editor' : 'viewer';
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
                    throw new Error("No puedes compartir entre instituciones diferentes.");
                }
            } else {
                debugShare('validation_fail_user_not_found', { folderId, email: emailLower });
                console.warn(`User with email ${emailLower} not found.`);
                throw new Error(`No se encontró usuario con el correo ${email}. El usuario debe crear una cuenta primero.`);
            }

            // 2. Now you have the verified UID securely
            const shareData = {
                email: emailLower,
                uid: targetUid,
                role: normalizedRole,
                canEdit: normalizedRole === 'editor',
                shareOrigin: 'direct',
                sharedAt: new Date()
            };

            const inheritedSubjectShareData = {
                ...shareData,
                shareOrigin: 'inherited-folder',
                inheritedFromFolderId: folderId
            };

            // 3. Update the folder document
            const folderRef = doc(db, 'folders', folderId);
            const folderSnap = await getDoc(folderRef);

            if (!folderSnap.exists()) {
                debugShare('validation_fail_folder_not_found', { folderId, targetUid });
                throw new Error("No se encontró la carpeta.");
            }

            const folderData = folderSnap.data();
            if (folderData?.ownerId && folderData.ownerId === targetUid) {
                throw new Error("No puedes compartir con el propietario.");
            }
            const originalFolderSharedWith = Array.isArray(folderData.sharedWith) ? folderData.sharedWith : [];
            const originalFolderSharedWithUids = Array.isArray(folderData.sharedWithUids) ? folderData.sharedWithUids : [];
            const existingShare = originalFolderSharedWith.find(s => s.uid === targetUid);
            const foldersRollbackState = [];
            const subjectsRollbackState = [];
            let sourceUpdated = false;
            let stagedMutations = 0;
            
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

            const subtreeFolderIds = new Set([folderId]);
            const queue = [folderId];
            while (queue.length > 0) {
                const currentId = queue.shift();
                const childFoldersSnap = await getDocs(
                    query(collection(db, 'folders'), where('parentId', '==', currentId))
                );
                childFoldersSnap.docs.forEach(childDoc => {
                    if (!subtreeFolderIds.has(childDoc.id)) {
                        subtreeFolderIds.add(childDoc.id);
                        queue.push(childDoc.id);
                    }
                });
            }

            for (const targetFolderId of subtreeFolderIds) {
                const targetFolderRef = doc(db, 'folders', targetFolderId);
                const targetFolderSnap = targetFolderId === folderId ? folderSnap : await getDoc(targetFolderRef);
                if (!targetFolderSnap.exists()) continue;

                const targetFolderData = targetFolderSnap.data() || {};
                const targetSharedWith = Array.isArray(targetFolderData.sharedWith) ? targetFolderData.sharedWith : [];
                const targetSharedWithUids = Array.isArray(targetFolderData.sharedWithUids) ? targetFolderData.sharedWithUids : [];
                const targetExistingShare = targetSharedWith.find(entry => entry.uid === targetUid);
                const targetAlreadyShared = targetSharedWithUids.includes(targetUid) || Boolean(targetExistingShare);

                foldersRollbackState.push({
                    id: targetFolderId,
                    sharedWith: targetSharedWith,
                    sharedWithUids: targetSharedWithUids
                });

                const inheritedFolderShareData = {
                    ...shareData,
                    shareOrigin: targetFolderId === folderId ? 'direct' : 'inherited-folder',
                    inheritedFromFolderId: folderId
                };

                let nextFolderSharedWith = targetSharedWith;
                let nextFolderSharedWithUids = targetSharedWithUids;
                let shouldUpdateFolder = false;

                if (!targetAlreadyShared) {
                    nextFolderSharedWith = [...targetSharedWith, inheritedFolderShareData];
                    nextFolderSharedWithUids = [...targetSharedWithUids, targetUid];
                    shouldUpdateFolder = true;
                } else if ((targetExistingShare?.role || 'viewer') !== normalizedRole) {
                    nextFolderSharedWith = targetSharedWith.map(entry =>
                        entry.uid === targetUid
                            ? {
                                ...entry,
                                role: normalizedRole,
                                canEdit: normalizedRole === 'editor'
                            }
                            : entry
                    );
                    shouldUpdateFolder = true;
                } else if (targetFolderData?.isShared !== true) {
                    shouldUpdateFolder = true;
                }

                if (shouldUpdateFolder) {
                    batch.update(targetFolderRef, {
                        sharedWith: nextFolderSharedWith,
                        sharedWithUids: nextFolderSharedWithUids,
                        isShared: nextFolderSharedWithUids.length > 0,
                        updatedAt: new Date()
                    });
                    stagedMutations += 1;
                }

                const subjectsSnap = await getDocs(
                    query(collection(db, 'subjects'), where('folderId', '==', targetFolderId))
                );

                subjectsSnap.forEach(docSnap => {
                    const subjectData = docSnap.data() || {};
                    const subjectSharedWith = Array.isArray(subjectData.sharedWith) ? subjectData.sharedWith : [];
                    const subjectSharedWithUids = Array.isArray(subjectData.sharedWithUids) ? subjectData.sharedWithUids : [];
                    const subjectExistingShare = subjectSharedWith.find(entry => entry.uid === targetUid);
                    const subjectAlreadyShared = subjectSharedWithUids.includes(targetUid) || Boolean(subjectExistingShare);

                    subjectsRollbackState.push({
                        id: docSnap.id,
                        sharedWith: subjectSharedWith,
                        sharedWithUids: subjectSharedWithUids
                    });

                    let nextSubjectSharedWith = subjectSharedWith;
                    let nextSubjectSharedWithUids = subjectSharedWithUids;
                    let shouldUpdateSubject = false;

                    if (!subjectAlreadyShared) {
                        nextSubjectSharedWith = [...subjectSharedWith, inheritedSubjectShareData];
                        nextSubjectSharedWithUids = [...subjectSharedWithUids, targetUid];
                        shouldUpdateSubject = true;
                    } else if ((subjectExistingShare?.role || 'viewer') !== normalizedRole) {
                        nextSubjectSharedWith = subjectSharedWith.map(entry =>
                            entry.uid === targetUid
                                ? {
                                    ...entry,
                                    role: normalizedRole,
                                    canEdit: normalizedRole === 'editor'
                                }
                                : entry
                        );
                        shouldUpdateSubject = true;
                    } else if (subjectData?.isShared !== true) {
                        shouldUpdateSubject = true;
                    }

                    if (shouldUpdateSubject) {
                        const subjectRef = doc(db, 'subjects', docSnap.id);
                        batch.update(subjectRef, {
                            isShared: nextSubjectSharedWithUids.length > 0,
                            sharedWith: nextSubjectSharedWith,
                            sharedWithUids: nextSubjectSharedWithUids,
                            updatedAt: new Date()
                        });
                        stagedMutations += 1;
                    }
                });
            }

            // 6. COMMIT CHANGES
            debugShare('source_update_commit_attempt', { folderId, targetUid, alreadyShared });
            await batch.commit();
            debugShare('source_update_commit_success', { folderId, targetUid, alreadyShared });
            if (stagedMutations > 0) {
                sourceUpdated = true;
            }

            // 7. Ensure folder shortcut exists for recipient (deterministic upsert)
            try {
                const shortcutId = `${targetUid}_${folderId}_folder`;
                const shortcutRef = doc(db, 'shortcuts', shortcutId);
                const shortcutSnap = await getDoc(shortcutRef);
                const existingShortcut = shortcutSnap.exists() ? shortcutSnap.data() || {} : {};
                const hasOwnShortcutField = (field) => Object.prototype.hasOwnProperty.call(existingShortcut, field);
                const shortcutPayload = {
                    ownerId: targetUid,
                    parentId: hasOwnShortcutField('parentId') ? existingShortcut.parentId : null,
                    targetId: folderId,
                    targetType: 'folder',
                    institutionId: currentInstitutionId,
                    shortcutName: hasOwnShortcutField('shortcutName') ? existingShortcut.shortcutName : (folderData.name || null),
                    shortcutTags: hasOwnShortcutField('shortcutTags')
                        ? (Array.isArray(existingShortcut.shortcutTags) ? existingShortcut.shortcutTags : [])
                        : (Array.isArray(folderData.tags) ? folderData.tags : []),
                    shortcutColor: hasOwnShortcutField('shortcutColor') ? existingShortcut.shortcutColor : (folderData.color || null),
                    shortcutIcon: hasOwnShortcutField('shortcutIcon') ? existingShortcut.shortcutIcon : (folderData.icon || null),
                    shortcutCardStyle: hasOwnShortcutField('shortcutCardStyle') ? existingShortcut.shortcutCardStyle : (folderData.cardStyle || null),
                    shortcutModernFillColor: hasOwnShortcutField('shortcutModernFillColor')
                        ? existingShortcut.shortcutModernFillColor
                        : (folderData.modernFillColor || null),
                    createdAt: hasOwnShortcutField('createdAt') ? existingShortcut.createdAt : new Date(),
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
                        foldersRollbackState.forEach(folderState => {
                            rollbackBatch.update(doc(db, 'folders', folderState.id), {
                                sharedWith: folderState.sharedWith,
                                sharedWithUids: folderState.sharedWithUids,
                                isShared: folderState.sharedWithUids.length > 0,
                                updatedAt: new Date()
                            });
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
            return {
                ...shareData,
                alreadyShared,
                roleUpdated: alreadyShared && (existingShare?.role || 'viewer') !== normalizedRole
            };

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
            if (folderData?.ownerId && folderData.ownerId === targetUid) {
                throw new Error('No se puede dejar de compartir con el propietario.');
            }

            const cleanupFailures = [];
            const isMissingShortcutFailure = (scope, error) => {
                const scopeString = String(scope || '').toLowerCase();
                const message = String(error?.message || '').toLowerCase();
                const code = String(error?.code || '').toLowerCase();
                const isShortcutScope = scopeString.includes('shortcut');
                const isNotFound =
                    code === 'not-found' ||
                    code === 'firestore/not-found' ||
                    message.includes('not found') ||
                    message.includes('no document');
                return isShortcutScope && isNotFound;
            };

            const addFailure = (scope, id, error) => {
                cleanupFailures.push({
                    scope,
                    id,
                    code: error?.code || null,
                    message: error?.message || String(error),
                    ignorable: isMissingShortcutFailure(scope, error)
                });
            };

            const stripShareForUser = (sharedWith = [], sharedWithUids = []) => {
                const cleanSharedWith = (Array.isArray(sharedWith) ? sharedWith : []).filter(entry =>
                    entry?.uid !== targetUid && entry?.email?.toLowerCase() !== emailLower
                );
                const cleanSharedWithUids = (Array.isArray(sharedWithUids) ? sharedWithUids : []).filter(uid => uid !== targetUid);
                return {
                    sharedWith: cleanSharedWith,
                    sharedWithUids: cleanSharedWithUids,
                    isShared: cleanSharedWithUids.length > 0
                };
            };

            const stripSubjectShareForUser = (sharedWith = [], sharedWithUids = []) => {
                return stripShareForUser(sharedWith, sharedWithUids);
            };

            const updateFolderUnshare = async (targetFolderId) => {
                const targetFolderRef = doc(db, 'folders', targetFolderId);
                const targetFolderSnap = await getDoc(targetFolderRef);
                if (!targetFolderSnap.exists()) return;
                const targetFolderData = targetFolderSnap.data() || {};
                const strippedFolder = stripShareForUser(targetFolderData.sharedWith, targetFolderData.sharedWithUids);

                await updateDoc(targetFolderRef, {
                    sharedWith: strippedFolder.sharedWith,
                    sharedWithUids: strippedFolder.sharedWithUids,
                    isShared: strippedFolder.isShared,
                    updatedAt: new Date()
                });
            };

            const updateSubjectsInFolderUnshare = async (targetFolderId) => {
                const subjectsSnap = await getDocs(
                    query(collection(db, 'subjects'), where('folderId', '==', targetFolderId))
                );

                for (const subjectDoc of subjectsSnap.docs) {
                    const subjectData = subjectDoc.data() || {};
                    const strippedSubject = stripSubjectShareForUser(subjectData.sharedWith, subjectData.sharedWithUids);

                    try {
                        await updateDoc(doc(db, 'subjects', subjectDoc.id), {
                            sharedWith: strippedSubject.sharedWith,
                            sharedWithUids: strippedSubject.sharedWithUids,
                            isShared: strippedSubject.isShared,
                            updatedAt: new Date()
                        });
                    } catch (subjectUpdateError) {
                        addFailure('subject-update', subjectDoc.id, subjectUpdateError);
                    }
                }
            };

            try {
                await updateFolderUnshare(folderId);
            } catch (rootUnshareError) {
                throw rootUnshareError;
            }

            try {
                await updateSubjectsInFolderUnshare(folderId);
            } catch (rootSubjectsError) {
                addFailure('root-folder-subject-query', folderId, rootSubjectsError);
            }

            const queue = [folderId];
            const visited = new Set([folderId]);
            const subtreeFolderIds = new Set([folderId]);
            const subtreeSubjectIds = new Set();

            const collectSubjectsInFolder = async (targetFolderId) => {
                try {
                    const subjectsSnap = await getDocs(
                        query(collection(db, 'subjects'), where('folderId', '==', targetFolderId))
                    );
                    subjectsSnap.docs.forEach(subjectDoc => subtreeSubjectIds.add(subjectDoc.id));
                } catch (collectSubjectsError) {
                    addFailure('subject-collect', targetFolderId, collectSubjectsError);
                }
            };

            await collectSubjectsInFolder(folderId);

            while (queue.length > 0) {
                const parentFolderId = queue.shift();
                let childFolders = [];
                try {
                    const childFoldersSnap = await getDocs(
                        query(collection(db, 'folders'), where('parentId', '==', parentFolderId))
                    );
                    childFolders = childFoldersSnap.docs.map(childDoc => childDoc.id);
                } catch (childFolderQueryError) {
                    addFailure('child-folder-query', parentFolderId, childFolderQueryError);
                    continue;
                }

                for (const childFolderId of childFolders) {
                    if (visited.has(childFolderId)) continue;
                    visited.add(childFolderId);
                    queue.push(childFolderId);
                    subtreeFolderIds.add(childFolderId);

                    try {
                        await updateFolderUnshare(childFolderId);
                    } catch (childFolderUpdateError) {
                        addFailure('child-folder-update', childFolderId, childFolderUpdateError);
                    }

                    try {
                        await updateSubjectsInFolderUnshare(childFolderId);
                    } catch (childFolderSubjectsError) {
                        addFailure('child-folder-subjects', childFolderId, childFolderSubjectsError);
                    }

                    await collectSubjectsInFolder(childFolderId);
                }
            }


            // Preserve folder shortcuts as orphan/ghost entries after unshare (Google Drive-like behavior).

            for (const targetSubjectId of subtreeSubjectIds) {
                const shortcutId = `${targetUid}_${targetSubjectId}_subject`;
                const shortcutRef = doc(db, 'shortcuts', shortcutId);
                try {
                    const shortcutSnap = await getDoc(shortcutRef);
                    if (!shortcutSnap.exists()) {
                        continue;
                    }
                    await deleteDoc(shortcutRef);
                } catch (shortcutSubjectDeleteError) {
                    addFailure('subject-shortcut-delete', targetSubjectId, shortcutSubjectDeleteError);
                }
            }

            return { success: true, cleanupFailures };

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