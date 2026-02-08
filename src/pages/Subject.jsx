import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';

// Hooks
import { useSubjectManager } from '../hooks/useSubjectManager';

// Layout
import Header from '../components/layout/Header';
import SubjectHeader from '../components/subject/SubjectHeader';
import TopicGrid from '../components/subject/TopicGrid';

// Modals
import EditSubjectModal from '../components/modals/EditSubjectModal';
import TopicFormModal from '../components/modals/TopicFormModal';

const Subject = ({ user }) => {
    // 1. Safe Params
    const params = useParams();
    const subjectId = params.subjectId || params.id; 
    const navigate = useNavigate();
    
    // --- 1. DATA LOGIC ---
    // Note: Ensure useSubjectManager exports 'handleReorderTopics'
    const { 
        subject, topics, loading, 
        updateSubject, deleteSubject, 
        createTopic, deleteTopic, 
        handleReorderTopics // <--- NEW EXPORT FROM HOOK
    } = useSubjectManager(user, subjectId);

    // --- 2. UI STATE ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showTopicModal, setShowTopicModal] = useState(false);
    
    // Action Data State
    const [retryTopicData, setRetryTopicData] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Reorder State (We keep this for visual toggling in Header, even if Drag is always on)
    const [isReordering, setIsReordering] = useState(false);

    // --- 3. HANDLERS ---

    // Topic Handlers
    const handleCreateOrRetry = async (data, files) => {
        // If retryTopicData exists, pass its ID to createTopic to handle the update
        await createTopic(data, files); 
        setShowTopicModal(false);
        setRetryTopicData(null);
    };

    const onRetryTopic = (topic) => {
        setRetryTopicData(topic);
        setShowTopicModal(true);
    };
    
    const onDeleteTopicConfirm = (topicId) => {
        if(window.confirm("¿Seguro que quieres eliminar este tema?")) {
            deleteTopic(topicId);
        }
    };

    const handleDeleteSubject = async () => {
        setIsDeleting(true);
        await deleteSubject(); // Hook handles navigation
    };

    // Scroll Lock Effect
    useEffect(() => {
        document.body.style.overflow = (showEditModal || showDeleteModal || showTopicModal) ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showEditModal, showDeleteModal, showTopicModal]);


    if (!user || loading || !subject) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 font-sans transition-colors">
            
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <SubjectHeader 
                    subject={subject}
                    hasTopics={topics.length > 1}
                    onEdit={() => setShowEditModal(true)}
                    onDelete={() => setShowDeleteModal(true)}
                    
                    // Reorder Toggles (Optional visual cues)
                    onReorder={() => setIsReordering(true)}
                    isReordering={isReordering}
                    onCancelReorder={() => setIsReordering(false)}
                    onSaveReorder={() => setIsReordering(false)}
                />

                <TopicGrid 
                    topics={topics}
                    subjectColor={subject.color}
                    isReordering={isReordering} // Pass down if you want visual changes (like dashed borders)
                    
                    onOpenCreateModal={() => { setRetryTopicData(null); setShowTopicModal(true); }}
                    
                    // --- NAVIGATION FIX ---
                    // Restored the /home/ prefix to match your routing
                    onSelectTopic={(t) => navigate(`/home/subject/${subjectId}/topic/${t.id}`)}
                    
                    onDeleteTopic={onDeleteTopicConfirm}
                    onRetryTopic={onRetryTopic}
                    
                    // --- DRAG & DROP HANDLER ---
                    onReorderTopics={handleReorderTopics} 
                />
            </main>

            {/* --- MODALS --- */}
            
            <EditSubjectModal 
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                initialData={subject}
                onSave={(data) => { updateSubject(data); setShowEditModal(false); }}
            />

            <TopicFormModal
                isOpen={showTopicModal}
                onClose={() => setShowTopicModal(false)}
                onSubmit={handleCreateOrRetry}
                initialData={retryTopicData}
            />

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¿Eliminar Asignatura?</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Se eliminarán <strong>{subject.name}</strong> y todos sus temas. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button 
                                onClick={() => setShowDeleteModal(false)} 
                                disabled={isDeleting} 
                                className="px-6 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleDeleteSubject} 
                                disabled={isDeleting} 
                                className="px-6 py-2 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
                            >
                                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />} Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subject;