// src/components/subject/TopicCard.jsx
import React from 'react';
import { Trash2, RotateCw, Clock, CheckCircle2, ArrowUpDown, GripVertical } from 'lucide-react';

const TopicCard = ({ 
    topic, 
    index, 
    subjectColor, 
    isReordering, 
    onSelect, 
    onDelete, 
    onRetry, 
    onMoveUp, 
    onMoveDown,
    isFirst,
    isLast
}) => {
    return (
        <div className={`group relative h-64 rounded-2xl shadow-lg dark:shadow-slate-900/50 overflow-hidden transition-all duration-300 ${isReordering ? 'cursor-move ring-2 ring-indigo-500/20 dark:ring-indigo-400/20' : 'hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-slate-900/70 cursor-pointer'}`}>
            <div onClick={() => !isReordering && onSelect(topic)} className="w-full h-full text-left relative">
                
                {/* Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${subjectColor} opacity-90 transition-opacity`}></div>
                
                {/* --- NORMAL MODE ACTIONS --- */}
                {!isReordering && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(topic.id); }}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 dark:hover:bg-white/30 rounded-full text-white transition-all z-10 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                        title="Eliminar tema"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}

                {/* --- ERROR / RETRY OVERLAY --- */}
                {topic.status === 'error' && !isReordering && (
                    <div className="absolute inset-0 bg-red-600/10 dark:bg-red-600/20 z-20 flex flex-col items-center justify-center backdrop-blur-[2px]">
                        <div onClick={(e) => { e.stopPropagation(); onRetry(topic); }} className="flex flex-col items-center gap-2 group/btn cursor-pointer">
                            <div className="bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 p-3 rounded-full shadow-xl group-hover/btn:scale-110 transition-transform">
                                <RotateCw className="w-6 h-6" />
                            </div>
                            <span className="text-white font-bold drop-shadow-md text-sm bg-red-600/90 dark:bg-red-500/90 px-3 py-1 rounded-full">Reintentar</span>
                        </div>
                    </div>
                )}
                
                {/* --- REORDER MODE CONTROLS --- */}
                {isReordering && (
                    <div className="absolute inset-0 bg-black/40 dark:bg-black/60 z-20 flex items-center justify-center gap-3 backdrop-blur-[1px]">
                        <div 
                            onClick={(e) => { e.stopPropagation(); onMoveUp(index); }}
                            className={`p-3 bg-white dark:bg-slate-900 rounded-full shadow-lg transition-transform hover:scale-110 ${isFirst ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                        >
                            <ArrowUpDown className="w-5 h-5 rotate-180 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div className="p-3 bg-white/90 dark:bg-slate-900/90 rounded-full shadow-lg">
                            <GripVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div
                            onClick={(e) => { e.stopPropagation(); onMoveDown(index); }}
                            className={`p-3 bg-white dark:bg-slate-900 rounded-full shadow-lg transition-transform hover:scale-110 ${isLast ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                        >
                            <ArrowUpDown className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </div>
                    </div>
                )}
                
                {/* --- CONTENT --- */}
                <div className="relative h-full p-6 flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                        <span className="text-8xl font-black opacity-20 select-none">
                            {isReordering ? (index + 1).toString().padStart(2, '0') : (topic.number || (index + 1).toString().padStart(2, '0'))}
                        </span>
                        {!isReordering && (
                            topic.status === 'generating' ? (
                                <div className="flex flex-col items-center animate-pulse">
                                    <Clock className="w-6 h-6 animate-spin" />
                                    <span className="text-[10px] mt-1 font-medium uppercase tracking-wider">Procesando</span>
                                </div>
                            ) : topic.status === 'completed' ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-300 dark:text-emerald-400" />
                            ) : null
                        )}
                    </div>
                    
                    <div>
                        <h3 className="text-2xl font-bold mb-2 leading-tight line-clamp-2">{topic.title}</h3>
                        {!isReordering && (
                            <p className="text-sm opacity-90 font-medium">
                                {topic.status === 'generating' ? 'Generando contenido...' : topic.status === 'completed' ? 'Completado' : 'Error en generación'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopicCard;