// src/components/home/FolderCardBody.jsx
import React from 'react';
import { Folder, MoreVertical, Edit2, Trash2, Share2, Users } from 'lucide-react';
import SubjectIcon, { getIconColor } from '../modals/SubjectIcon';

const FolderCardBody = ({
    folder,
    isModern,
    gradientClass,
    fillColor,
    scaleMultiplier,
    subjectCount,
    folderCount,
    totalCount,    
    activeMenu,
    onToggleMenu,
    onEdit,
    onDelete,
    onShare
}) => {
    // Calculate dynamic slide distance based on scale
    const shiftX = 48 * scaleMultiplier;

    return (
        <div className={`relative z-10 h-full w-full rounded-b-2xl rounded-tr-2xl rounded-tl-none shadow-lg overflow-hidden ${
            isModern 
                ? `bg-gradient-to-br ${gradientClass} p-[3px]` 
                : ''
        }`}>
             
            {/* INNER CONTENT CONTAINER */}
            <div className={`h-full w-full rounded-xl rounded-tl-none overflow-hidden relative flex flex-col justify-between ${
                isModern 
                    ? 'bg-white dark:bg-slate-950' 
                    : ''
            }`}>
                
                {/* --- FRONT VISUALS --- */}
                
                {/* Classic Background: Full Gradient */}
                {!isModern && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-100`}></div>
                )}

                {/* Modern Background: Optional Fill */}
                {isModern && fillColor && (
                    <div className={`absolute inset-0 ${fillColor}`}></div>
                )}

                {/* Modern Hover Effect */}
                {isModern && (
                    <div className="absolute inset-0 bg-slate-100/30 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                )}

               {/* --- ACTION GROUP WRAPPER (Top Right) --- */}
                <div 
                    className="absolute z-30 flex items-center justify-end" 
                    style={{
                        top: `${16 * scaleMultiplier}px`,
                        right: `${16 * scaleMultiplier}px`,
                        height: `${32 * scaleMultiplier}px`
                    }}
                >
                    {/* 1. Badge / Counter (shifts on hover) */}
                    <div 
                        className={`transition-all duration-300 ease-out 
                            group-hover:-translate-x-[var(--shift-x)] 
                            ${activeMenu === folder.id ? '-translate-x-[var(--shift-x)]' : ''}
                        `}
                        style={{
                            '--shift-x': `${shiftX}px`,
                        }}
                    >
                        <div 
                            className={`${
                                isModern 
                                    ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50' 
                                    : 'bg-white/20 backdrop-blur-md border border-white/30 text-white'
                            } rounded-full cursor-pointer hover:scale-105 flex items-center gap-2 shadow-sm transition-all`}
                            style={{
                                fontSize: `${12 * scaleMultiplier}px`,
                                padding: `${6 * scaleMultiplier}px ${12 * scaleMultiplier}px`
                            }}
                        >
                            <span className="font-bold whitespace-nowrap">
                                {totalCount} {totalCount === 1 ? `${totalCount} elemento` : `${totalCount} elementos`}
                            </span>
                        </div>
                    </div>

                    {/* 2. Dots Menu (Fixed position on the right) */}
                    <div className="absolute right-0"> 
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleMenu(folder.id); }}
                            className={`rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center ${
                                isModern
                                    ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800'
                                    : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
                            } ${
                                activeMenu === folder.id ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
                            }`}
                            style={{ 
                                width: `${32 * scaleMultiplier}px`, 
                                height: `${32 * scaleMultiplier}px` 
                            }}
                        >
                            <MoreVertical size={15 * scaleMultiplier} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenu === folder.id && (
                            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 p-1.5 z-50 animate-in fade-in zoom-in-95">
                                {folder.isOwner ? (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); onEdit(folder); }} className="w-full flex items-center gap-2 p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 transition-colors">
                                            <Edit2 size={14} /> Editar
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); onShare(folder); }} className="w-full flex items-center gap-2 p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 transition-colors">
                                            <Share2 size={14} /> Compartir
                                        </button>
                                        <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                                        <button onClick={(e) => { e.stopPropagation(); onDelete(folder); }} className="w-full flex items-center gap-2 p-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors">
                                            <Trash2 size={14} /> Eliminar
                                        </button>
                                    </>
                                ) : (
                                    <div className="p-2 text-xs text-center text-gray-500">Solo lectura</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- CONTENT AREA (Aligned Bottom) --- */}
                <div className={`relative h-full flex flex-col justify-between pointer-events-none ${
                    isModern ? '' : 'text-white'
                }`}
                style={{ padding: `${24 * scaleMultiplier}px` }}>
                    
                    {/* Top: Icon */}
                    <div className="flex justify-between items-start"
                    style={{ paddingTop: `${8 * scaleMultiplier}px` }}>
                            {/* Icon Logic matching SubjectCard */}
                            {isModern ? (
                            <div 
                                className={getIconColor(folder.color)}
                                style={{ width: `${28 * scaleMultiplier}px`, height: `${28 * scaleMultiplier}px` }}
                            >
                                {folder.icon ? (
                                    <SubjectIcon 
                                        iconName={folder.icon} 
                                        style={{ width: `${42 * scaleMultiplier}px`, height: `${42 * scaleMultiplier}px` }}
                                    />
                                ) : (
                                    <Folder 
                                        className="text-indigo-600 dark:text-indigo-400"
                                        style={{ width: `${42 * scaleMultiplier}px`, height: `${42 * scaleMultiplier}px` }}
                                    />
                                )}
                            </div>
                        ) : (
                            <div style={{ width: `${48 * scaleMultiplier}px`, height: `${48 * scaleMultiplier}px` }}>
                                {folder.icon ? (
                                    <SubjectIcon 
                                        iconName={folder.icon} 
                                        className="text-white opacity-80"
                                        style={{ width: `${48 * scaleMultiplier}px`, height: `${48 * scaleMultiplier}px` }}
                                    />
                                ) : (
                                    <Folder 
                                        className="text-white opacity-80"
                                        style={{ width: `${48 * scaleMultiplier}px`, height: `${48 * scaleMultiplier}px` }}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bottom: Text Info */}
                    <div>
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-2">
                            {folder.isShared && (
                                <div className={`inline-flex items-center gap-1 rounded-full ${
                                    isModern 
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800' 
                                        : 'bg-white/20 text-white border border-white/20'
                                }`}
                                style={{
                                    padding: `${2 * scaleMultiplier}px ${8 * scaleMultiplier}px`,
                                    fontSize: `${10 * scaleMultiplier}px`
                                }}>
                                    <Users size={10 * scaleMultiplier} />
                                    <span className="font-bold uppercase tracking-wider">Shared</span>
                                </div>
                            )}
                            
                            {folder.parentId && (
                                <div className={`inline-flex items-center gap-1 rounded-full ${
                                    isModern 
                                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800' 
                                        : 'bg-white/20 text-white border border-white/20'
                                }`}
                                style={{
                                    padding: `${2 * scaleMultiplier}px ${8 * scaleMultiplier}px`,
                                    fontSize: `${10 * scaleMultiplier}px`
                                }}>
                                    <Folder size={10 * scaleMultiplier} />
                                    <span className="font-bold uppercase tracking-wider">Subcarpeta</span>
                                </div>
                            )}
                        </div>
                        
                        <h3 
                            className={`font-bold tracking-tight truncate ${
                                isModern 
                                    ? `bg-gradient-to-br ${gradientClass} bg-clip-text text-transparent` 
                                    : 'text-white'
                            }`}
                            style={{ 
                                fontSize: `${24 * scaleMultiplier}px`,
                                marginBottom: `${4 * scaleMultiplier}px`
                            }}
                        >
                            {folder.name}
                        </h3>

                        {folder.description && (
                            <p 
                                className={`line-clamp-1 font-medium ${
                                    isModern 
                                        ? 'text-gray-400 dark:text-gray-500' 
                                        : 'text-white/70'
                                }`}
                                style={{ fontSize: `${14 * scaleMultiplier}px` }}
                            >
                                {folder.description}
                            </p>
                        )}

                        {/* Folder tags */}
                        {folder.tags && folder.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {folder.tags.slice(0, 3).map(tag => (
                                    <span 
                                        key={tag} 
                                        className={`rounded ${
                                            isModern 
                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' 
                                                : 'bg-white/20 text-white/90'
                                        }`}
                                        style={{ 
                                            fontSize: `${10 * scaleMultiplier}px`,
                                            padding: `${2 * scaleMultiplier}px ${6 * scaleMultiplier}px`
                                        }}
                                    >
                                        #{tag}
                                    </span>
                                ))}
                                {folder.tags.length > 3 && (
                                    <span 
                                        className={`${
                                            isModern 
                                                ? 'text-gray-400 dark:text-gray-500' 
                                                : 'text-white/80'
                                        }`}
                                        style={{ fontSize: `${10 * scaleMultiplier}px` }}
                                    >
                                        +{folder.tags.length - 3}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FolderCardBody;