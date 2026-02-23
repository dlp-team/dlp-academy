// src/pages/Subject/modals/TopicFormModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TopicFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({ name: '', prompt: '' });
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: initialData?.name || initialData?.title || '',
                prompt: initialData?.prompt || ''
            });
            setFiles([]); // Reset files on open unless we pass cached ones (optional)
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

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
                <div className="relative bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 w-full max-w-lg p-8 flex flex-col items-center animate-in fade-in zoom-in-90 duration-200">
                    <div className="w-full flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight text-center">
                            {isRetry ? 'Reintentar Generación' : 'Crear Nuevo Tema'}
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-gray-300"><X className="w-6 h-6" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="mb-5">
                            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Título</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white text-lg font-medium focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all mb-2" 
                                placeholder="Ej: La Segunda Guerra Mundial" 
                                required 
                                readOnly={isRetry}
                            />
                        </div>
                        <div className="mb-5">
                            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Prompt Personalizado (Opcional)</label>
                            <textarea 
                                value={formData.prompt} 
                                onChange={e => setFormData({...formData, prompt: e.target.value})} 
                                className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white text-lg font-medium focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all h-28 resize-none mb-2" 
                                placeholder="Instrucciones específicas..." 
                            />
                        </div>
                        <div className="mb-5">
                            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Documentos PDF</label>
                            <div 
                                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-900'}`}
                            >
                                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">Arrastra archivos aquí o haz clic</p>
                                <input type="file" multiple accept="application/pdf" onChange={e => handleFiles(e.target.files)} className="hidden" id="file-upload" />
                                <label htmlFor="file-upload" className="mt-2 inline-block px-5 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-all">Seleccionar</label>
                            </div>
                            {files.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                                            <span className="text-lg text-gray-600 dark:text-gray-300 truncate font-medium">{file.name}</span>
                                            <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700"><X className="w-5 h-5" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <button type="button" onClick={onClose} className="w-full py-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-bold text-lg shadow hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-150">Cancelar</button>
                            <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-150">
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