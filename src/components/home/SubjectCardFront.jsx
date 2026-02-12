// src/components/home/SubjectCardFront.jsx
import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, MoreVertical, Edit2, Trash2, Share2 } from 'lucide-react';
import SubjectIcon, { getIconColor } from '../modals/SubjectIcon'; // Adjust path if necessary
import { Users } from 'lucide-react';

const SubjectCardFront = ({
    subject,
    onSelect,
    onFlip,
    activeMenu,
    onToggleMenu,
    onEdit,
    onDelete,
    onShare,
    isModern,
    fillColor,
    scaleMultiplier,
    topicCount,
    onOpenTopics
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const menuBtnRef = useRef(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

    useLayoutEffect(() => {
        if (activeMenu === subject.id && menuBtnRef.current) {
            const rect = menuBtnRef.current.getBoundingClientRect();
            setMenuPos({
                top: rect.bottom + 4,
                left: rect.left,
            });
        }
    }, [activeMenu, subject.id]);

    // Calculate shift factor based on scale - smaller cards have less shift
    const shiftX = 48 * scaleMultiplier;

    return (
        <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => onSelect(subject.id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            
            {/* Classic Background: Full Gradient */}
            {!isModern && (
                <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-90`}></div>
            )}

            {/* Modern Background: Fill color */}
            {isModern && fillColor && (
                <div className={`absolute inset-0 ${fillColor}`}></div>
            )}

            {/* Modern Hover Effect */}
            {isModern && (
                <div className="absolute inset-0 bg-slate-100/30 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            )}

            

           {/* --- ACTION GROUP WRAPPER --- */}
            <div 
                className="absolute z-30 flex items-center justify-end" 
                style={{
                    top: `${24 * scaleMultiplier}px`,
                    right: `${24 * scaleMultiplier}px`,
                    height: `${32 * scaleMultiplier}px` // Matches the dots button height for alignment
                }}
            >
                {/* 1. Badge / Flipper (The one that shifts) */}
                <div
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        onOpenTopics && onOpenTopics(subject); // UPDATED: Direct call to modal
                    }} 
                    className={`transition-all duration-300 ease-out 
                        group-hover:-translate-x-[var(--shift-x)] 
                        ${activeMenu === subject.id ? '-translate-x-[var(--shift-x)]' : ''}
                    `}
                    style={{
                        '--shift-x': `${shiftX}px`,
                    }}
                >
                    <div 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            onOpenTopics && onOpenTopics(subject); // UPDATED: Fixes the crash
                        }} 
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
                            {topicCount} {topicCount === 1 ? 'tema' : 'temas'}
                        </span>
                        {/* You might want to change this icon to List or Eye instead of ChevronRight if it opens a modal */}
                        <ChevronRight size={14 * scaleMultiplier} className="opacity-70" />
                    </div>
                </div>

                {/* 2. Dots Menu (Fixed position on the right) */}
                <div className="absolute right-0"> 
                    <button
                        ref={menuBtnRef}
                        onClick={(e) => { e.stopPropagation(); onToggleMenu(subject.id); }}
                        className={`rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center ${
                            isModern
                                ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800'
                                : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
                        } ${
                            activeMenu === subject.id ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
                        }`}
                        style={{ 
                            width: `${32 * scaleMultiplier}px`, 
                            height: `${32 * scaleMultiplier}px` 
                        }}
                    >
                        <MoreVertical size={15 * scaleMultiplier} />
                    </button>

                    {/* Dropdown Menu rendered in a portal to avoid clipping */}
                    {activeMenu === subject.id && typeof window !== 'undefined' && createPortal(
                        <div
                            className="w-32 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 p-1 animate-in fade-in zoom-in-95 duration-100 transition-colors"
                            style={{
                                position: 'fixed',
                                top: menuPos.top,
                                left: menuPos.left,
                                zIndex: 9999
                            }}
                        >
                            <button onClick={(e) => onEdit(e, subject)} className="w-full flex items-center gap-2 p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 transition-colors">
                                <Edit2 size={14} /> Editar
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onShare(subject); }} className="w-full flex items-center gap-2 p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 transition-colors">
                                <Share2 size={14} /> Compartir
                            </button>
                            <button onClick={(e) => onDelete(e, subject)} className="w-full flex items-center gap-2 p-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors">
                                <Trash2 size={14} /> Eliminar
                            </button>
                        </div>,
                        document.body
                    )}
                </div>
            </div>

            {/* Content */}
            <div className={`relative h-full flex flex-col justify-between pointer-events-none ${
                isModern ? '' : 'text-white'
            }`}
            style={{ padding: `${24 * scaleMultiplier}px` }}>
                <div className="flex justify-between items-start">
                    {/* Icon */}
                    {isModern ? (
                        <div 
                            className={getIconColor(subject.color)}
                            style={{ 
                                width: `${28 * scaleMultiplier}px`, 
                                height: `${28 * scaleMultiplier}px` 
                            }}
                        >
                            {subject.icon ? (
                                <SubjectIcon 
                                    iconName={subject.icon} 
                                    style={{ 
                                        width: `${42 * scaleMultiplier}px`, 
                                        height: `${42 * scaleMultiplier}px` 
                                    }}
                                />
                            ) : (
                                <SubjectIcon 
                                    iconName={subject.icon} 
                                    className="text-indigo-600 dark:text-indigo-400"
                                    style={{ 
                                        width: `${42 * scaleMultiplier}px`, 
                                        height: `${42 * scaleMultiplier}px` 
                                    }}
                                />
                            )}
                            
                        </div>
                    ) : (
                        <div style={{ width: `${48 * scaleMultiplier}px`, height: `${48 * scaleMultiplier}px` }}>
                            <SubjectIcon 
                                iconName={subject.icon} 
                                className="text-white opacity-80" 
                                style={{ 
                                    width: `${48 * scaleMultiplier}px`, 
                                    height: `${48 * scaleMultiplier}px` 
                                }}
                            />
                        </div>
                    )}
                </div>
                
                <div>
                    {subject.course && (
                        <p 
                            className={`font-medium tracking-wide ${
                                isModern 
                                    ? 'text-gray-500 dark:text-gray-400' 
                                    : 'text-white opacity-90'
                            }`}
                            style={{ fontSize: `${14 * scaleMultiplier}px` }}
                        >
                            {subject.course}
                        </p>
                    )}
                    
                    <div className="flex items-center gap-2 mb-2">
                        {/* 1. Subject Name */}
                        <h3 
                            className={`font-bold tracking-tight truncate ${
                                isModern 
                                    ? `bg-gradient-to-br ${subject.color} bg-clip-text text-transparent` 
                                    : 'text-white'
                            }`}
                            style={{ fontSize: `${24 * scaleMultiplier}px` }}
                        >
                            {subject.name}
                        </h3>

                        {/* 2. Shared Icon (at the right) */}
                        {subject.isShared && (
                            <div 
                                className={`flex items-center justify-center rounded-full ${
                                    isModern ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-white/20'
                                }`}
                                style={{ 
                                    width: `${24 * scaleMultiplier}px`, 
                                    height: `${24 * scaleMultiplier}px`,
                                    minWidth: `${24 * scaleMultiplier}px` // Prevents shrinking if name is long
                                }}
                                title="Asignatura compartida"
                            >
                                <Users 
                                    className={isModern ? "text-indigo-600 dark:text-indigo-400" : "text-white"}
                                    style={{ width: `${14 * scaleMultiplier}px`, height: `${14 * scaleMultiplier}px` }}
                                />
                            </div>
                        )}
                    </div>

                    {subject.tags && subject.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {subject.tags.slice(0, 3).map(tag => (
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
                            {subject.tags.length > 3 && (
                                <span 
                                    className={
                                        isModern 
                                            ? 'text-gray-400 dark:text-gray-500' 
                                            : 'text-white/80'
                                    }
                                    style={{ fontSize: `${10 * scaleMultiplier}px` }}
                                >
                                    +{subject.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                    
                </div>
            </div>
        </div>
    );
};

export default SubjectCardFront;