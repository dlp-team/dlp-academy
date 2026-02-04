import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Moon, Sun, Monitor, Bell, Globe, 
  LayoutGrid, List, Check, Loader2, Save
} from 'lucide-react';

import { db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const Settings = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState('idle'); // idle, saving, success, error

  // Default structure ensures UI doesn't break if DB is empty
  const [settings, setSettings] = useState({
    theme: 'system', // 'light', 'dark', 'system'
    language: 'es',  // 'es', 'en'
    viewMode: 'grid', // 'grid', 'list'
    rememberSort: true,
    notifications: {
      email: true,
      push: false,
      newFeatures: true
    }
  });

  // 1. Fetch current settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.data();
          // Merge defaults with what's in Firestore (preserves new fields if added later)
          if (userData.settings) {
            setSettings(prev => ({
              ...prev,
              ...userData.settings,
              // specific merge for nested objects like notifications to avoid overwrites
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

  // 2. Generic Update Handler (Auto-save)
  const updateSetting = async (path, value) => {
    // A. Optimistic Update (Update UI immediately)
    setSettings(prev => {
      const deepClone = JSON.parse(JSON.stringify(prev));
      
      // Handle nested paths like "notifications.email"
      const keys = path.split('.');
      let current = deepClone;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return deepClone;
    });

    setSavingStatus('saving');

    // B. Send to Firestore
    try {
      const userRef = doc(db, "users", user.uid);
      // Construct the key for Firestore dot notation (e.g., "settings.theme" or "settings.notifications.email")
      const firestoreKey = `settings.${path}`;

      await updateDoc(userRef, {
        [firestoreKey]: value
      });

      // Show "Saved" briefly
      setSavingStatus('success');
      setTimeout(() => setSavingStatus('idle'), 2000);

    } catch (error) {
      console.error("Error saving setting:", error);
      setSavingStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
        </div>
        
        {/* Saving Indicator */}
        <div className="text-sm font-medium flex items-center gap-2">
            {savingStatus === 'saving' && <span className="text-indigo-600 flex items-center gap-1"><Loader2 size={14} className="animate-spin"/> Guardando...</span>}
            {savingStatus === 'success' && <span className="text-emerald-600 flex items-center gap-1"><Check size={14} /> Guardado</span>}
            {savingStatus === 'error' && <span className="text-red-600">Error al guardar</span>}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">

        {/* --- SECTION 1: APARIENCIA (THEME) --- */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Apariencia</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  {settings.theme === 'light' ? <Sun size={20} /> : settings.theme === 'dark' ? <Moon size={20} /> : <Monitor size={20} />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Tema</h3>
                  <p className="text-sm text-gray-500">Personaliza cómo se ve la aplicación.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {['light', 'dark', 'system'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateSetting('theme', mode)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                      settings.theme === mode 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {mode === 'light' && <Sun size={24} className="mb-2" />}
                    {mode === 'dark' && <Moon size={24} className="mb-2" />}
                    {mode === 'system' && <Monitor size={24} className="mb-2" />}
                    <span className="capitalize text-sm font-medium">
                      {mode === 'system' ? 'Sistema' : mode === 'light' ? 'Claro' : 'Oscuro'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: ORGANIZACIÓN (ASIGNATURAS) --- */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Organización</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
            
            {/* View Mode */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  {settings.viewMode === 'grid' ? <LayoutGrid size={20} /> : <List size={20} />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Vista por defecto</p>
                  <p className="text-sm text-gray-500">Cómo prefieres ver tus asignaturas</p>
                </div>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => updateSetting('viewMode', 'grid')}
                  className={`p-1.5 rounded-md transition-all ${settings.viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => updateSetting('viewMode', 'list')}
                  className={`p-1.5 rounded-md transition-all ${settings.viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Remember Sort Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Save size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Recordar organización</p>
                  <p className="text-sm text-gray-500">Mantener el orden y los filtros al volver</p>
                </div>
              </div>
              <Toggle 
                enabled={settings.rememberSort} 
                onChange={(val) => updateSetting('rememberSort', val)} 
              />
            </div>

          </div>
        </section>

        {/* --- SECTION 3: NOTIFICATIONS --- */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Notificaciones</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                  <Bell size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Notificaciones por Email</p>
                  <p className="text-sm text-gray-500">Resúmenes semanales y recordatorios</p>
                </div>
              </div>
              <Toggle 
                enabled={settings.notifications.email} 
                onChange={(val) => updateSetting('notifications.email', val)} 
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 pl-12">
                <div>
                  <p className="font-medium text-gray-900">Nuevas funcionalidades</p>
                  <p className="text-sm text-gray-500">Avisos sobre actualizaciones de la app</p>
                </div>
              </div>
              <Toggle 
                enabled={settings.notifications.newFeatures} 
                onChange={(val) => updateSetting('notifications.newFeatures', val)} 
              />
            </div>

          </div>
        </section>

        {/* --- SECTION 4: IDIOMA --- */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">General</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Globe size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Idioma</p>
                <p className="text-sm text-gray-500">Selecciona el idioma de la interfaz</p>
              </div>
            </div>
            <select 
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none"
            >
              <option value="es">Español 🇪🇸</option>
              <option value="en">English 🇬🇧</option>
              <option value="fr">Français 🇫🇷</option>
            </select>
          </div>
        </section>

      </main>
    </div>
  );
};

// Internal Toggle Component for style consistency
const Toggle = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
      enabled ? 'bg-indigo-600' : 'bg-gray-200'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export default Settings;