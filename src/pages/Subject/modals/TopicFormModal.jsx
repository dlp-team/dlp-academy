// src/pages/Subject/modals/TopicFormModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, FileText, Upload, MessageSquare, Type, Trash2, CloudUpload } from 'lucide-react';

const TopicFormModal = ({ isOpen, onClose, onSubmit, initialData, subjectColor }) => {
    const [formData, setFormData] = useState({ name: '', prompt: '' });
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: initialData?.name || initialData?.title || '',
                prompt: initialData?.prompt || ''
            });
            setFiles([]);
        }
    }, [isOpen, initialData]);

    const handleDrag = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    };

    const handleFiles = (fileList) => {
        const newFiles = Array.from(fileList).filter(f => f.type === 'application/pdf');
        setFiles(prev => [...prev, ...newFiles]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData, files);
    };

    if (!isOpen) return null;

    const isRetry = !!initialData?.id;

    // Extract base color name from subject gradient (e.g. "from-blue-400 to-blue-600" → "blue")
    const baseColor = subjectColor?.match(/from-(\w+)-/)?.[1] || 'indigo';
    const headerGradient = subjectColor || 'from-indigo-400 to-indigo-600';

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <style>{`
                @keyframes app-open-backdrop {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                @keyframes app-open-modal {
                    0% {
                        opacity: 0;
                        transform: scale(0.65);
                    }
                    40% {
                        opacity: 1;
                        transform: scale(1.03);
                    }
                    70% {
                        transform: scale(0.985);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .app-open-backdrop {
                    animation: app-open-backdrop 0.25s ease-out forwards;
                }
                .app-open-modal {
                    animation: app-open-modal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="app-open-backdrop fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="app-open-modal relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl dark:shadow-black/40">

                    {/* --- GRADIENT HEADER --- */}
                    <div className={`relative px-8 pt-8 pb-6 bg-gradient-to-br ${isRetry ? 'from-amber-500 to-orange-600' : headerGradient} overflow-hidden`}>
                        {/* Decorative blurred circles */}
                        <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-36 h-36 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white/80 hover:text-white transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Badge */}
                        <div className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 mb-4 shadow-lg">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                {isRetry ? 'Reintentar' : 'AI Power'}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="relative text-2xl font-black text-white tracking-tight">
                            {isRetry ? 'Reintentar Generacion' : 'Crear Nuevo Tema'}
                        </h3>
                        <p className="relative text-sm text-white/70 mt-1 font-medium">
                            {isRetry
                                ? 'Vuelve a generar el contenido de este tema'
                                : 'La IA generara materiales y tests automaticamente'
                            }
                        </p>
                    </div>

                    {/* --- FORM BODY --- */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">

                        {/* Title field */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                <Type className="w-4 h-4 text-indigo-500" />
                                Titulo del tema
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white text-base font-medium focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="Ej: La Segunda Guerra Mundial"
                                required
                                readOnly={isRetry}
                                autoFocus={!isRetry}
                            />
                        </div>

                        {/* Prompt field */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                <MessageSquare className="w-4 h-4 text-violet-500" />
                                Prompt personalizado
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 normal-case tracking-normal ml-1">(Opcional)</span>
                            </label>
                            <textarea
                                value={formData.prompt}
                                onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white text-base font-medium focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 h-24 resize-none"
                                placeholder="Ej: Centrarse en las causas economicas y sociales..."
                            />
                        </div>

                        {/* File upload */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                <FileText className="w-4 h-4 text-rose-500" />
                                Documentos PDF
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 normal-case tracking-normal ml-1">(Opcional)</span>
                            </label>
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                                    dragActive
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]'
                                        : 'border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/30 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'
                                }`}
                            >
                                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-colors ${
                                    dragActive
                                        ? 'bg-indigo-100 dark:bg-indigo-800/50'
                                        : 'bg-gray-100 dark:bg-slate-700/50'
                                }`}>
                                    <CloudUpload className={`w-6 h-6 transition-colors ${
                                        dragActive
                                            ? 'text-indigo-600 dark:text-indigo-400'
                                            : 'text-gray-400 dark:text-gray-500'
                                    }`} />
                                </div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    Arrastra archivos aqui
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    o haz clic para seleccionar PDF
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="application/pdf"
                                    onChange={e => handleFiles(e.target.files)}
                                    className="hidden"
                                />
                            </div>

                            {/* File list */}
                            {files.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {files.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700/50 group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                                            </div>
                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1 font-medium">
                                                {file.name}
                                            </span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                                                {(file.size / 1024 / 1024).toFixed(1)} MB
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* --- ACTION BUTTONS --- */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3.5 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className={`flex-[2] py-3.5 rounded-2xl bg-gradient-to-r ${
                                    isRetry
                                        ? 'from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40'
                                        : `${headerGradient} shadow-lg shadow-black/15 hover:shadow-black/25`
                                } text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]`}
                            >
                                <Sparkles className="w-4 h-4" />
                                {isRetry ? 'Reintentar' : 'Crear Tema'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TopicFormModal;
