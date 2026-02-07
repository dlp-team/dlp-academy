// src/components/home/SubjectListItem.jsx
import React, { useState } from 'react';
import { ChevronRight, Edit2, Trash2, MoreVertical } from 'lucide-react';
import SubjectIcon, { getIconColor } from '../modals/SubjectIcon';

const SubjectListItem = ({ subject, onSelect, onEdit, onDelete, compact = false, cardScale = 100 }) => {
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
            }`}
            style={{ padding: `${paddingPx}px` }}
            onClick={() => onSelect(subject.id)}
        >
            <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0`} style={{ width: `${iconContainerSize}px`, height: `${iconContainerSize}px` }}>
                    {isModern ? (
                        <div 
                            className={`${getIconColor(subject.color)} rounded-lg h-full flex items-center justify-center`}
                            style={{ 
                                width: `${iconContainerSize}px`, 
                                height: `${iconContainerSize}px` 
                            }}
                        >
                            {subject.icon ? (
                                <SubjectIcon 
                                    iconName={subject.icon} 
                                    style={{ 
                                        width: `${innerIconSize}px`, 
                                        height: `${innerIconSize}px` 
                                    }}
                                />
                            ) : (
                                <SubjectIcon 
                                    iconName={subject.icon} 
                                    className="text-white opacity-80" 
                                    style={{ 
                                        width: `${innerIconSize}px`, 
                                        height: `${innerIconSize}px` 
                                    }}
                                />
                            )}
                        </div>
                    ) : (
                        // <div className={`bg-gradient-to-br ${subject.color} rounded-lg h-full flex items-center justify-center`}>
                        <div className={`bg-transparent h-full flex items-center justify-center text-white opacity-90`}>
                            <SubjectIcon 
                                iconName={subject.icon} 
                                style={{ 
                                        width: `${innerIconSize}px`, 
                                        height: `${innerIconSize}px` 
                                }} 
                            />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 
                            //className={`font-bold text-gray-900 dark:text-white truncate ${compact ? 'text-base' : 'text-lg'}`}
                            className={`${ isModern ? `font-bold text-gray-900 dark:text-white truncate ${compact ? 'text-base' : 'text-lg'}` : `font-bold text-white dark:text-white truncate ${compact ? 'text-base' : 'text-lg'}`}`}

                        >
                            {subject.name}
                        </h3>
                        {!compact && subject.course && (
                            <span 
                                className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-full whitespace-nowrap">
                                {subject.course}
                            </span>
                        )}
                    </div>
                    
                    {!compact && subject.tags && subject.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {subject.tags.slice(0, 3).map(tag => (
                                <span 
                                    key={tag} 
                                    //className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50"
                                    className={`${ isModern ? `text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50` : `text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50`}`}
                                >
                                    #{tag}
                                </span>
                            ))}
                            {subject.tags.length > 3 && (
                                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                    +{subject.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Topic Count Badge */}
                        <div className={`flex items-center gap-2`}>
                            <span className={`${ isModern ? `text-gray-700 dark:text-gray-400 font-medium whitespace-nowrap` : `text-gray-100 dark:text-gray-900 font-medium whitespace-nowrap`}`} style={{ fontSize: `${10 + 14* scale*0.3}px` }}>
                                {topicCount} {topicCount === 1 ? 'tema' : 'temas'}
                            </span>
                            <ChevronRight size={12 + 14* scale*0.3} className={`${ isModern ? `text-gray-700 dark:text-gray-300 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors` : `text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors`}`} />
                        </div>

                {/* Menu */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className={`p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-gray-300 transition-colors ${
                            showMenu ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300' : 'opacity-0 group-hover:opacity-100'
                        }`}
                    >
                        <MoreVertical size={16} />
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