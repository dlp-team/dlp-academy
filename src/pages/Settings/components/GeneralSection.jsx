// src/pages/Settings/components/GeneralSection.jsx
import React from 'react';
import { Globe } from 'lucide-react';

const GeneralSection = ({ language, onUpdate }) => {
  return (
    <section>
      <h2 className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 px-2">General</h2>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-4 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Globe size={20} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Idioma</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">Selecciona el idioma de la interfaz</p>
          </div>
        </div>
        <select 
          value={language}
          onChange={(e) => onUpdate('language', e.target.value)}
          className="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 block p-2.5 outline-none"
        >
          <option value="es">Español 🇪🇸</option>
          <option value="en">English 🇬🇧</option>
          <option value="fr">Français 🇫🇷</option>
        </select>
      </div>
    </section>
  );
};

export default GeneralSection;