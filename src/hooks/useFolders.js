// src/hooks/useFolders.js
import { useState, useEffect } from 'react';
import { 
    collection, query, where, addDoc, updateDoc, deleteDoc, doc, getDoc, arrayUnion, arrayRemove, onSnapshot, writeBatch
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
                return data.sharedWith?.some(share => share.email === user.email || share.uid === user.uid);
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
        await updateDoc(doc(db, "folders", folderId), { subjectIds: arrayUnion(subjectId), updatedAt: new Date() });
    };

    // --- CORE ACTIONS ---
    const addFolder = async (payload) => {
        const parentId = payload.parentId || null;
        const docRef = await addDoc(collection(db, "folders"), {
            ...payload,
            ownerId: user.uid,
            ownerEmail: user.email,
            sharedWith: [],
            isShared: false,
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
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;
        const sharedWith = [
            ...(folder.sharedWith || []).filter(s => s.email !== email),
            { uid: null, email, role, sharedAt: new Date() }
        ];
        await updateDoc(doc(db, "folders", folderId), { sharedWith, isShared: true, updatedAt: new Date() });
    };

    const unshareFolder = async (folderId, email) => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;
        const sharedWith = (folder.sharedWith || []).filter(s => s.email !== email);
        await updateDoc(doc(db, "folders", folderId), { sharedWith, isShared: sharedWith.length > 0, updatedAt: new Date() });
    };

    // --- MOVEMENT & HIERARCHY LOGIC ---

    /**
     * Standard Move Subject (Up/Down/Sideways)
     * Includes "Doubling" fix: checks DB for true parent if unsure.
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

        // 2. Perform Move
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

        // Update Subject Self
        const subRef = doc(db, "subjects", subjectId);
        batch.update(subRef, { folderId: toFolderId || null, updatedAt: new Date() });

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
            batch.update(folderRef, { parentId: newParentId || null, updatedAt: new Date() });

            if (newParentId) {
                const newParentRef = doc(db, "folders", newParentId);
                batch.update(newParentRef, { folderIds: arrayUnion(folderId) });
            }

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