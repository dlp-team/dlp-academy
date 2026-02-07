// src/components/home/SubjectCard.jsx
import React from 'react';
import { ChevronRight, ArrowLeft, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import SubjectIcon, { getIconColor } from '../modals/SubjectIcon';

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
    cardScale = 100,
    isDragging = false,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    draggable = false,
    position = 0
}) => {
    const topicCount = subject.topics ? subject.topics.length : 0;
    
    // Check if the Modern style is active
    const isModern = subject.cardStyle === 'modern';
    
    // Use modernFillColor if available
    const fillColor = subject.modernFillColor || subject.fillColor;

    // Calculate scaled sizes based on cardScale
    const scaleMultiplier = cardScale / 100;
    
    // Handle drag events
    const handleDragStart = (e) => {
        if (draggable && onDragStart) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('subjectId', subject.id);
            e.dataTransfer.setData('position', position.toString());
            onDragStart(subject, position);
        }
    };

    const handleDragEnd = (e) => {
        if (draggable && onDragEnd) {
            onDragEnd();
        }
    };

    const handleDragOver = (e) => {
        if (draggable && onDragOver) {
            e.preventDefault();
            onDragOver(e, position);
        }
    };

    const handleDrop = (e) => {
        if (draggable && onDrop) {
            e.preventDefault();
            e.stopPropagation();
            const draggedSubjectId = e.dataTransfer.getData('subjectId');
            const draggedPosition = parseInt(e.dataTransfer.getData('position'));
            onDrop(draggedSubjectId, draggedPosition, position);
        }
    };

    return (
        /* ORIGINAL RECTANGLE PROPORTIONS: w-64 h-64 makes it SQUARE
           Changed to: w-full with aspect-[16/9] to make it RECTANGLE (wider than tall) */
        <div 
            className={`group relative w-full rounded-2xl shadow-lg dark:shadow-slate-900/50 transition-all ${
                isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'
            } ${
                isModern 
                    ? `bg-gradient-to-br ${subject.color} p-[3px]` 
                    : ''
            }`}
            style={{ aspectRatio: '16 / 10' }}
            draggable={draggable && !isFlipped}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            
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

                        {/* Modern Background: Fill color */}
                        {isModern && fillColor && (
                            <div className={`absolute inset-0 ${fillColor}`}></div>
                        )}

                        {/* Modern Hover Effect */}
                        {isModern && (
                            <div className="absolute inset-0 bg-slate-100/30 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        )}

                        {/* Badge / Flipper */}
                        <div className={`absolute z-20 transition-all duration-300 ease-out group-hover:-translate-x-12 ${
                            activeMenu === subject.id ? '-translate-x-12' : ''
                        }`}
                        style={{
                            top: `${24 * scaleMultiplier}px`,
                            right: `${24 * scaleMultiplier}px`
                        }}>
                            <div 
                                onClick={(e) => { e.stopPropagation(); onFlip(subject.id); }}
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
                                <ChevronRight size={14 * scaleMultiplier} className="opacity-70" />
                            </div>
                        </div>

                        {/* Dots Menu */}
                        <div className="absolute z-30"
                        style={{
                            top: `${24 * scaleMultiplier}px`,
                            right: `${24 * scaleMultiplier}px`
                        }}>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onToggleMenu(subject.id); }}
                                className={`rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer ${
                                    isModern 
                                        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800' 
                                        : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
                                } ${
                                    activeMenu === subject.id ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
                                }`}
                                style={{ padding: `${8 * scaleMultiplier}px` }}
                            >
                                <MoreVertical size={15 * scaleMultiplier} />
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
                                
                                <h3 
                                    className={`font-bold tracking-tight mb-2 truncate ${
                                        isModern 
                                            ? `bg-gradient-to-br ${subject.color} bg-clip-text text-transparent` 
                                            : 'text-white'
                                    }`}
                                    style={{ fontSize: `${24 * scaleMultiplier}px` }}
                                >
                                    {subject.name}
                                </h3>

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
                                                className={`${
                                                    isModern 
                                                        ? 'text-gray-400 dark:text-gray-500' 
                                                        : 'text-white/80'
                                                }`}
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
                )}

                {/* --- BACK --- */}
                {isFlipped && (
                    <div className="absolute inset-0 bg-white dark:bg-slate-900 flex flex-col z-40 animate-in fade-in duration-200 transition-colors">
                        <div className={`bg-gradient-to-r ${subject.color} flex items-center justify-between text-white shadow-sm`}
                        style={{ padding: `${16 * scaleMultiplier}px` }}>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onFlip(subject.id); }} 
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <ArrowLeft size={18 * scaleMultiplier} />
                                </button>
                                <span 
                                    className="font-bold truncate"
                                    style={{ 
                                        fontSize: `${14 * scaleMultiplier}px`,
                                        maxWidth: `${150 * scaleMultiplier}px`
                                    }}
                                >
                                    Temas de {subject.name}
                                </span>
                            </div>
                            <span 
                                className="font-medium bg-white/20 rounded-full"
                                style={{ 
                                    fontSize: `${12 * scaleMultiplier}px`,
                                    padding: `${4 * scaleMultiplier}px ${8 * scaleMultiplier}px`
                                }}
                            >
                                {topicCount}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar"
                        style={{ padding: `${8 * scaleMultiplier}px` }}>
                            {topicCount > 0 ? (
                                subject.topics.map((topic) => (
                                    <button
                                        key={topic.id}
                                        onClick={() => onSelectTopic(subject.id, topic.id)}
                                        className="w-full text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer"
                                        style={{ padding: `${12 * scaleMultiplier}px` }}
                                    >
                                        <span 
                                            className="font-medium truncate pr-2 text-gray-700 dark:text-gray-300"
                                            style={{ fontSize: `${14 * scaleMultiplier}px` }}
                                        >
                                            {topic.title}
                                        </span>
                                        <ChevronRight size={14 * scaleMultiplier} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                                    </button>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 p-4 text-center">
                                    <SubjectIcon 
                                        iconName={subject.icon} 
                                        className="mb-2 opacity-20"
                                        style={{ 
                                            width: `${32 * scaleMultiplier}px`, 
                                            height: `${32 * scaleMultiplier}px` 
                                        }}
                                    />
                                    <p style={{ fontSize: `${14 * scaleMultiplier}px` }}>Aún no hay temas</p>
                                    <button 
                                        onClick={() => onSelect(subject.id)} 
                                        className="mt-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                                        style={{ fontSize: `${12 * scaleMultiplier}px` }}
                                    >
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