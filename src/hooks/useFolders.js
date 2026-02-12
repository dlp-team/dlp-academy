// src/hooks/useFolders.js
import { useState, useEffect } from 'react';
import { 
    collection, query, where, addDoc, updateDoc, deleteDoc, doc, 
    getDoc, arrayUnion, arrayRemove, onSnapshot, writeBatch, getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';

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

    const removeSubjectFromFolder = async (folderId, subjectId) => {
        if (!folderId) return;
        await updateDoc(doc(db, "folders", folderId), { subjectIds: arrayRemove(subjectId), updatedAt: new Date() });
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


    /**
     * Advanced Folder Move Logic
     * Handles normal moves AND "Swap/Extract" if moving Parent -> Child
     */
    const moveFolderToParent = async (folderId, currentParentId, newParentId) => {
        // Prevent move to self
        if (folderId === newParentId) return;

        // Check for Circular Dependency (Is newParentId currently a child of folderId?)
        const isCircular = checkIsDescendant(folderId, newParentId);

        if (isCircular) {
            // STRATEGY:
            // 1. Promote 'newParentId' (Child) to 'currentParentId' (Parent's level)
            // 2. Then move 'folderId' (Parent) into 'newParentId' (Child)
            
            const childFolderId = newParentId;
            const parentFolderId = folderId;
            const grandParentId = currentParentId; // Where the parent currently lives

            const batch = writeBatch(db);

            // Step 1: Move Child OUT of Parent, UP to Grandparent
            // Remove Child from Parent's folderIds
            const parentRef = doc(db, "folders", parentFolderId);
            batch.update(parentRef, { 
                folderIds: arrayRemove(childFolderId),
                updatedAt: new Date() 
            });

            // Add Child to Grandparent (if exists)
            if (grandParentId) {
                const grandParentRef = doc(db, "folders", grandParentId);
                batch.update(grandParentRef, { folderIds: arrayUnion(childFolderId) });
            }
            // Update Child's parent pointer
            const childRef = doc(db, "folders", childFolderId);
            batch.update(childRef, { 
                parentId: grandParentId || null,
                folderIds: arrayUnion(parentFolderId) // PREPARE Step 2: Add Parent to Child's list
            });

            // Step 2: Move Parent INTO Child
            // Remove Parent from Grandparent
            if (grandParentId) {
                const grandParentRef = doc(db, "folders", grandParentId);
                batch.update(grandParentRef, { folderIds: arrayRemove(parentFolderId) });
            }
            
            // Update Parent's pointer to Child
            batch.update(parentRef, { 
                parentId: childFolderId 
            });

            await batch.commit();

        } else {
            // Standard Move
            const batch = writeBatch(db);

            if (currentParentId) {
                const oldParentRef = doc(db, "folders", currentParentId);
                batch.update(oldParentRef, { folderIds: arrayRemove(folderId) });
            }

            const folderRef = doc(db, "folders", folderId);
            let updatePayload = { parentId: newParentId || null, updatedAt: new Date() };

            // If moving into a shared folder, propagate sharing
            if (newParentId) {
                const newParentRef = doc(db, "folders", newParentId);
                batch.update(newParentRef, { folderIds: arrayUnion(folderId) });
                // Fetch new parent folder's sharing info
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
            batch.update(folderRef, updatePayload);

            await batch.commit();
        }
    };

    // Helper: DFS to check if 'targetId' is inside 'sourceId'
    const checkIsDescendant = (sourceId, targetId) => {
        if (!targetId) return false; // Moving to root is never circular
        
        // Find the target folder object
        const targetFolder = folders.find(f => f.id === targetId);
        if (!targetFolder) return false;

        // Walk up the parents of the target
        let pointer = targetFolder;
        while (pointer && pointer.parentId) {
            if (pointer.parentId === sourceId) return true;
            pointer = folders.find(f => f.id === pointer.parentId);
        }
        return false;
    };

    // --- NEW: ROBUST MOVE FOLDER BETWEEN PARENTS (Added this) ---
    // This is the clean function you need for the list view drag & drop
    const moveFolderBetweenParents = async (folderId, fromParentId, toParentId) => {
        if (folderId === toParentId) return; // Cannot move into self
        if (fromParentId === toParentId) return; // No change

        // Check for Circular Dependency
        if (checkIsDescendant(folderId, toParentId)) {
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
        folders, loading, addFolder, updateFolder, deleteFolder, 
        shareFolder, unshareFolder, 
        moveSubjectToParent, moveFolderToParent, moveSubjectBetweenFolders,
        addSubjectToFolder,
        moveFolderBetweenParents // Export the new function
    };
};