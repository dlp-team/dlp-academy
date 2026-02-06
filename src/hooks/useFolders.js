// src/hooks/useFolders.js
import { useState, useEffect, useCallback } from 'react';
import { 
    collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, or 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useFolders = (user) => {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFolders = useCallback(async () => {
        if (!user) return;
        try {
            // Get folders owned by user
            const ownedQuery = query(
                collection(db, "folders"),
                where("ownerId", "==", user.uid)
            );
            const ownedSnapshot = await getDocs(ownedQuery);
            
            // Get folders shared with user
            const sharedQuery = query(
                collection(db, "folders"),
                where("isShared", "==", true)
            );
            const sharedSnapshot = await getDocs(sharedQuery);
            
            const ownedFolders = ownedSnapshot.docs.map(d => ({ 
                id: d.id, 
                ...d.data(),
                isOwner: true 
            }));
            
            const sharedFolders = sharedSnapshot.docs
                .filter(d => {
                    const data = d.data();
                    return data.sharedWith?.some(share => 
                        share.email === user.email || share.uid === user.uid
                    );
                })
                .map(d => ({ 
                    id: d.id, 
                    ...d.data(),
                    isOwner: false 
                }));
            
            const allFolders = [...ownedFolders, ...sharedFolders];
            setFolders(allFolders);
        } catch (error) {
            console.error("Error fetching folders:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchFolders();
    }, [fetchFolders]);

    const addFolder = async (payload) => {
        const docRef = await addDoc(collection(db, "folders"), {
            ...payload,
            ownerId: user.uid,
            ownerEmail: user.email,
            sharedWith: [],
            isShared: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const newFolder = { 
            id: docRef.id, 
            ...payload, 
            ownerId: user.uid,
            ownerEmail: user.email,
            isOwner: true 
        };
        setFolders(prev => [...prev, newFolder]);
        return newFolder;
    };

    const updateFolder = async (id, payload) => {
        await updateDoc(doc(db, "folders", id), {
            ...payload,
            updatedAt: new Date()
        });
        setFolders(prev => prev.map(f => 
            f.id === id ? { ...f, ...payload } : f
        ));
    };

    const deleteFolder = async (id) => {
        await deleteDoc(doc(db, "folders", id));
        setFolders(prev => prev.filter(f => f.id !== id));
    };

    const shareFolder = async (folderId, email, role = 'viewer') => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;

        const sharedWith = [
            ...(folder.sharedWith || []).filter(s => s.email !== email),
            { uid: null, email, role, sharedAt: new Date() }
        ];

        await updateDoc(doc(db, "folders", folderId), {
            sharedWith,
            isShared: true,
            updatedAt: new Date()
        });

        setFolders(prev => prev.map(f =>
            f.id === folderId ? { ...f, sharedWith, isShared: true } : f
        ));
    };

    const unshareFolder = async (folderId, email) => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;

        const sharedWith = (folder.sharedWith || []).filter(s => s.email !== email);

        await updateDoc(doc(db, "folders", folderId), {
            sharedWith,
            isShared: sharedWith.length > 0,
            updatedAt: new Date()
        });

        setFolders(prev => prev.map(f =>
            f.id === folderId ? { ...f, sharedWith, isShared: sharedWith.length > 0 } : f
        ));
    };

    const addSubjectToFolder = async (folderId, subjectId) => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;

        const subjectIds = [...new Set([...(folder.subjectIds || []), subjectId])];

        await updateDoc(doc(db, "folders", folderId), {
            subjectIds,
            updatedAt: new Date()
        });

        setFolders(prev => prev.map(f =>
            f.id === folderId ? { ...f, subjectIds } : f
        ));
    };

    const removeSubjectFromFolder = async (folderId, subjectId) => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;

        const subjectIds = (folder.subjectIds || []).filter(id => id !== subjectId);

        await updateDoc(doc(db, "folders", folderId), {
            subjectIds,
            updatedAt: new Date()
        });

        setFolders(prev => prev.map(f =>
            f.id === folderId ? { ...f, subjectIds } : f
        ));
    };

    return { 
        folders, 
        loading, 
        addFolder, 
        updateFolder, 
        deleteFolder, 
        shareFolder,
        unshareFolder,
        addSubjectToFolder,
        removeSubjectFromFolder
    };
};