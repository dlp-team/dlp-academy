// src/components/topic/TopicContent.jsx
import React from 'react';
import { Loader2, FileText, Upload, Sparkles } from 'lucide-react';
import FileCard from './FileCard';
import QuizCard from './QuizCard';

const TopicContent = ({ 
    activeTab, 
    topic, 
    uploading, 
    fileInputRef, 
    handleManualUpload, 
    // Props passed down to children
    activeMenuId, setActiveMenuId, renamingId, setRenamingId, tempName, setTempName,
    handleMenuClick, startRenaming, saveRename, deleteFile, handleViewFile, getFileVisuals,
    deleteQuiz, getQuizVisuals, navigate, subjectId, topicId
}) => {
    
    // --- MATERIALS TAB ---
    if (activeTab === 'materials') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topic.status === 'generating' && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-blue-200 dark:border-blue-800 p-8 shadow-sm dark:shadow-md flex flex-col justify-center items-center h-64 animate-pulse">
                        <Loader2 className="w-12 h-12 text-blue-500 dark:text-blue-400 animate-spin mb-4" /><h4 className="font-bold text-2xl text-slate-900 dark:text-slate-100">Generando...</h4>
                    </div>
                )}
                {topic.pdfs?.map((pdf, idx) => (
                    <FileCard 
                        key={pdf.id || idx}
                        file={pdf}
                        topic={topic}
                        activeMenuId={activeMenuId}
                        setActiveMenuId={setActiveMenuId}
                        renamingId={renamingId}
                        setRenamingId={setRenamingId}
                        tempName={tempName}
                        setTempName={setTempName}
                        handleMenuClick={handleMenuClick}
                        startRenaming={startRenaming}
                        saveRename={saveRename}
                        deleteFile={deleteFile}
                        handleViewFile={handleViewFile}
                        getFileVisuals={getFileVisuals}
                    />
                ))}
                {(!topic.pdfs || topic.pdfs.length === 0) && topic.status !== 'generating' && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50"><FileText className="w-12 h-12 mb-3 opacity-20" /><p className="font-medium">Sin materiales</p></div>
                )}
            </div>
        );
    }

    // --- UPLOADS TAB ---
    if (activeTab === 'uploads') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="file" ref={fileInputRef} onChange={handleManualUpload} multiple hidden accept=".pdf,.doc,.docx" />
                <button onClick={() => fileInputRef.current.click()} disabled={uploading} className="h-64 rounded-3xl border-3 border-dashed border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex flex-col justify-center items-center text-center group bg-white dark:bg-slate-900">
                    {uploading ? <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" /> : <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-6 group-hover:scale-110"><Upload className="w-10 h-10 text-indigo-600 dark:text-indigo-400" /></div>}
                    <span className="font-bold text-xl text-slate-700 dark:text-slate-300">{uploading ? 'Subiendo...' : 'Subir Archivo'}</span>
                </button>
                {topic.uploads?.map((upload, idx) => (
                    <FileCard 
                        key={upload.id || idx}
                        file={upload}
                        topic={topic}
                        activeMenuId={activeMenuId}
                        setActiveMenuId={setActiveMenuId}
                        renamingId={renamingId}
                        setRenamingId={setRenamingId}
                        tempName={tempName}
                        setTempName={setTempName}
                        handleMenuClick={handleMenuClick}
                        startRenaming={startRenaming}
                        saveRename={saveRename}
                        deleteFile={deleteFile}
                        handleViewFile={handleViewFile}
                        getFileVisuals={getFileVisuals}
                    />
                ))}
            </div>
        );
    }

    // --- QUIZZES TAB ---
    if (activeTab === 'quizzes') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topic.quizzes?.map((quiz, idx) => (
                    <QuizCard 
                        key={idx}
                        quiz={quiz}
                        activeMenuId={activeMenuId}
                        setActiveMenuId={setActiveMenuId}
                        handleMenuClick={handleMenuClick}
                        deleteQuiz={deleteQuiz}
                        getQuizVisuals={getQuizVisuals}
                        navigate={navigate}
                        subjectId={subjectId}
                        topicId={topicId}
                    />
                ))}
                {(!topic.quizzes || !topic.quizzes.length) && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50"><Sparkles className="w-12 h-12 mb-3 opacity-20" /><p className="font-medium">Sin tests generados</p></div>
                )}
            </div>
        );
    }
    
    return null;
};

export default TopicContent;