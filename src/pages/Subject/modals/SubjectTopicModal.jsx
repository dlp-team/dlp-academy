// src/pages/Subject/modals/SubjectTopicModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, GripVertical, Loader2 } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import SubjectIcon from '../../../components/ui/SubjectIcon';

const SubjectTopicsModal = ({ isOpen, onClose, subject }) => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [draggedTopicId, setDraggedTopicId] = useState(null);

    // --- 1. Fetch Topics ---
    useEffect(() => {
        if (!isOpen || !subject) {
            setTopics([]);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, "topics"),
            where("subjectId", "==", subject.id),
            orderBy("order", "asc")
        );

       const unsubscribe = onSnapshot(q, (snapshot) => {
            // ... existing snapshot logic ...
            const fetchedTopics = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTopics(fetchedTopics);
            setLoading(false);
        }, (error) => {
             console.error("Error fetching topics:", error);
             setLoading(false);
        });

        return () => unsubscribe();
    }, [isOpen, subject]);

    // --- 2. Drag & Drop Logic ---
    const handleDragStart = (e, topicId) => {
        setDraggedTopicId(topicId);
        e.dataTransfer.setData("text/plain", topicId);
        e.dataTransfer.effectAllowed = "move";
        // Hide the default ghost image slightly if desired, or let it be
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e, targetTopicId) => {
        e.preventDefault();
        const sourceTopicId = e.dataTransfer.getData("text/plain");

        if (!sourceTopicId || sourceTopicId === targetTopicId) return;

        // Optimistic UI Update
        const sourceIndex = topics.findIndex(t => t.id === sourceTopicId);
        const targetIndex = topics.findIndex(t => t.id === targetTopicId);

        if (sourceIndex === -1 || targetIndex === -1) return;

        const newTopics = [...topics];
        const [movedTopic] = newTopics.splice(sourceIndex, 1);
        newTopics.splice(targetIndex, 0, movedTopic);

        setTopics(newTopics);
        setDraggedTopicId(null);

        // Batch Update to Firestore
        try {
            const batch = writeBatch(db);
            
            // FIX: Change 'newOrder' to 'newTopics'
            newTopics.forEach((item, index) => { 
                const ref = doc(db, "topics", item.id); 
                batch.update(ref, { order: index });
            });
            
            await batch.commit();
        } catch (error) {
            console.error("Error reordering topics:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            // 1. Add onClick to close when clicking the backdrop
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        >
            <div 
                // 2. Add stopPropagation so clicking INSIDE the modal doesn't close it
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden transition-all"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${subject?.color || 'from-indigo-500 to-purple-500'}`}>
                            <SubjectIcon iconName={subject?.icon} className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {subject?.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {topics.length} temas
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto min-h-[300px] bg-slate-50 dark:bg-slate-950/50">
                    {loading ? (
                        <div className="flex h-full items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                    ) : topics.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            No hay temas en esta asignatura todavía.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {topics.map((topic, index) => {
                                // 1. Determine Styles
                                const isModern = subject?.cardStyle === 'modern';
                                const gradientClass = subject?.color || 'from-indigo-500 to-purple-500';

                                return (
                                    <div
                                        key={topic.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, topic.id)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, topic.id)}
                                        // 2. OUTER CONTAINER (Handles the Border logic)
                                        className={`
                                            group relative rounded-xl transition-all cursor-move
                                            ${draggedTopicId === topic.id ? 'opacity-50' : 'hover:shadow-md'}
                                            
                                            /* MODERN STYLE: Use Gradient as Background + Padding to simulate Border */
                                            ${isModern 
                                                ? `p-[2px] bg-gradient-to-br ${gradientClass}` 
                                                : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800'
                                            }
                                        `}
                                    >
                                        {/* 3. INNER CONTAINER (Holds the content & white background) */}
                                        <div className={`
                                            relative flex items-center gap-3 p-3 h-full w-full rounded-[10px]
                                            ${isModern ? 'bg-white dark:bg-slate-900' : 'overflow-hidden'}
                                        `}>
                                            
                                            {/* CLASSIC STYLE (Old Modern): Left Accent Strip */}
                                            {!isModern && (
                                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${gradientClass}`} />
                                            )}

                                            {/* Drag Handle */}
                                            <div className="text-gray-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors z-10">
                                                <GripVertical size={16} />
                                            </div>

                                            {/* Numbering */}
                                            <div className={`
                                                z-10 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0
                                                ${isModern 
                                                    ? 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400' 
                                                    : 'bg-gray-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-gray-100 dark:border-slate-700'
                                                }
                                            `}>
                                                {index + 1}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 z-10">
                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                                    {topic.name || topic.title}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium
                                                        ${topic.status === 'completed' 
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400'
                                                        }
                                                    `}>
                                                        {topic.status === 'completed' ? 'Completado' : 'Pendiente'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-100 dark:border-slate-800 text-center bg-white dark:bg-slate-900">
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                        <GripVertical size={12} /> Arrastra los elementos para organizar el orden
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubjectTopicsModal;