// src/components/modals/subject-form/TagManager.jsx
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const TagManager = ({ formData, setFormData }) => {
    const [tagInput, setTagInput] = useState('');

    const addTag = (tag) => {
        if (!formData.tags.includes(tag)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
        }
        setTagInput('');
    };

    const handleAddTag = (e) => {
        if ((e.key === 'Enter' || e.type === 'click') && tagInput.trim()) {
            e.preventDefault();
            addTag(tagInput.trim());
        }
    };

    const removeTag = (tag) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    // Recommended tags logic
    const getRecommendedTags = () => {
        const lvl = formData.level;
        if (!lvl) return [];
        
        const trimestres = ['1º Trimestre', '2º Trimestre', '3º Trimestre'];
        const cuatrimestres = ['1º Cuatrimestre', '2º Cuatrimestre'];

        if (['Primaria', 'ESO', 'Bachillerato'].some(l => lvl.includes(l))) {
            return trimestres;
        }
        if (['Universidad', 'FP', 'Grado', 'Master'].some(l => lvl.includes(l))) {
            return cuatrimestres;
        }
        return [];
    };

    const recommendedTags = getRecommendedTags().filter(tag => !formData.tags.includes(tag));

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Etiquetas</label>
            <div className="flex gap-2 mb-2">
                <input 
                    type="text" 
                    value={tagInput} 
                    onChange={(e) => setTagInput(e.target.value)} 
                    onKeyDown={handleAddTag} 
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors" 
                    placeholder="Añadir etiqueta..." 
                />
                <button type="button" onClick={handleAddTag} className="px-3 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 cursor-pointer transition-colors"><Plus size={20} /></button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map(tag => (
                    <span key={tag} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-indigo-100 dark:border-indigo-800/50 transition-colors">
                        #{tag} <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 dark:hover:text-red-400 cursor-pointer"><X size={12} /></button>
                    </span>
                ))}
            </div>

            {recommendedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 animate-fadeIn">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">Sugeridos:</span>
                    {recommendedTags.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => addTag(tag)}
                            className="text-xs px-2 py-1 rounded-full border border-dashed border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors cursor-pointer"
                        >
                            + {tag}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TagManager;