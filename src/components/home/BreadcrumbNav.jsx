// src/components/home/BreadcrumbNav.jsx
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

const BreadcrumbNav = ({ currentFolder, onNavigate }) => {
    if (!currentFolder) return null;

    return (
        <div className="flex items-center gap-2 mb-6 p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors">
            <button
                onClick={() => onNavigate(null)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer"
            >
                <Home size={16} />
                <span className="text-sm font-medium">Inicio</span>
            </button>
            
            <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50">
                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                    {currentFolder.name}
                </span>
                {currentFolder.subjectIds && (
                    <span className="text-xs text-indigo-600 dark:text-indigo-400">
                        ({currentFolder.subjectIds.length})
                    </span>
                )}
            </div>

            {!currentFolder.isOwner && (
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    Compartida por: <strong>{currentFolder.ownerEmail}</strong>
                </span>
            )}
        </div>
    );
};

export default BreadcrumbNav;