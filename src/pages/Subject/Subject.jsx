import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';

// Hooks
import { useSubjectManager } from './hooks/useSubjectManager';

// Layout
import Header from '../../components/layout/Header';
import SubjectHeader from './components/SubjectHeader';
import TopicGrid from './components/TopicGrid';

// Modals
import EditSubjectModal from '../Home/modals/EditSubjectModal';
import TopicFormModal from './modals/TopicFormModal';
import EditTopicModal from './modals/EditTopicModal';

const Subject = ({ user }) => {
    const params = useParams();
    const subjectId = params.subjectId || params.id; 
    const navigate = useNavigate();
    
    // Data Logic
    const { 
        subject, topics, loading, 
        updateSubject, deleteSubject, 
        createTopic, deleteTopic, 
        handleReorderTopics,
        updateTopic // NEW
    } = useSubjectManager(user, subjectId);

    // UI State
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showTopicModal, setShowTopicModal] = useState(false);
    
    // NEW: Edit Topic Modal State
    const [showEditTopicModal, setShowEditTopicModal] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);

    const [retryTopicData, setRetryTopicData] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTopics = useMemo(() => {
        if (!searchTerm) return topics;
        const term = searchTerm.toLowerCase();
        return topics.filter(topic => 
            topic.title?.toLowerCase().includes(term) || 
            topic.number?.toString().toLowerCase().includes(term)
        );
    }, [topics, searchTerm]);

    // Handlers
    const handleCreateOrRetry = async (data, files) => {
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

    // NEW: Handle opening edit modal
    const handleEditTopicClick = (topic) => {
        setEditingTopic(topic);
        setShowEditTopicModal(true);
    };

    // NEW: Handle saving edited topic
    const handleSaveEditedTopic = async (updatedData) => {
        await updateTopic(updatedData.id, {
            title: updatedData.title,
            order: updatedData.order,
            number: updatedData.number,
            isVisible: updatedData.isVisible
        });
        setShowEditTopicModal(false);
        setEditingTopic(null);
    };

    const handleDeleteSubject = async () => {
        setIsDeleting(true);
        await deleteSubject(); 
    };

    // Scroll Lock
    useEffect(() => {
        document.body.style.overflow = (showEditModal || showDeleteModal || showTopicModal || showEditTopicModal) ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showEditModal, showDeleteModal, showTopicModal, showEditTopicModal]);

    if (!user || loading || !subject) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
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
                    onReorder={() => setIsReordering(true)}
                    isReordering={isReordering}
                    onCancelReorder={() => setIsReordering(false)}
                    onSaveReorder={() => setIsReordering(false)}
                    searchTerm={searchTerm}
                    onSearch={setSearchTerm}
                />

                <TopicGrid 
                    topics={filteredTopics}
                    subjectColor={subject.color}
                    isReordering={isReordering} 
                    onOpenCreateModal={() => { setRetryTopicData(null); setShowTopicModal(true); }}
                    onSelectTopic={(t) => navigate(`/home/subject/${subjectId}/topic/${t.id}`)}
                    onDeleteTopic={onDeleteTopicConfirm}
                    onRetryTopic={onRetryTopic}
                    onReorderTopics={handleReorderTopics} 
                    
                    // NEW PROP passed down
                    onEditTopic={handleEditTopicClick}
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

            {/* NEW: Edit Topic Modal */}
            <EditTopicModal
                isOpen={showEditTopicModal}
                onClose={() => setShowEditTopicModal(false)}
                topic={editingTopic}
                onSave={handleSaveEditedTopic}
            />

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¿Eliminar Asignatura?</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Se eliminarán <strong>{subject.name}</strong> y todos sus temas.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setShowDeleteModal(false)} className="px-6 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl font-medium">Cancelar</button>
                            <button onClick={handleDeleteSubject} disabled={isDeleting} className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subject;