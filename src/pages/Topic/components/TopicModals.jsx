// src/pages/Topic/components/TopicModals.jsx
import React from 'react';
import { X } from 'lucide-react';
import AppToast from '../../../components/ui/AppToast';
import QuizModal from '../../../components/modals/QuizModal';           // Check relative path
import CreateContentModal from '../../../components/modals/CreateContentModal'; // Check relative path

const TopicModals = ({
    toast,
    setToast,
    showQuizModal,
    setShowQuizModal,
    handleGenerateQuizSubmit,
    quizFormData,
    setQuizFormData,
    isGeneratingQuiz,
    topic,
    subject,
    showContentModal,
    setShowContentModal,
    handleGenerateContentSubmit,
    contentFormData,
    setContentFormData,
    isGeneratingContent,
    viewingFile,
    setViewingFile,
    getFileVisuals,
    subjectId,
    topicId
}) => {
    return (
        <>
            <AppToast show={toast.show} message={toast.message} onClose={() => setToast({ show: false, message: '' })} />

            <QuizModal 
                isOpen={showQuizModal} 
                onClose={() => setShowQuizModal(false)} 
                onSubmit={handleGenerateQuizSubmit} 
                formData={quizFormData} 
                setFormData={setQuizFormData} 
                isGenerating={isGeneratingQuiz} 
                themeColor={subject?.color} 
                subjectId={subjectId}
                topicId={topicId}
            />
            
            <CreateContentModal 
                isOpen={showContentModal}
                onClose={() => setShowContentModal(false)}
                onSubmit={handleGenerateContentSubmit}
                formData={contentFormData}
                setFormData={setContentFormData}
                isGenerating={isGeneratingContent}
            />

            {viewingFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className={`relative w-full max-w-6xl h-[90vh] rounded-3xl p-1 shadow-2xl flex flex-col bg-gradient-to-br ${topic.color || 'from-indigo-500 to-purple-600'}`}>
                        <div className="flex-1 w-full h-full bg-slate-900 rounded-2xl overflow-hidden flex flex-col">
                            <div className={`flex justify-between items-center px-6 py-4 bg-gradient-to-r ${topic.color || 'from-indigo-500 to-purple-600'}`}>
                                <span className="font-bold text-white flex items-center gap-2 text-lg tracking-tight">
                                    {(() => { const { icon: HeaderIcon } = getFileVisuals(viewingFile.type); return <><HeaderIcon className="w-5 h-5 text-white/90" /> {viewingFile.name}</>; })()}
                                </span>
                                <button onClick={() => setViewingFile(null)} className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="flex-1 bg-white relative"><iframe src={viewingFile.url} className="w-full h-full" title="Visor" /></div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TopicModals;