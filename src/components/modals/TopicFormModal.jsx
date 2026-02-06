// src/components/modals/TopicFormModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TopicFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({ title: '', prompt: '' });
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || { title: '', prompt: '' });
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-xl animate-in fade-in zoom-in duration-200">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-900">{isRetry ? 'Reintentar Generación' : 'Crear Nuevo Tema'}</h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input 
                                type="text" 
                                value={formData.title} 
                                onChange={e => setFormData({...formData, title: e.target.value})} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                                placeholder="Ej: La Segunda Guerra Mundial" 
                                required 
                                readOnly={isRetry} // Cannot change title on retry usually
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Personalizado (Opcional)</label>
                            <textarea 
                                value={formData.prompt} 
                                onChange={e => setFormData({...formData, prompt: e.target.value})} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none" 
                                placeholder="Instrucciones específicas..." 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Documentos PDF</label>
                            <div 
                                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
                            >
                                <p className="text-gray-500">Arrastra archivos aquí o haz clic</p>
                                <input type="file" multiple accept="application/pdf" onChange={e => handleFiles(e.target.files)} className="hidden" id="file-upload" />
                                <label htmlFor="file-upload" className="mt-2 inline-block px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Seleccionar</label>
                            </div>
                            {files.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm text-gray-600 truncate">{file.name}</span>
                                            <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancelar</button>
                            <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200">
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