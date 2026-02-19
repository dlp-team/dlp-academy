// src/pages/Subject/modals/EditTopicModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff, ListOrdered, Type } from 'lucide-react';

const EditTopicModal = ({ isOpen, onClose, topic, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        order: '',
        isVisible: true
    });

    useEffect(() => {
        if (topic) {
            setFormData({
                title: topic.title || '',
                order: topic.order || 0,
                // Default to true if undefined
                isVisible: topic.isVisible !== undefined ? topic.isVisible : true
            });
        }
    }, [topic, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            ...topic, 
            ...formData,
            // Update the display number if order changed (optional logic)
            number: formData.order.toString().padStart(2, '0') 
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                    onClick={onClose} 
                />
                
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Editar Tema</h3>
                        <button 
                            onClick={onClose} 
                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        
                        {/* Title Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Type className="w-4 h-4" /> Título del Tema
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Order Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <ListOrdered className="w-4 h-4" /> Orden
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.order}
                                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                />
                            </div>

                            {/* Visibility Toggle */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    {formData.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />} 
                                    Visibilidad
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, isVisible: !formData.isVisible})}
                                    className={`w-full px-4 py-2 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                                        formData.isVisible
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                                            : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400'
                                    }`}
                                >
                                    {formData.isVisible ? 'Visible' : 'Oculto'}
                                </button>
                            </div>
                        </div>

                        {/* Info Note */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                            Si ocultas el tema, los estudiantes no podrán verlo en su panel, pero tú seguirás teniendo acceso para editarlo.
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-transform active:scale-95"
                            >
                                <Save className="w-4 h-4" /> Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditTopicModal;