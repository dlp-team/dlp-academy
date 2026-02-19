// src/hooks/useFolders.js
import { useState, useEffect } from 'react';
import { 
    collection, query, where, addDoc, updateDoc, deleteDoc, doc, 
    getDoc, arrayUnion, arrayRemove, onSnapshot, writeBatch, getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { isInvalidFolderMove } from '../utils/folderUtils';

export const useFolders = (user) => {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);

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
            ownedFolders = snapshot.docs.map(d => ({ 
                id: d.id, ...d.data(), parentId: d.data().parentId || null, isOwner: true 
            }));
            updateState();
        });

        const unsubscribeShared = onSnapshot(sharedQuery, (snapshot) => {
            sharedFolders = snapshot.docs.filter(d => {
                const data = d.data();
                const userEmail = user.email?.toLowerCase() || '';
                return data.sharedWith?.some(share => 
                    share.email?.toLowerCase() === userEmail || share.uid === user.uid
                );
            }).map(d => ({ 
                id: d.id, ...d.data(), parentId: d.data().parentId || null, isOwner: false 
            }));
            updateState();
        });

        return () => { unsubscribeOwned(); unsubscribeShared(); };
    }, [user]);

    // --- ATOMIC HELPERS ---
    const addFolderToParent = async (parentId, childId) => {
        if (!parentId) return;
        await updateDoc(doc(db, "folders", parentId), { folderIds: arrayUnion(childId), updatedAt: new Date() });
    };

    const removeFolderFromParent = async (parentId, childId) => {
        if (!parentId) return;
        await updateDoc(doc(db, "folders", parentId), { folderIds: arrayRemove(childId), updatedAt: new Date() });
    };


    const addSubjectToFolder = async (folderId, subjectId) => {
        if (!folderId) return;
        
        const batch = writeBatch(db);
        
        // 1. Add subject to folder
        const folderRef = doc(db, "folders", folderId);
        batch.update(folderRef, { 
            subjectIds: arrayUnion(subjectId), 
            updatedAt: new Date() 
        });
        
        // 2. Get folder's shared users and propagate to subject
        try {
            const folderSnap = await getDoc(folderRef);
            if (folderSnap.exists()) {
                const sharedWithUids = folderSnap.data().sharedWithUids || [];
                const sharedWith = folderSnap.data().sharedWith || [];
                // Get current subject's shared users and add folder's users
                const subjectRef = doc(db, "subjects", subjectId);
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
                // Update subject with propagated sharing
                batch.update(subjectRef, {
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
        const parentId = payload.parentId || null;
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
            ...payload,
            ownerId: user.uid,
            ownerEmail: user.email,
            sharedWith,
            sharedWithUids,
            isShared,
            parentId: parentId,
            folderIds: [],
            subjectIds: [],
            createdAt: new Date(),
            updatedAt: new Date()
        });
        if (parentId) await addFolderToParent(parentId, docRef.id);
        return { id: docRef.id, ...payload };
    };

    const updateFolder = async (id, payload) => {
        await updateDoc(doc(db, "folders", id), { ...payload, updatedAt: new Date() });
    };

    const deleteFolder = async (id) => {
        const folder = folders.find(f => f.id === id);
        if (!folder) return;
        if (folder.parentId) await removeFolderFromParent(folder.parentId, id);
        await deleteDoc(doc(db, "folders", id));
    };

    const deleteFolderOnly = async (id) => {
        const folder = folders.find(f => f.id === id);
        if (!folder) return;

        const batch = writeBatch(db);
        const parentId = folder.parentId || null;

        // 1. Move all child subjects to parent
        if (folder.subjectIds && folder.subjectIds.length > 0) {
            for (const subjectId of folder.subjectIds) {
                const subjectRef = doc(db, "subjects", subjectId);
                batch.update(subjectRef, { 
                    folderId: parentId,
                    updatedAt: new Date()
                });

                // If moving to a parent folder, add to its subjectIds
                if (parentId) {
                    const parentRef = doc(db, "folders", parentId);
                    batch.update(parentRef, {
                        subjectIds: arrayUnion(subjectId),
                        updatedAt: new Date()
                    });
                }
            }
        }

        // 2. Move all child folders to parent
        if (folder.folderIds && folder.folderIds.length > 0) {
            for (const childFolderId of folder.folderIds) {
                const childRef = doc(db, "folders", childFolderId);
                batch.update(childRef, {
                    parentId: parentId,
                    updatedAt: new Date()
                });

                // If moving to a parent folder, add to its folderIds
                if (parentId) {
                    const parentRef = doc(db, "folders", parentId);
                    batch.update(parentRef, {
                        folderIds: arrayUnion(childFolderId),
                        updatedAt: new Date()
                    });
                }
            }
        }

        // 3. Remove this folder from parent's folderIds
        if (parentId) {
            const parentRef = doc(db, "folders", parentId);
            batch.update(parentRef, {
                folderIds: arrayRemove(id),
                updatedAt: new Date()
            });
        }

        // 4. Commit all changes
        await batch.commit();

        // 5. Delete the folder itself
        await deleteDoc(doc(db, "folders", id));
    };

    const shareFolder = async (folderId, email, role = 'viewer') => {

        if (user && user.email && user.email.toLowerCase() === email.toLowerCase()) {
            alert("No puedes compartir una carpeta contigo mismo.");
            return;
        }

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
                console.error("Folder not found");
                return;
            }

            const folderData = folderSnap.data();
            
            const subjectsInFolder = folderData.subjectIds || [];
            
            // Check if already shared with this user
            const alreadyShared = folderData.sharedWith?.some(s => s.uid === targetUid);
            if (alreadyShared) {
                alert("Esta carpeta ya está compartida con este usuario.");
                return;
            }
            
           const batch = writeBatch(db);

            // A) Update the Folder
            batch.update(folderRef, {
                sharedWith: arrayUnion(shareData),      // For UI display
                sharedWithUids: arrayUnion(targetUid),  // For Security Rules & Perms
                isShared: true,
                updatedAt: new Date()
            });

            // B) Retroactively update ALL Subjects inside this folder
            subjectsInFolder.forEach(subjectId => {
                if (typeof subjectId === 'string') { // Ensure it's a valid ID
                    const subjectRef = doc(db, 'subjects', subjectId);
                    batch.update(subjectRef, {
                        isShared: true,
                        sharedWith: arrayUnion(shareData),
                        sharedWithUids: arrayUnion(targetUid)
                    });
                }
            });

            // 6. COMMIT CHANGES
            await batch.commit();

            return shareData;

        } catch (error) {
            console.error("Error sharing folder:", error);
            throw error; // Re-throw so UI can handle it
        }
    };

    const unshareFolder = async (folderId, email) => {
        try {
            // A. Find the user UID for this email (to remove from arrays)
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', email.toLowerCase()));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                console.error("User not found to unshare");
                return;
            }
            const targetUid = querySnapshot.docs[0].id;

            // B. Get Folder to find subjects
            const folderRef = doc(db, 'folders', folderId);
            const folderSnap = await getDoc(folderRef);
            const folderData = folderSnap.data();
            
            // Filter out the user from the sharedWith array object
            const currentSharedWith = folderData.sharedWith || [];
            const newSharedWith = currentSharedWith.filter(u => u.email?.toLowerCase() !== email.toLowerCase());

            const batch = writeBatch(db);

            // C. Update Folder
            batch.update(folderRef, {
                sharedWith: newSharedWith,        // Update the visual list
                sharedWithUids: arrayRemove(targetUid), // Remove permissions
                isShared: newSharedWith.length > 0, // Update isShared flag
                updatedAt: new Date()
            });

            // D. Remove from Subjects (Retroactive Unshare)
            const subjectIds = folderData.subjectIds || [];
            subjectIds.forEach(subjectId => {
                if (typeof subjectId === 'string') {
                    const subjectRef = doc(db, 'subjects', subjectId);
                    const userObjToRemove = (folderData.sharedWith || []).find(u => u.uid === targetUid);
                    const updateData = { sharedWithUids: arrayRemove(targetUid) };
                    if (userObjToRemove !== undefined) {
                        updateData.sharedWith = arrayRemove(userObjToRemove);
                    }
                    batch.update(subjectRef, updateData);
                }
            });

            await batch.commit();
            return true;

        } catch (error) {
            console.error("Error unsharing folder:", error);
            throw error;
        }
    };

    // --- MOVEMENT & HIERARCHY LOGIC ---

    /**
     * Standard Move Subject (Up/Down/Sideways)
     * Includes "Doubling" fix: checks DB for true parent if unsure.
     * Handles sharing propagation when moving between folders
     */
    const moveSubjectBetweenFolders = async (subjectId, fromFolderId, toFolderId) => {
        // 1. Identify Source
        let sourceId = fromFolderId;
        
        // Safety: If source not provided, fetch from DB to be 100% sure where it is
        if (sourceId === undefined) {
            try {
                const subSnap = await getDoc(doc(db, "subjects", subjectId));
                if (subSnap.exists()) {
                    sourceId = subSnap.data().folderId || null;
                }
            } catch (e) {
                console.error("Error finding subject source:", e);
                return;
            }
        }

        // Prevent useless move
        if (sourceId === toFolderId) return;

        // 2. Get folder sharing info before moving
        let newFolderSharedUids = [];
        let oldFolderSharedUids = [];
        
        try {
            if (toFolderId) {
                const targetFolderSnap = await getDoc(doc(db, "folders", toFolderId));
                if (targetFolderSnap.exists()) {
                    newFolderSharedUids = targetFolderSnap.data().sharedWithUids || [];
                }
            }
            
            if (sourceId) {
                const sourceFolderSnap = await getDoc(doc(db, "folders", sourceId));
                if (sourceFolderSnap.exists()) {
                    oldFolderSharedUids = sourceFolderSnap.data().sharedWithUids || [];
                }
            }
        } catch (e) {
            console.error("Error fetching folder sharing info:", e);
        }

        // 3. Perform Move
        const batch = writeBatch(db);

        // Remove from old
        if (sourceId) {
            const sourceRef = doc(db, "folders", sourceId);
            batch.update(sourceRef, { subjectIds: arrayRemove(subjectId), updatedAt: new Date() });
        }

        // Add to new
        if (toFolderId) {
            const targetRef = doc(db, "folders", toFolderId);
            batch.update(targetRef, { subjectIds: arrayUnion(subjectId), updatedAt: new Date() });
        }

        // Update Subject Self with new folder reference and sharing
        const subRef = doc(db, "subjects", subjectId);
        
        // Build the subject update payload
        const subjectUpdate = {
            folderId: toFolderId || null,
            updatedAt: new Date(),
            isShared: newFolderSharedUids.length > 0
        };
        try {
            const currentSubSnap = await getDoc(subRef);
            if (currentSubSnap.exists()) {
                const currentSharedWithUids = currentSubSnap.data().sharedWithUids || [];
                const currentSharedWith = currentSubSnap.data().sharedWith || [];
                let newSharedWithUids = [...currentSharedWithUids];
                let newSharedWith = [...currentSharedWith];
                // Remove old folder's shared users (UIDs)
                newSharedWithUids = newSharedWithUids.filter(uid => !oldFolderSharedUids.includes(uid));
                // Remove old folder's shared users (user data)
                newSharedWith = newSharedWith.filter(u => !oldFolderSharedUids.includes(u.uid));
                // Add new folder's shared users (UIDs)
                newFolderSharedUids.forEach(uid => {
                    if (!newSharedWithUids.includes(uid)) {
                        newSharedWithUids.push(uid);
                    }
                });
                // Add new folder's shared users (user data)
                if (toFolderId) {
                    const targetFolderSnap = await getDoc(doc(db, "folders", toFolderId));
                    if (targetFolderSnap.exists()) {
                        const targetSharedWith = targetFolderSnap.data().sharedWith || [];
                        targetSharedWith.forEach(userObj => {
                            if (!newSharedWith.some(u => u.uid === userObj.uid)) {
                                newSharedWith.push(userObj);
                            }
                        });
                    }
                }
                subjectUpdate.sharedWith = newSharedWith;
                subjectUpdate.sharedWithUids = newSharedWithUids;
            }
        } catch (e) {
            console.error("Error computing subject sharing:", e);
        }
        batch.update(subRef, subjectUpdate);

        await batch.commit();
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

        if (currentParentId) {
            const oldParentRef = doc(db, "folders", currentParentId);
            batch.update(oldParentRef, { folderIds: arrayRemove(folderId) });
        }

        const folderRef = doc(db, "folders", folderId);
        let updatePayload = { parentId: newParentId || null, updatedAt: new Date() };

        if (newParentId) {
            const newParentRef = doc(db, "folders", newParentId);
            batch.update(newParentRef, { folderIds: arrayUnion(folderId) });
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

        // 1. Remove from Old Parent
        if (fromParentId) {
            const oldParentRef = doc(db, "folders", fromParentId);
            batch.update(oldParentRef, { folderIds: arrayRemove(folderId), updatedAt: new Date() });
        }

        // 2. Add to New Parent
        if (toParentId) {
            const newParentRef = doc(db, "folders", toParentId);
            batch.update(newParentRef, { folderIds: arrayUnion(folderId), updatedAt: new Date() });
        }

        // 3. Update Folder Itself
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