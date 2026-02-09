// src/components/home/SubjectListItem.jsx
import React, { useState } from 'react';
import { ChevronRight, Edit2, Trash2, MoreVertical } from 'lucide-react';
import SubjectIcon, { getIconColor } from '../modals/SubjectIcon';

const SubjectListItem = ({ 
    subject, 
    onSelect, 
    onEdit, 
    onDelete, 
    compact = false, 
    cardScale = 100,
    className = ""
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const topicCount = subject.topics ? subject.topics.length : 0;
    const isModern = subject.cardStyle === 'modern';
    const scale = (cardScale || 100) / 100;

    // Scaled sizes
    const paddingPx = compact ? 12 * scale : 16 * scale;
    const iconContainerSize = compact ? 40 * scale : 48 * scale;
    const innerIconSize = 42 * scale;

    return (
        <div 
            className={`group relative rounded-xl transition-all hover:shadow-md cursor-pointer ${
                isModern ? `${getIconColor(subject.color)} border border-gradient-to-br ${subject.color} hover:border-gradient-to-br ${subject.color} ` : ` bg-gradient-to-br ${subject.color} hover:border-indigo-300 `
            } ${className}`} // Apply external className
            style={{ padding: `${paddingPx}px` }}
            onClick={() => onSelect(subject.id)}
        >
            <div className="flex items-center gap-4">
                {/* ICON */}
                <div 
                    className={`${
                        isModern ? 'bg-white/90 dark:bg-slate-900/90' : 'bg-white/20'
                    } rounded-lg flex items-center justify-center shadow-sm backdrop-blur-sm`}
                    style={{ width: `${iconContainerSize}px`, height: `${iconContainerSize}px` }}
                >
                    {subject.icon ? (
                         <SubjectIcon 
                            iconName={subject.icon} 
                            className={isModern ? '' : 'text-white'}
                            style={{ width: `${32 * scale}px`, height: `${32 * scale}px` }} 
                        />
                    ) : (
                        <div className={`font-bold text-lg ${isModern ? 'text-gray-700 dark:text-gray-200' : 'text-white'}`}>
                            {subject.name.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0">
                    <h3 
                        className={`font-bold truncate ${isModern ? 'text-gray-800 dark:text-gray-100' : 'text-white'}`}
                        style={{ fontSize: `${18 * scale}px` }}
                    >
                        {subject.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span 
                            className={`text-xs px-2 py-0.5 rounded-full ${
                                isModern 
                                    ? 'bg-white/50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-400' 
                                    : 'bg-white/20 text-white/90'
                            }`}
                        >
                            {topicCount} temas
                        </span>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 relative">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                        className={`p-2 rounded-full transition-colors ${
                            isModern 
                                ? 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400' 
                                : 'hover:bg-white/20 text-white'
                        }`}
                    >
                        <MoreVertical size={20 * scale} />
                    </button>

                    {showMenu && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 p-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                                <button 
                                    onClick={() => { onEdit(subject); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                                >
                                    <Edit2 size={14} /> Editar
                                </button>
                                <button 
                                    onClick={() => { onDelete(subject); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 p-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                                >
                                    <Trash2 size={14} /> Eliminar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubjectListItem;