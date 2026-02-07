// src/components/home/BreadcrumbNav.jsx
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

const BreadcrumbNav = ({ currentFolder, onNavigate, allFolders = [] }) => {
    if (!currentFolder) return null;

    // Build breadcrumb trail from current folder to root
    const buildBreadcrumbTrail = () => {
        const trail = [];
        let current = currentFolder;
        
        while (current) {
            trail.unshift(current);
            if (current.parentId) {
                current = allFolders.find(f => f.id === current.parentId);
            } else {
                current = null;
            }
        }
        
        return trail;
    };

    const breadcrumbTrail = buildBreadcrumbTrail();

    return (
        <div className="flex items-center gap-2 mb-6 p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors overflow-x-auto">
            {/* Home Button */}
            <button
                onClick={() => onNavigate(null)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer flex-shrink-0"
            >
                <Home size={16} />
                <span className="text-sm font-medium">Inicio</span>
            </button>
            
            {/* Breadcrumb Trail */}
            {breadcrumbTrail.map((folder, index) => {
                const isLast = index === breadcrumbTrail.length - 1;
                
                return (
                    <React.Fragment key={folder.id}>
                        <ChevronRight size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        
                        {isLast ? (
                            /* Current folder - highlighted */
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 flex-shrink-0">
                                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
                                    {folder.name}
                                </span>
                                {folder.subjectIds && (
                                    <span className="text-xs text-indigo-600 dark:text-indigo-400">
                                        ({folder.subjectIds.length})
                                    </span>
                                )}
                            </div>
                        ) : (
                            /* Parent folders - clickable */
                            <button
                                onClick={() => onNavigate(folder)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer flex-shrink-0"
                            >
                                <span className="text-sm font-medium whitespace-nowrap">{folder.name}</span>
                                {folder.subjectIds && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        ({folder.subjectIds.length})
                                    </span>
                                )}
                            </button>
                        )}
                    </React.Fragment>
                );
            })}

            {/* Owner Info */}
            {!currentFolder.isOwner && (
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 flex-shrink-0">
                    Compartida por: <strong>{currentFolder.ownerEmail}</strong>
                </span>
            )}
        </div>
    );
};

export default BreadcrumbNav;