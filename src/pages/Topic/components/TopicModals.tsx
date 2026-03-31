// src/pages/Topic/components/TopicModals.jsx
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import AppToast from '../../../components/ui/AppToast';
import QuizModal from '../../../components/modals/QuizModal';           // Check relative path
import CreateContentModal from '../../../components/modals/CreateContentModal'; // Check relative path
import TopicConfirmDeleteModal from './TopicConfirmDeleteModal';

const VIEWER_TIMEOUT_MS = 12000;

const TopicFileViewerModal = ({ viewingFile, onClose, topicColor, getFileVisuals }: any) => {
    const [viewerState, setViewerState] = useState('loading');
    const [viewerReloadToken, setViewerReloadToken] = useState(0);
    const viewerKey = `${viewingFile?.url || 'no-file'}-${viewerReloadToken}`;
    const { icon: HeaderIcon } = getFileVisuals(viewingFile?.type);

    useEffect(() => {
        if (viewerState !== 'loading') return;

        const timeoutId = setTimeout(() => {
            setViewerState('error');
        }, VIEWER_TIMEOUT_MS);

        return () => clearTimeout(timeoutId);
    }, [viewerState, viewerKey]);

    const retryViewer = () => {
        setViewerState('loading');
        setViewerReloadToken((prev) => prev + 1);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className={`relative w-full max-w-6xl h-[90vh] rounded-3xl p-1 shadow-2xl flex flex-col bg-gradient-to-br ${topicColor || 'from-indigo-500 to-purple-600'}`}>
                <div className="flex-1 w-full h-full bg-slate-900 rounded-2xl overflow-hidden flex flex-col">
                    <div className={`flex justify-between items-center px-6 py-4 bg-gradient-to-r ${topicColor || 'from-indigo-500 to-purple-600'}`}>
                        <span className="font-bold text-white flex items-center gap-2 text-lg tracking-tight">
                            <HeaderIcon className="w-5 h-5 text-white/90" />
                            {viewingFile.name}
                        </span>
                        <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="flex-1 bg-white relative overflow-hidden">
                        {viewerState === 'loading' && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-900/85 text-white">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                <p className="text-sm font-semibold">Cargando vista previa...</p>
                                <p className="text-xs text-slate-300">Si tarda demasiado, puedes descargar el archivo.</p>
                            </div>
                        )}

                        {viewerState === 'error' && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/90 p-6">
                                <div className="w-full max-w-md rounded-2xl border border-rose-300/60 bg-white/95 p-5 text-slate-900 shadow-2xl">
                                    <p className="text-sm font-black text-rose-700">No se pudo cargar la vista previa</p>
                                    <p className="mt-2 text-xs font-medium text-slate-600">
                                        El archivo puede estar bloqueado por el navegador o no ser compatible con el visor integrado.
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                            onClick={retryViewer}
                                            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                                        >
                                            Reintentar visor
                                        </button>
                                        <a
                                            href={viewingFile.url}
                                            download={viewingFile.name || 'documento.pdf'}
                                            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                                        >
                                            Descargar archivo
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        <iframe
                            key={viewerKey}
                            src={viewingFile.url}
                            className={`w-full h-full border-0 transition-opacity duration-300 ${viewerState === 'ready' ? 'opacity-100' : 'opacity-0'}`}
                            title="Visor"
                            onLoad={() => setViewerState('ready')}
                            onError={() => setViewerState('error')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const TopicModals = ({
    toast,
    setToast,
    showQuizModal,
    setShowQuizModal,
    handleGenerateQuizSubmit,
    quizFormData,
    setQuizFormData,
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
    topicId,
    confirmDialog,
    isConfirmingAction,
    closeConfirmDialog,
    confirmDeleteAction,
}: any) => {
    return (
        <>
            <AppToast show={toast.show} message={toast.message} onClose={() => setToast({ show: false, message: '' })} />

            <QuizModal
                isOpen={showQuizModal}
                onClose={() => setShowQuizModal(false)}
                onSubmit={handleGenerateQuizSubmit}
                formData={quizFormData}
                setFormData={setQuizFormData}
                themeColor={subject?.color}
                subjectId={subjectId}
                topicId={topicId}
                onToast={setToast}
            />
            
            <CreateContentModal
                isOpen={showContentModal}
                onClose={() => setShowContentModal(false)}
                onSubmit={handleGenerateContentSubmit}
                formData={contentFormData}
                setFormData={setContentFormData}
                isGenerating={isGeneratingContent}
                themeColor={subject?.color}
                subjectId={subjectId}
                topicId={topicId}
            />

            <TopicConfirmDeleteModal
                confirmDialog={confirmDialog}
                isConfirmingAction={isConfirmingAction}
                onClose={closeConfirmDialog}
                onConfirm={confirmDeleteAction}
            />

            {viewingFile && (
                <TopicFileViewerModal
                    key={viewingFile.id || viewingFile.url || 'topic-file-viewer'}
                    viewingFile={viewingFile}
                    onClose={() => setViewingFile(null)}
                    topicColor={topic?.color}
                    getFileVisuals={getFileVisuals}
                />
            )}
        </>
    );
};

export default TopicModals;