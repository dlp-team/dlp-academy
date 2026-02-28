// src/pages/Settings/hooks/useSettingsPageState.js
import { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

const applyThemeToDom = (theme) => {
  if (typeof window === 'undefined') return;

  const root = window.document.documentElement;
  const resolvedTheme = theme === 'system'
    ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  localStorage.setItem('theme', theme);
};

/**
 * Custom hook to manage settings page state, Firestore sync, and update logic.
 * @param {object} params
 * @param {object} params.user - The current user object (must have uid).
 * @param {object} params.db - The Firestore db instance.
 * @returns {object} State and handlers for the Settings page.
 */
export default function useSettingsPageState({ user, db }) {
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState('idle');

  const [settings, setSettings] = useState({
    theme: 'system',
    language: 'es',
    viewMode: 'grid',
    rememberSort: true,
    notifications: {
      email: true,
      push: false,
      newFeatures: true
    }
  });

  // Listen to Firestore in real-time for settings changes
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const nextTheme = data.theme || 'system';
        setSettings(prev => ({
          ...prev,
          theme: nextTheme,
          language: data.language || 'es',
          viewMode: data.viewMode || 'grid',
          rememberSort: data.rememberSort !== undefined ? data.rememberSort : true,
          notifications: {
            ...prev.notifications,
            ...(data.notifications || {})
          }
        }));
        applyThemeToDom(nextTheme);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to settings:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, db]);

  // Update a setting (writes to Firestore)
  const updateSetting = async (key, value) => {
    // Optimistic UI update
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setSettings(prev => ({ ...prev, [key]: value }));
    }

    if (key === 'theme') {
      applyThemeToDom(value);
    }

    setSavingStatus('saving');
    try {
      const userRef = doc(db, "users", user.uid);
      const updateData = {};
      updateData[key] = value;
      await updateDoc(userRef, updateData);
      setSavingStatus('success');
      setTimeout(() => setSavingStatus('idle'), 2000);
    } catch (error) {
      console.error("Error updating setting:", error);
      setSavingStatus('error');
    }
  };

  return {
    loading,
    savingStatus,
    settings,
    updateSetting,
  };
}