// src/components/subject/TopicGrid.jsx
import React from 'react';
import { Plus } from 'lucide-react';
import TopicCard from './TopicCard';

const TopicGrid = ({ 
    topics, 
    subjectColor,
    onOpenCreateModal, 
    onSelectTopic, 
    onDeleteTopic, 
    onRetryTopic,
    onReorderTopics
}) => {

    // 1. Set the ID of the item being dragged
    const handleDragStart = (e, topicId) => {
        // We use 'text/plain' to ensure compatibility
        e.dataTransfer.setData("text/plain", topicId);
        e.dataTransfer.effectAllowed = "move";
    };

    // 2. Allow dropping (default is to block drops)
    const handleDragOver = (e) => {
        e.preventDefault(); 
        e.dataTransfer.dropEffect = "move";
    };

    // 3. Handle the actual drop on a specific target
    const handleDrop = (e, targetTopicId) => {
        e.preventDefault();
        const sourceTopicId = e.dataTransfer.getData("text/plain");

        if (sourceTopicId && sourceTopicId !== targetTopicId) {
            onReorderTopics(sourceTopicId, targetTopicId);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
            {/* Create New Topic Card */}
            <button 
                onClick={onOpenCreateModal} 
                className="group relative h-64 border-3 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer"
            >
                <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800/50 flex items-center justify-center transition-colors">
                    <Plus className="w-10 h-10 text-indigo-500 dark:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors" />
                </div>
                <span className="text-lg font-semibold text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Crear Nuevo Tema
                </span>
            </button>

            {/* Draggable Cards */}
            {topics.map((topic, index) => (
                <TopicCard
                    key={topic.id}
                    index={index}
                    topic={topic}
                    subjectColor={subjectColor}
                    onSelect={onSelectTopic}
                    onDelete={onDeleteTopic}
                    onRetry={onRetryTopic}
                    
                    // Drag Handlers
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, topic.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, topic.id)}
                />
            ))}
        </div>
    );
};

export default TopicGrid;