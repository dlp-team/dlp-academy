// src/components/home/FolderCard.jsx
import React from 'react';
import { Folder, MoreVertical, Edit2, Trash2, Share2, Users } from 'lucide-react';
import SubjectIcon, { getIconColor } from '../modals/SubjectIcon';

const FolderCard = ({ 
    folder, 
    onOpen, 
    activeMenu, 
    onToggleMenu, 
    onEdit, 
    onDelete,
    onShare,
    cardScale = 100,
    isDragging = false
}) => {
    const subjectCount = folder.subjectIds ? folder.subjectIds.length : 0;
    
    // Check if the Modern style is active
    const isModern = folder.cardStyle === 'modern';
    
    // Use modernFillColor if available
    const fillColor = folder.modernFillColor || folder.fillColor; // Fallback if you add fill logic later

    // Calculate scaled sizes
    const scaleMultiplier = cardScale / 100;
    const iconSize = isModern ? 7 * scaleMultiplier : 12 * scaleMultiplier;
    const titleSize = 24 * scaleMultiplier;
    const metaSize = 14 * scaleMultiplier;
    const moreIconSize = 15 * scaleMultiplier;

    // Default gradient if none provided
    const gradientClass = folder.color || 'from-amber-400 to-amber-600';

    return (
        <div 
            className={`group relative w-full h-full pt-3 transition-all cursor-pointer ${
                isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'
            }`}
            onClick={() => onOpen(folder)}
        >
            {/* --- 1. FOLDER TAB (Visual Indicator) --- */}
            {/* We position this behind the main card to look like a file tab */}
            <div 
                className={`absolute top-0 left-0 w-[40%] h-3 rounded-t-xl z-0 transition-all ${
                    isModern 
                        ? `bg-gradient-to-br ${gradientClass}` // Modern: Tab is the gradient color
                        : `bg-gradient-to-br ${gradientClass} opacity-90` // Classic: Tab matches body
                }`}
                style={{ 
                    clipPath: 'polygon(0 0, 100% 0, 100% 102%, 0% 1220%)',
                }}
            >
                {/* Inner shadow for depth */}
                <div className="absolute inset-0 bg-black/10 rounded-t-xl"></div>
                
                {/* For Modern: Add a white cutout if we want the "border" look on the tab, 
                    OR keep it solid to stand out. Keeping it solid usually looks better for tabs. */}
            </div>

            {/* --- 2. MAIN CARD BODY --- */}
            <div className={`relative z-10 h-full w-full rounded-b-2xl rounded-tr-2xl rounded-tl-none shadow-lg overflow-hidden ${
                isModern 
                    ? `bg-gradient-to-br ${gradientClass} p-[3px]` // Modern: Gradient Border
                    : '' // Classic: Handled inside
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
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-90`}></div>
                    )}

                    {/* Modern Background: Optional Fill */}
                    {isModern && fillColor && (
                        <div className={`absolute inset-0 ${fillColor}`}></div>
                    )}

                    {/* Modern Hover Effect */}
                    {isModern && (
                        <div className="absolute inset-0 bg-slate-100/30 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    )}

                    {/* --- INTERACTIVE ELEMENTS (Top Right) --- */}

                    {/* Badge / Count (Slides on Hover) */}
                    <div className={`absolute top-4 right-4 z-20 transition-all duration-300 ease-out group-hover:-translate-x-12 ${
                        activeMenu === folder.id ? '-translate-x-12' : ''
                    }`}>
                        <div 
                            className={`${
                                isModern 
                                    ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50' 
                                    : 'bg-white/20 backdrop-blur-md border border-white/30 text-white'
                            } px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm transition-all`}
                            style={{ fontSize: `${12 * scaleMultiplier}px` }}
                        >
                            <span className="font-bold whitespace-nowrap">
                                {subjectCount} {subjectCount === 1 ? 'asig.' : 'asigs.'}
                            </span>
                        </div>
                    </div>

                    {/* Menu (Dots) */}
                    <div className="absolute top-4 right-4 z-30">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleMenu(folder.id); }}
                            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer ${
                                isModern 
                                    ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800' 
                                    : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
                            } ${
                                activeMenu === folder.id ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
                            }`}
                        >
                            <MoreVertical size={moreIconSize} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {activeMenu === folder.id && (
                            <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 p-1.5 z-50 animate-in fade-in zoom-in-95">
                                {folder.isOwner ? (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); onShare(folder); }} className="w-full flex items-center gap-2 p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 transition-colors">
                                            <Share2 size={14} /> Compartir
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); onEdit(folder); }} className="w-full flex items-center gap-2 p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 transition-colors">
                                            <Edit2 size={14} /> Editar
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

                    {/* --- CONTENT AREA (Aligned Bottom) --- */}
                    <div className={`relative h-full p-6 flex flex-col justify-between pointer-events-none ${
                        isModern ? '' : 'text-white'
                    }`}>
                        
                        {/* Top: Icon */}
                        <div className="flex justify-between items-start pt-2">
                             {/* Icon Logic matching SubjectCard */}
                             {isModern ? (
                                <div 
                                    className={getIconColor(folder.color)}
                                    style={{ width: `${iconSize * 4}px`, height: `${iconSize * 4}px` }}
                                >
                                    {folder.icon ? (
                                        <SubjectIcon 
                                            iconName={folder.icon} 
                                            style={{ width: `${iconSize * 6}px`, height: `${iconSize * 6}px` }}
                                        />
                                    ) : (
                                        <Folder 
                                            className="text-indigo-600 dark:text-indigo-400"
                                            style={{ width: `${iconSize * 6}px`, height: `${iconSize * 6}px` }}
                                        />
                                    )}
                                </div>
                            ) : (
                                <div style={{ width: `${iconSize * 4}px`, height: `${iconSize * 4}px` }}>
                                    {folder.icon ? (
                                        <SubjectIcon 
                                            iconName={folder.icon} 
                                            className="text-white opacity-80"
                                            style={{ width: `${iconSize * 4}px`, height: `${iconSize * 4}px` }}
                                        />
                                    ) : (
                                        <Folder 
                                            className="text-white opacity-80"
                                            style={{ width: `${iconSize * 4}px`, height: `${iconSize * 4}px` }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Bottom: Text Info */}
                        <div>
                            {folder.isShared && (
                                <div className={`inline-flex items-center gap-1 mb-2 px-2 py-0.5 rounded-full ${
                                    isModern 
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800' 
                                        : 'bg-white/20 text-white border border-white/20'
                                }`}>
                                    <Users size={10} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Shared</span>
                                </div>
                            )}
                            
                            <h3 
                                className={`font-bold tracking-tight mb-1 truncate ${
                                    isModern 
                                        ? `bg-gradient-to-br ${gradientClass} bg-clip-text text-transparent` 
                                        : 'text-white'
                                }`}
                                style={{ fontSize: `${titleSize}px` }}
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
                                    style={{ fontSize: `${metaSize}px` }}
                                >
                                    {folder.description}
                                </p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FolderCard;