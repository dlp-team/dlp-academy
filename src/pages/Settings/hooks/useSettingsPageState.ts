// src/pages/Settings/hooks/useSettingsPageState.js
import { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { applyThemeToDom } from '../../../utils/themeMode';

/**
 * Custom hook to manage settings page state, Firestore sync, and update logic.
 * @param {object} params
 * @param {object} params.user - The current user object (must have uid).
 * @param {object} params.db - The Firestore db instance.
 * @returns {object} State and handlers for the Settings page.
 */
export default function useSettingsPageState({ user, db }: any) {
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState('idle');
  const [listenerFeedback, setListenerFeedback] = useState('');

  const [settings, setSettings] = useState({
    theme: 'system',
    headerThemeSliderEnabled: false,
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
    const unsubscribe = onSnapshot(userRef, (docSnap: any) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const dataSettings = data.settings || {};
        const nextTheme = data.theme || dataSettings.theme || 'system';
        const nextHeaderThemeSliderEnabled = data.headerThemeSliderEnabled !== undefined
          ? data.headerThemeSliderEnabled
          : dataSettings.headerThemeSliderEnabled !== undefined
            ? dataSettings.headerThemeSliderEnabled
            : false;
        setSettings(prev => ({
          ...prev,
          theme: nextTheme,
          headerThemeSliderEnabled: nextHeaderThemeSliderEnabled,
          language: data.language || dataSettings.language || 'es',
          viewMode: data.viewMode || dataSettings.viewMode || 'grid',
          rememberSort: data.rememberSort !== undefined ? data.rememberSort : true,
          notifications: {
            ...prev.notifications,
            ...(data.notifications || {})
          }
        }));
        applyThemeToDom(nextTheme);
      }
      setListenerFeedback('');
      setLoading(false);
    }, (error: any) => {
      console.error("Error listening to settings:", error);
      setListenerFeedback('No se pudieron sincronizar tus ajustes en tiempo real. Se muestran valores locales.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, db]);

  // Update a setting (writes to Firestore)
  const updateSetting = async (key, value: any) => {
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
      applyThemeToDom(value, { animate: true, persist: true });
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
    listenerFeedback,
    settings,
    updateSetting,
  };
}