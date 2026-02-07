// src/pages/Topic.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import Header from '../components/layout/Header';
import { useTopicLogic } from '../hooks/useTopicLogic';

// UI Components
import TopicHeader from '../components/topic/TopicHeader';
import TopicTabs from '../components/topic/TopicTabs';
import TopicContent from '../components/topic/TopicContent';
import TopicModals from '../components/topic/TopicModals';

const Topic = ({ user }) => {
    // 1. Initialize Logic
    const logic = useTopicLogic(user);

    // 2. Loading State
    if (!user || logic.loading || !logic.topic || !logic.subject) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    // 3. Render
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <TopicHeader 
                    subject={logic.subject}
                    topic={logic.topic}
                    subjectId={logic.subjectId}
                    navigate={logic.navigate}
                    showMenu={logic.showMenu}
                    setShowMenu={logic.setShowMenu}
                    isEditingTopic={logic.isEditingTopic}
                    setIsEditingTopic={logic.setIsEditingTopic}
                    editTopicData={logic.editTopicData}
                    setEditTopicData={logic.setEditTopicData}
                    handleSaveTopicTitle={logic.handleSaveTopicTitle}
                    handleGenerateQuizSubmit={logic.handleGenerateQuizSubmit}
                    handleDeleteTopic={logic.handleDeleteTopic}
                />

                <TopicTabs 
                    activeTab={logic.activeTab}
                    setActiveTab={logic.setActiveTab}
                    topic={logic.topic}
                    handleCreateCustomPDF={logic.handleCreateCustomPDF}
                    handleCreateCustomQuiz={logic.handleCreateCustomQuiz}
                />

                <TopicContent 
                    activeTab={logic.activeTab}
                    topic={logic.topic}
                    uploading={logic.uploading}
                    fileInputRef={logic.fileInputRef}
                    handleManualUpload={logic.handleManualUpload}
                    // Pass down specific handlers and state
                    activeMenuId={logic.activeMenuId}
                    setActiveMenuId={logic.setActiveMenuId}
                    renamingId={logic.renamingId}
                    setRenamingId={logic.setRenamingId}
                    tempName={logic.tempName}
                    setTempName={logic.setTempName}
                    handleMenuClick={logic.handleMenuClick}
                    startRenaming={logic.startRenaming}
                    saveRename={logic.saveRename}
                    deleteFile={logic.deleteFile}
                    handleViewFile={logic.handleViewFile}
                    getFileVisuals={logic.getFileVisuals}
                    deleteQuiz={logic.deleteQuiz}
                    getQuizVisuals={logic.getQuizVisuals}
                    navigate={logic.navigate}
                    subjectId={logic.subjectId}
                    topicId={logic.topicId}
                />
            </main>

            <TopicModals 
                toast={logic.toast}
                setToast={logic.setToast}
                showQuizModal={logic.showQuizModal}
                setShowQuizModal={logic.setShowQuizModal}
                handleGenerateQuizSubmit={logic.handleGenerateQuizSubmit}
                quizFormData={logic.quizFormData}
                setQuizFormData={logic.setQuizFormData}
                isGeneratingQuiz={logic.isGeneratingQuiz}
                topic={logic.topic}
                showContentModal={logic.showContentModal}
                setShowContentModal={logic.setShowContentModal}
                handleGenerateContentSubmit={logic.handleGenerateContentSubmit}
                contentFormData={logic.contentFormData}
                setContentFormData={logic.setContentFormData}
                isGeneratingContent={logic.isGeneratingContent}
                viewingFile={logic.viewingFile}
                setViewingFile={logic.setViewingFile}
                getFileVisuals={logic.getFileVisuals}
            />
        </div>
    );
};

export default Topic;