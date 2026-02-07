// src/hooks/useUserPreferences.js
import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Hook to manage user preferences stored in Firestore
 * Each page has its own configuration map
 * Uses debouncing to prevent excessive Firestore writes
 */
export const useUserPreferences = (user, page = 'home') => {
    const [preferences, setPreferences] = useState(null);
    const [loading, setLoading] = useState(true);
    const debounceTimerRef = useRef(null);
    const pendingPreferencesRef = useRef(null);

    // Default preferences for each page
    const getDefaultPreferences = (pageName) => {
        const defaults = {
            home: {
                cardScale: 100, // M (Medium) by default
                viewMode: 'grid', // manual, uso, cursos, compartido
                layoutMode: 'grid', // grid, list, folders
                selectedTags: []
            },
            subject: {
                viewMode: 'topics', // topics, calendar, progress
                sortBy: 'order' // order, name, date
            },
            topic: {
                viewMode: 'cards', // cards, list
                showCompleted: true
            }
        };
        return defaults[pageName] || {};
    };

    // Load preferences from Firestore
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const loadPreferences = async () => {
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const pagePrefs = userData.preferences?.[page] || getDefaultPreferences(page);
                    setPreferences(pagePrefs);
                } else {
                    // User document doesn't exist, use defaults
                    setPreferences(getDefaultPreferences(page));
                }
            } catch (error) {
                console.error('Error loading user preferences:', error);
                setPreferences(getDefaultPreferences(page));
            } finally {
                setLoading(false);
            }
        };

        loadPreferences();
    }, [user, page]);

    // Save preferences to Firestore
    const savePreferences = async (newPreferences) => {
        if (!user) return;

        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            const currentData = userDoc.exists() ? userDoc.data() : {};
            const currentPreferences = currentData.preferences || {};

            // Merge new preferences with existing ones
            const updatedPreferences = {
                ...currentPreferences,
                [page]: {
                    ...currentPreferences[page],
                    ...newPreferences
                }
            };

            // Update Firestore
            await setDoc(userDocRef, {
                ...currentData,
                preferences: updatedPreferences,
                updatedAt: new Date()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving user preferences:', error);
        }
    };

    // Update a single preference field with debouncing
    const updatePreference = (key, value) => {
        // Update local state immediately (optimistic update)
        const newPreferences = {
            ...preferences,
            [key]: value
        };
        setPreferences(newPreferences);
        pendingPreferencesRef.current = newPreferences;

        // Clear existing debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new debounce timer - save to Firestore after 500ms of inactivity
        debounceTimerRef.current = setTimeout(async () => {
            if (pendingPreferencesRef.current) {
                await savePreferences(pendingPreferencesRef.current);
                pendingPreferencesRef.current = null;
            }
        }, 500);
    };

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return {
        preferences,
        loading,
        savePreferences,
        updatePreference
    };
};