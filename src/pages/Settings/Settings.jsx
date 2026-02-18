// src/pages/Settings.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { db } from '../../firebase/config';
import AppearanceSection from './components/AppearanceSection';
import OrganizationSection from './components/OrganizationSection';
import NotificationSection from './components/NotificationSection';
import GeneralSection from './components/GeneralSection';
import useSettingsPageState from './hooks/useSettingsPageState';

const Settings = ({ user }) => {
  const navigate = useNavigate();
  // Use the custom hook for all state, loading, and update logic
  const {
    loading,
    savingStatus,
    settings,
    updateSetting,
  } = useSettingsPageState({ user, db });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 transition-colors"
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
      {/* Main Content */}
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