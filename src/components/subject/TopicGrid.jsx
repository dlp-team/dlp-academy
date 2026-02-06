// src/components/subject/TopicGrid.jsx
import React from 'react';
import { Plus } from 'lucide-react';
import TopicCard from './TopicCard';

const TopicGrid = ({ 
    topics, 
    subjectColor,
    isReordering, 
    onOpenCreateModal, 
    onSelectTopic, 
    onDeleteTopic, 
    onRetryTopic,
    onMoveUp,
    onMoveDown
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Create New Topic Card */}
            {!isReordering && (
                <button 
                    onClick={onOpenCreateModal} 
                    className="group relative h-64 border-3 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer"
                >
                    <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/40 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800/60 flex items-center justify-center transition-colors">
                        <Plus className="w-10 h-10 text-indigo-500 dark:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors" />
                    </div>
                    <span className="text-lg font-semibold text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        Crear Nuevo Tema
                    </span>
                </button>
            )}

            {topics.map((topic, index) => (
                <TopicCard
                    key={topic.id}
                    index={index}
                    topic={topic}
                    subjectColor={subjectColor}
                    isReordering={isReordering}
                    onSelect={onSelectTopic}
                    onDelete={onDeleteTopic}
                    onRetry={onRetryTopic}
                    onMoveUp={onMoveUp}
                    onMoveDown={onMoveDown}
                    isFirst={index === 0}
                    isLast={index === topics.length - 1}
                />
            ))}
        </div>
    );
};

export default TopicGrid;