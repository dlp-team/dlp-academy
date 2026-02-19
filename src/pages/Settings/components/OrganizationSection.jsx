// src/pages/Settings/components/OrganizationSection.jsx
import React from 'react';
import { LayoutGrid, List, Save } from 'lucide-react';
import Toggle from '../../../components/ui/Toggle'; // Import the toggle we just made

const OrganizationSection = ({ viewMode, rememberSort, onUpdate }) => {
  return (
    <section>
      <h2 className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 px-2">Organización</h2>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 divide-y divide-gray-100 dark:divide-slate-800 transition-colors duration-300">
        
        {/* View Mode Selector */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              {viewMode === 'grid' ? <LayoutGrid size={20} /> : <List size={20} />}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Vista por defecto</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Cómo prefieres ver tus asignaturas</p>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => onUpdate('viewMode', 'grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid' 
                ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-400' 
                : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
              }`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => onUpdate('viewMode', 'list')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'list' 
                ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-400' 
                : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Remember Sort Toggle */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Save size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Recordar organización</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Mantener el orden y los filtros al volver</p>
            </div>
          </div>
          <Toggle 
            enabled={rememberSort} 
            onChange={(val) => onUpdate('rememberSort', val)} 
          />
        </div>

      </div>
    </section>
  );
};

export default OrganizationSection;