// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// --- IMPORTS FOR THE NEW SECTIONS ---
// Make sure these paths match where you saved the files above!
import AppearanceSection from '../components/settings/AppearanceSection';
import OrganizationSection from '../components/settings/OrganizationSection';
import NotificationSection from '../components/settings/NotificationSection';
import GeneralSection from '../components/settings/GeneralSection';

const Settings = ({ user }) => {
  const navigate = useNavigate();
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

  // 1. Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.data();
          if (userData.settings) {
            setSettings(prev => ({
              ...prev,
              ...userData.settings,
              notifications: { ...prev.notifications, ...userData.settings.notifications }
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  // 2. Logic to change DOM classes
  const applyThemeToDom = (theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
    } else {
        root.classList.add(theme);
    }
  };

  // 3. Central Update Handler
  const updateSetting = async (path, value) => {
    // A. Optimistic Update
    setSettings(prev => {
      const deepClone = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = deepClone;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return deepClone;
    });

    // B. Apply Theme immediately
    if (path === 'theme') {
        applyThemeToDom(value);
    }

    setSavingStatus('saving');

    // C. Save to DB
    try {
      const userRef = doc(db, "users", user.uid);
      const firestoreKey = `settings.${path}`;

      await updateDoc(userRef, {
        [firestoreKey]: value
      });

      setSavingStatus('success');
      setTimeout(() => setSavingStatus('idle'), 2000);

    } catch (error) {
      console.error("Error saving setting:", error);
      setSavingStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-12 transition-colors duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-30 px-6 py-4 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Configuración</h1>
        </div>
        
        <div className="text-sm font-medium flex items-center gap-2">
            {savingStatus === 'saving' && <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><Loader2 size={14} className="animate-spin"/> Guardando...</span>}
            {savingStatus === 'success' && <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check size={14} /> Guardado</span>}
            {savingStatus === 'error' && <span className="text-red-600 dark:text-red-400">Error al guardar</span>}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        
        <AppearanceSection 
            theme={settings.theme} 
            onUpdate={updateSetting} 
        />

        <OrganizationSection 
            viewMode={settings.viewMode}
            rememberSort={settings.rememberSort}
            onUpdate={updateSetting}
        />

        <NotificationSection 
            notifications={settings.notifications}
            onUpdate={updateSetting}
        />

        <GeneralSection 
            language={settings.language}
            onUpdate={updateSetting}
        />

      </main>
    </div>
  );
};

export default Settings;