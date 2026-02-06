// src/hooks/useProfile.js
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config'; 
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

export const useProfile = (user) => {
    const [userProfile, setUserProfile] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // 1. Get Profile
                const userDocRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userDocRef);
                if (userSnap.exists()) {
                    setUserProfile(userSnap.data());
                }

                // 2. Get Subjects
                const q = query(collection(db, "subjects"), where("uid", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const subjectsData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setSubjects(subjectsData);

            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const updateUserProfile = async (newData) => {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, newData);
        setUserProfile(prev => ({ ...prev, ...newData }));
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    return { userProfile, subjects, loading, updateUserProfile, logout };
};