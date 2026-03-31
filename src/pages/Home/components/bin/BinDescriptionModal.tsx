// src/pages/Home/components/bin/BinDescriptionModal.jsx
import React from 'react';
import {
    Info, XCircle, Loader2, BookOpen,
    FileText, CheckSquare, ChevronRight, ChevronDown,
} from 'lucide-react';

const BinDescriptionModal = ({
    descriptionModal,
    loadingDescription,
    expandedTopics,
    onClose,
    onToggleTopic,
}: any) => {
    if (!descriptionModal) return null;
    const { subject, topics } = descriptionModal;

    return (
        <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[60] p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Info className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{subject.name}</h3>
                            <p className="text-blue-100 text-sm">Contenido de la asignatura</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-colors"
                    >
                        <XCircle className="text-white" size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                    {loadingDescription ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : topics.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="font-medium">No hay temas en esta asignatura</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topics.map((topic, index: any) => {
                                const isExpanded   = expandedTopics[topic.id];
                                const hasDocuments = topic.documents?.length > 0;
                                const hasQuizzes   = topic.quizzes?.length > 0;
                                const hasContent   = hasDocuments || hasQuizzes;

                                return (
                                    <div
                                        key={topic.id}
                                        className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden"
                                    >
                                        <button
                                            onClick={() => onToggleTopic(topic.id)}
                                            className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-900/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                                                    {topic.number || index + 1}
                                                </span>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-semibold text-gray-900 dark:text-white">{topic.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {topic.documents?.length || 0} documentos, {topic.quizzes?.length || 0} cuestionarios
                                                </p>
                                            </div>
                                            {hasContent && (
                                                <div className="flex-shrink-0">
                                                    {isExpanded
                                                        ? <ChevronDown className="text-gray-400" size={20} />
                                                        : <ChevronRight className="text-gray-400" size={20} />
                                                    }
                                                </div>
                                            )}
                                        </button>

                                        {isExpanded && hasContent && (
                                            <div className="p-4 bg-white dark:bg-slate-900 space-y-4">
                                                {hasDocuments && (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FileText className="text-gray-400" size={16} />
                                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                Documentos ({topic.documents.length})
                                                            </h4>
                                                        </div>
                                                        <div className="space-y-1 pl-6">
                                                            {topic.documents.map(docItem => (
                                                                <div key={docItem.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 py-1">
                                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                                                    <span>{docItem.name || 'Documento sin nombre'}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {hasQuizzes && (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <CheckSquare className="text-gray-400" size={16} />
                                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                Cuestionarios ({topic.quizzes.length})
                                                            </h4>
                                                        </div>
                                                        <div className="space-y-1 pl-6">
                                                            {topic.quizzes.map(quizItem => (
                                                                <div key={quizItem.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 py-1">
                                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                                                    <span>{quizItem.title || 'Cuestionario sin titulo'}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BinDescriptionModal;