// src/hooks/useFolders.js
import { useState, useEffect } from 'react';
import { 
    collection, query, where, addDoc, updateDoc, deleteDoc, doc, getDoc, arrayUnion, arrayRemove, onSnapshot
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
            ownedFolders = snapshot.docs.map(d => {
                const data = d.data();
                return { 
                    id: d.id, 
                    ...data,
                    parentId: data.parentId || null,
                    isOwner: true 
                };
            });
            updateState();
        });

        const unsubscribeShared = onSnapshot(sharedQuery, (snapshot) => {
            sharedFolders = snapshot.docs
                .filter(d => {
                    const data = d.data();
                    return data.sharedWith?.some(share => 
                        share.email === user.email || share.uid === user.uid
                    );
                })
                .map(d => {
                    const data = d.data();
                    return { 
                        id: d.id, 
                        ...data,
                        parentId: data.parentId || null,
                        isOwner: false 
                    };
                });
            updateState();
        });

        return () => {
            unsubscribeOwned();
            unsubscribeShared();
        };

    }, [user]);

    // --- HELPERS ---
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

    // --- ACTIONS ---
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
        
        if (parentId) {
            await addFolderToParent(parentId, docRef.id);
        }
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
        const sharedWith = [
            ...(folders.find(f => f.id === folderId)?.sharedWith || []).filter(s => s.email !== email),
            { uid: null, email, role, sharedAt: new Date() }
        ];
        await updateDoc(doc(db, "folders", folderId), { sharedWith, isShared: true, updatedAt: new Date() });
    };

    const unshareFolder = async (folderId, email) => {
        const sharedWith = (folders.find(f => f.id === folderId)?.sharedWith || []).filter(s => s.email !== email);
        await updateDoc(doc(db, "folders", folderId), { sharedWith, isShared: sharedWith.length > 0, updatedAt: new Date() });
    };

    // --- MOVEMENT LOGIC ---
    
    // 1. Move Subject UP (Hierarchy)
    const moveSubjectToParent = async (subjectId, currentFolderId, parentId) => {
        if (currentFolderId) await removeSubjectFromFolder(currentFolderId, subjectId);
        if (parentId) await addSubjectToFolder(parentId, subjectId);
        
        try {
            await updateDoc(doc(db, "subjects", subjectId), { folderId: parentId || null, updatedAt: new Date() });
        } catch (e) { console.error("Error updating subject parent:", e); }
    };

    // 2. Move Folder UP (Hierarchy)
    const moveFolderToParent = async (folderId, currentParentId, newParentId) => {
        if (currentParentId) await removeFolderFromParent(currentParentId, folderId);
        await updateDoc(doc(db, "folders", folderId), { parentId: newParentId || null, updatedAt: new Date() });
        if (newParentId) await addFolderToParent(newParentId, folderId);
    };

    // 3. Move Subject BETWEEN folders (Drag Subject -> Folder)
    // ROBUST VERSION: Fetches subject to find source if not provided
    const moveSubjectBetweenFolders = async (subjectId, fromFolderId, toFolderId) => {
        let sourceId = fromFolderId;

        // Failsafe: If source isn't known, fetch it from the subject doc
        if (!sourceId) {
            try {
                const subSnap = await getDoc(doc(db, "subjects", subjectId));
                if (subSnap.exists()) {
                    sourceId = subSnap.data().folderId;
                }
            } catch (e) {
                console.error("Error fetching subject source folder:", e);
            }
        }

        // Prevent moving to same folder
        if (sourceId === toFolderId) return;

        // 1. Remove from Source
        if (sourceId) {
            await removeSubjectFromFolder(sourceId, subjectId);
        }

        // 2. Add to Target
        if (toFolderId) {
            await addSubjectToFolder(toFolderId, subjectId);
        }

        // 3. Update Subject Document
        try {
            await updateDoc(doc(db, "subjects", subjectId), { 
                folderId: toFolderId, 
                updatedAt: new Date() 
            });
        } catch (e) { 
            console.error("Error updating subject location:", e); 
        }
    };

    return { 
        folders, loading, addFolder, updateFolder, deleteFolder, 
        shareFolder, unshareFolder, 
        moveSubjectToParent, moveFolderToParent, moveSubjectBetweenFolders,
        addSubjectToFolder 
    };
};