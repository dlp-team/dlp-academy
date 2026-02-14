// src/components/home/ViewLayoutSelector.jsx
import React from 'react';
import { LayoutGrid, List, Folder } from 'lucide-react';

const ViewLayoutSelector = ({ layoutMode, setLayoutMode, viewMode }) => {
    // All modes can use folders layout
    const layouts = [
        { id: 'grid', icon: LayoutGrid, label: 'Cuadrícula' },
        { id: 'list', icon: List, label: 'Lista' }
    ];

    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-1 inline-flex shadow-sm transition-colors">
            {layouts.map(layout => (
                <button
                    key={layout.id}
                    onClick={() => setLayoutMode(layout.id)}
                    className={`p-2 rounded-lg transition-all ${
                        layoutMode === layout.id
                            ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer'
                    }`}
                    title={layout.label}
                >
                    <layout.icon size={18} />
                </button>
            ))}
        </div>
    );
};

export default ViewLayoutSelector;