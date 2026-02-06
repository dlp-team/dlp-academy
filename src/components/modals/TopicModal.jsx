// src/components/modals/TopicModal.jsx
import React from 'react';
import { X, Upload } from 'lucide-react';

const TopicModal = ({ 
    isOpen, 
    onClose, 
    formData, 
    setFormData, 
    onSubmit, 
    isFirstTopic,
    files,
    onRemoveFile,
    // Props para el Drag & Drop de archivos
    dragActive,
    handleDrag,
    handleDrop,
    handleFileSelect
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">
                        {isFirstTopic ? 'Crear Primer Tema' : 'Crear Nuevo Tema'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Input Título */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Título del Tema</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
                            placeholder="Física Cuántica"
                        />
                    </div>

                    {/* Input Prompt */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Instrucciones (Prompt)</label>
                        <textarea
                            value={formData.prompt}
                            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none resize-none"
                            rows="3"
                        />
                    </div>

                    {/* Zona de Archivos */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Subir PDFs</label>
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`relative border-3 border-dashed rounded-xl p-8 text-center transition-all ${
                                dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50'
                            }`}
                        >
                            <input
                                type="file"
                                multiple
                                accept=".pdf"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">Arrastra PDFs aquí</p>
                        </div>
                        
                        {/* Lista de archivos subidos */}
                        {files.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                                        <span className="text-sm text-gray-700">{file.name}</span>
                                        <button onClick={() => onRemoveFile(idx)} className="text-red-500">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onSubmit}
                        disabled={!formData.title.trim()}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-xl disabled:opacity-50"
                    >
                        {isFirstTopic ? 'Crear Tema 01' : 'Continuar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopicModal;