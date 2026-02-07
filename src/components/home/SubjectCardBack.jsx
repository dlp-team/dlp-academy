// src/components/home/SubjectCardBack.jsx
import React from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import SubjectIcon from '../modals/SubjectIcon'; // Adjust path if necessary

const SubjectCardBack = ({
    subject,
    onFlip,
    onSelectTopic,
    onSelect,
    scaleMultiplier,
    topicCount
}) => {
    return (
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
    );
};

export default SubjectCardBack;