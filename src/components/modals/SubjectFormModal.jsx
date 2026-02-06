// src/components/modals/SubjectFormModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { MODERN_FILL_COLORS } from '../../utils/subjectConstants';

// Sub-components
import BasicInfoFields from './subject-form/BasicInfoFields';
import TagManager from './subject-form/TagManager';
import AppearanceSection from './subject-form/AppearanceSection';
import StyleSelector from './subject-form/StyleSelector';

const SubjectFormModal = ({ isOpen, onClose, onSave, initialData, isEditing }) => {
    const [formData, setFormData] = useState({ 
        name: '', level: '', grade: '', course: '', 
        color: 'from-blue-400 to-blue-600', icon: 'book', tags: [],
        cardStyle: 'default', modernFillColor: MODERN_FILL_COLORS[0].value
    });

    // 1. Initialize Logic
    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                setFormData({
                    id: initialData.id,
                    name: initialData.name || '',
                    course: initialData.course || '',
                    level: '', grade: '', 
                    color: initialData.color || 'from-blue-400 to-blue-600',
                    icon: initialData.icon || 'book',
                    tags: initialData.tags || [],
                    cardStyle: initialData.cardStyle || 'default',
                    modernFillColor: initialData.fillColor || initialData.modernFillColor || MODERN_FILL_COLORS[0].value
                });
            } else {
                setFormData({ 
                    name: '', level: '', grade: '', course: '', 
                    color: 'from-blue-400 to-blue-600', icon: 'book', tags: [],
                    cardStyle: 'default', modernFillColor: MODERN_FILL_COLORS[0].value
                });
            }
        }
    }, [isOpen, isEditing, initialData]);

    // 2. Auto-generate Course Name
    useEffect(() => {
        if (formData.level && formData.grade) {
            setFormData(prev => ({ ...prev, course: `${prev.grade} ${prev.level}` }));
        }
    }, [formData.level, formData.grade]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
                <div className="relative transform overflow-hidden bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl text-left animate-in fade-in zoom-in duration-200 border border-transparent dark:border-slate-800 transition-colors">
                    
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 transition-colors">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{isEditing ? 'Editar Asignatura' : 'Nueva Asignatura'}</h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        
                        <BasicInfoFields formData={formData} setFormData={setFormData} />
                        
                        <TagManager formData={formData} setFormData={setFormData} />
                        
                        <AppearanceSection formData={formData} setFormData={setFormData} />
                        
                        <StyleSelector formData={formData} setFormData={setFormData} />

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors cursor-pointer">Cancelar</button>
                            <button type="submit" className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 flex items-center gap-2 cursor-pointer transition-colors">
                                <Save className="w-4 h-4" /> {isEditing ? 'Guardar' : 'Crear'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubjectFormModal;