// src/components/settings/NotificationSection.jsx
import React from 'react';
import { Bell } from 'lucide-react';
import Toggle from '../ui/Toggle';

const NotificationSection = ({ notifications, onUpdate }) => {
  return (
    <section>
      <h2 className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 px-2">Notificaciones</h2>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 divide-y divide-gray-100 dark:divide-slate-800 transition-colors duration-300">
        
        {/* Email Notifications */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
              <Bell size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Notificaciones por Email</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Resúmenes semanales y recordatorios</p>
            </div>
          </div>
          <Toggle 
            enabled={notifications.email} 
            onChange={(val) => onUpdate('notifications.email', val)} 
          />
        </div>

        {/* New Features Notifications */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 pl-12">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Nuevas funcionalidades</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Avisos sobre actualizaciones de la app</p>
            </div>
          </div>
          <Toggle 
            enabled={notifications.newFeatures} 
            onChange={(val) => onUpdate('notifications.newFeatures', val)} 
          />
        </div>

      </div>
    </section>
  );
};

export default NotificationSection;