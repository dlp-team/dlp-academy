// src/components/home/SubjectCard.jsx
import React from 'react';
import { ChevronRight, ArrowLeft, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import SubjectIcon from '../modals/SubjectIcon';

const SubjectCard = ({ 
    subject, 
    isFlipped, 
    onFlip, 
    onSelect, 
    onSelectTopic, 
    activeMenu, 
    onToggleMenu, 
    onEdit, 
    onDelete,
    cardScale = 100
}) => {
    const topicCount = subject.topics ? subject.topics.length : 0;
    
    // Check if the Modern style is active
    const isModern = subject.cardStyle === 'modern';
    
    // Use fillColor if available, otherwise fallback to a subtle gradient
    const fillColor = subject.fillColor || 'from-slate-50/50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50';

    const getScaledSize = (base) => {
        return `${(base * cardScale) / 100}px`;
    };


    return (
        // OUTER CONTAINER: 
        // If Modern: we use the gradient as the background/border
        <div className={`group relative h-64 rounded-2xl shadow-lg dark:shadow-slate-900/50 transition-all hover:scale-105 ${
            isModern 
                ? `bg-gradient-to-br ${subject.color} p-[3px]` 
                : ''
        }`}>
            
            {/* INNER CONTENT */}
            <div className={`h-full w-full rounded-xl overflow-hidden relative ${
                isModern 
                    ? 'bg-white dark:bg-slate-950' 
                    : ''
            }`}>
                
                {/* --- FRONT --- */}
                {!isFlipped && (
                    <div className="absolute inset-0 cursor-pointer" onClick={() => onSelect(subject.id)}>
                        
                        {/* Classic Background: Full Gradient */}
                        {!isModern && (
                            <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-90`}></div>
                        )}

                        {/* Modern Background: Subtle gradient fill */}
                        {isModern && (
                            <div className={`absolute inset-0 bg-gradient-to-br ${fillColor} transition-opacity`}></div>
                        )}

                        {/* Modern Hover Effect */}
                        {isModern && (
                            <div className="absolute inset-0 bg-slate-100/30 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        )}

                        {/* Badge / Flipper */}
                        <div className={`absolute top-6 right-6 z-20 transition-all duration-300 ease-out group-hover:-translate-x-12 ${
                            activeMenu === subject.id ? '-translate-x-12' : ''
                        }`}>
                            <div 
                                onClick={(e) => { e.stopPropagation(); onFlip(subject.id); }}
                                className={`${
                                    isModern 
                                        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50' 
                                        : 'bg-white/20 backdrop-blur-md border border-white/30 text-white'
                                } px-3 py-1.5 rounded-full cursor-pointer hover:scale-105 flex items-center gap-2 shadow-sm transition-all`}
                            >
                                <span className="text-sm font-bold whitespace-nowrap">
                                    {topicCount} {topicCount === 1 ? 'tema' : 'temas'}
                                </span>
                                <ChevronRight size={14} className="opacity-70" />
                            </div>
                        </div>

                        {/* Dots Menu */}
                        <div className="absolute top-6 right-6 z-30">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onToggleMenu(subject.id); }}
                                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer ${
                                    isModern 
                                        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:scale-120' 
                                        : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30 hover:scale-110'
                                } ${
                                    activeMenu === subject.id ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
                                }`}
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>
                            
                            {activeMenu === subject.id && (
                                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 p-1 z-50 animate-in fade-in zoom-in-95 duration-100 transition-colors">
                                    <button onClick={(e) => onEdit(e, subject)} className="w-full flex items-center gap-2 p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 transition-colors">
                                        <Edit2 size={14} /> Editar
                                    </button>
                                    <button onClick={(e) => onDelete(e, subject)} className="w-full flex items-center gap-2 p-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors">
                                        <Trash2 size={14} /> Eliminar
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className={`relative h-full p-6 flex flex-col justify-between pointer-events-none ${
                            isModern ? '' : 'text-white'
                        }`}>
                            <div className="flex justify-between items-start">
                                {/* Icon: Modern style applies the gradient color */}
                                {isModern ? (
                                    <div className={`bg-gradient-to-br ${subject.color} p-2.5 rounded-xl shadow-sm`}>
                                        <SubjectIcon iconName={subject.icon} className="w-7 h-7 text-white" />
                                    </div>
                                ) : (
                                    <SubjectIcon iconName={subject.icon} className="w-12 h-12 text-white opacity-80" />
                                )}
                            </div>
                            <div>
                                <p className={`text-sm font-medium tracking-wide ${
                                    isModern 
                                        ? 'text-gray-500 dark:text-gray-400' 
                                        : 'text-white opacity-90'
                                }`}>
                                    {subject.course}
                                </p>
                                
                                {/* Title: Modern style applies gradient to text */}
                                <h3 className={`text-2xl font-bold tracking-tight mb-2 ${
                                    isModern 
                                        ? `bg-gradient-to-br ${subject.color} bg-clip-text text-transparent` 
                                        : 'text-white'
                                }`}>
                                    {subject.name}
                                </h3>

                                {subject.tags && subject.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {subject.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                isModern 
                                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' 
                                                    : 'bg-white/20 text-white/90'
                                            }`}>
                                                #{tag}
                                            </span>
                                        ))}
                                        {subject.tags.length > 3 && (
                                            <span className={`text-[10px] ${
                                                isModern 
                                                    ? 'text-gray-400 dark:text-gray-500' 
                                                    : 'text-white/80'
                                            }`}>
                                                +{subject.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- BACK --- */}
                {isFlipped && (
                    <div className="absolute inset-0 bg-white dark:bg-slate-900 flex flex-col z-40 animate-in fade-in duration-200 transition-colors">
                        <div className={`p-4 bg-gradient-to-r ${subject.color} flex items-center justify-between text-white shadow-sm`}>
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); onFlip(subject.id); }} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                                    <ArrowLeft size={18} />
                                </button>
                                <span className="font-bold text-sm truncate max-w-[150px]">Temas de {subject.name}</span>
                            </div>
                            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">{topicCount}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {topicCount > 0 ? (
                                subject.topics.map((topic) => (
                                    <button
                                        key={topic.id}
                                        onClick={() => onSelectTopic(subject.id, topic.id)}
                                        className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer"
                                    >
                                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate pr-2">{topic.title}</span>
                                        <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                                    </button>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 p-4 text-center">
                                    <SubjectIcon iconName={subject.icon} className="w-8 h-8 mb-2 opacity-20" />
                                    <p className="text-sm">Aún no hay temas</p>
                                    <button onClick={() => onSelect(subject.id)} className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                                        Crear uno ahora
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubjectCard;