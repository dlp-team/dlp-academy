// src/pages/Settings/components/AppearanceSection.jsx
import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import Toggle from '../../../components/ui/Toggle';

const AppearanceSection = ({ theme, headerThemeSliderEnabled = true, onUpdate }: any) => {
  const modes = [
    { id: 'light', label: 'Claro', icon: Sun },
    { id: 'dark', label: 'Oscuro', icon: Moon },
    { id: 'system', label: 'Sistema', icon: Monitor },
  ];

  return (
    <section>
      <h2 className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 px-2">Apariencia</h2>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
             <Monitor size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Tema</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">Personaliza cómo se ve la aplicación.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {modes.map(({ id, label, icon }: any) => (
            <button
              key={id}
              onClick={() => onUpdate('theme', id)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                theme === id 
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                  : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 text-gray-600 dark:text-slate-400'
              }`}
            >
              {React.createElement(icon, { size: 24, className: 'mb-2' })}
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Mostrar selector de tema en el encabezado</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Activa o desactiva el control rápido de tema en la barra superior.
              </p>
            </div>
            <Toggle
              enabled={headerThemeSliderEnabled}
              onChange={(nextValue: any) => onUpdate('headerThemeSliderEnabled', nextValue)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppearanceSection;