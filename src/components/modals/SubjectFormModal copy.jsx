// src/components/modals/SubjectFormModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { ICON_MAP, ICON_KEYS, COLORS, EDUCATION_LEVELS, MODERN_FILL_COLORS } from '../../utils/subjectConstants';



const SubjectFormModal = ({ isOpen, onClose, onSave, initialData, isEditing }) => {
    const [formData, setFormData] = useState({ 
        name: '', 
        level: '', 
        grade: '', 
        course: '', 
        color: 'from-blue-400 to-blue-600', 
        icon: 'book', 
        tags: [],
        cardStyle: 'default',
        modernFillColor: MODERN_FILL_COLORS[0].value
    });
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                setFormData({
                    id: initialData.id,
                    name: initialData.name || '',
                    course: initialData.course || '',
                    level: '', 
                    grade: '', 
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
                    cardStyle: 'default',
                    modernFillColor: MODERN_FILL_COLORS[0].value
                });
            }
            setTagInput('');
        }
    }, [isOpen, isEditing, initialData]);

    useEffect(() => {
        if (formData.level && formData.grade) {
            setFormData(prev => ({ ...prev, course: `${prev.grade} ${prev.level}` }));
        }
    }, [formData.level, formData.grade]);

    const handleAddTag = (e) => {
        if ((e.key === 'Enter' || e.type === 'click') && tagInput.trim()) {
            e.preventDefault();
            addTag(tagInput.trim());
        }
    };

    const addTag = (tag) => {
        if (!formData.tags.includes(tag)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
        }
        setTagInput('');
    };

    const removeTag = (tag) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
                <div className="relative transform overflow-hidden bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl text-left animate-in fade-in zoom-in duration-200 border border-transparent dark:border-slate-800 transition-colors">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 transition-colors">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{isEditing ? 'Editar Asignatura' : 'Nueva Asignatura'}</h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors" 
                                placeholder="Ej: Matemáticas"
                                required 
                            />
                        </div>

                        {/* Course Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Curso Académico</label>
                            <div className="grid grid-cols-2 gap-3">
                                <select 
                                    value={formData.level} 
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value, grade: '' })} 
                                    className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white cursor-pointer transition-colors"
                                >
                                    <option value="" className="dark:bg-slate-800">Nivel</option>
                                    {Object.keys(EDUCATION_LEVELS).map(l => <option key={l} value={l} className="dark:bg-slate-800">{l}</option>)}
                                </select>
                                <select 
                                    value={formData.grade} 
                                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })} 
                                    disabled={!formData.level} 
                                    className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-slate-800/50 dark:disabled:text-gray-500 enabled:cursor-pointer transition-colors"
                                >
                                    <option value="" className="dark:bg-slate-800">Curso</option>
                                    {formData.level && EDUCATION_LEVELS[formData.level].map(g => <option key={g} value={g} className="dark:bg-slate-800">{g}</option>)}
                                </select>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Actual: {formData.course || 'Selecciona nivel y curso'}</p>
                        </div>

                        {/* Tags */}
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
                                <button type="button" onClick={(e) => handleAddTag(e)} className="px-3 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 cursor-pointer transition-colors"><Plus size={20} /></button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.tags.map(tag => (
                                    <span key={tag} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-indigo-100 dark:border-indigo-800/50 transition-colors">
                                        #{tag} <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 dark:hover:text-red-400"><X size={12} /></button>
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

                        {/* Icons */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icono</label>
                            <div className="grid grid-cols-6 gap-2">
                                {ICON_KEYS.map((key) => {
                                    const Icon = ICON_MAP[key];
                                    return (
                                        <button 
                                            key={key} 
                                            type="button" 
                                            onClick={() => setFormData({...formData, icon: key})} 
                                            className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                                                formData.icon === key 
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500 dark:ring-indigo-400' 
                                                    : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Colors */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color del Tema</label>
                            <div className="grid grid-cols-6 gap-3">
                                {COLORS.map((color) => (
                                    <button 
                                        key={color} 
                                        type="button" 
                                        onClick={() => setFormData({...formData, color})} 
                                        className={`w-full aspect-square rounded-full bg-gradient-to-br ${color} transition-transform hover:scale-105 ${
                                            formData.color === color 
                                                ? 'ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-indigo-500 dark:ring-indigo-400 scale-105' 
                                                : 'cursor-pointer'
                                        }`} 
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Card Style Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estilo de Tarjeta</label>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Classic Style */}
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, cardStyle: 'default'})}
                                    className={`relative p-3 rounded-xl border transition-all duration-200 group ${
                                        formData.cardStyle === 'default' 
                                            ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 dark:ring-indigo-400/20 bg-indigo-50 dark:bg-indigo-900/20' 
                                            : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer'
                                    }`}
                                >
                                    <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${formData.color} shadow-sm mb-2`}></div>
                                    <span className={`text-sm font-medium ${
                                        formData.cardStyle === 'default' 
                                            ? 'text-indigo-700 dark:text-indigo-300' 
                                            : 'text-gray-600 dark:text-gray-400'
                                    }`}>Clásico</span>
                                </button>

                                {/* Modern Style */}
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, cardStyle: 'modern'})}
                                    className={`relative p-3 rounded-xl border transition-all duration-200 group ${
                                        formData.cardStyle === 'modern' 
                                            ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 dark:ring-indigo-400/20 bg-indigo-50 dark:bg-indigo-900/20' 
                                            : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer'
                                    }`}
                                >
                                    <div className={`w-full h-12 rounded-lg p-[2px] bg-gradient-to-br ${formData.color} shadow-sm mb-2`}>
                                        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[6px]"></div>
                                    </div>
                                    <span className={`text-sm font-medium ${
                                        formData.cardStyle === 'modern' 
                                            ? 'text-indigo-700 dark:text-indigo-300' 
                                            : 'text-gray-600 dark:text-gray-400'
                                    }`}>Moderno</span>
                                </button>
                            </div>
                        </div>

                        {/* Fill Color Selector - Only shown for Modern style */}
                        {formData.cardStyle === 'modern' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color de Fondo (Moderno)</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {MODERN_FILL_COLORS.map((fillColor) => (
                                        <button
                                            key={fillColor.value}
                                            type="button"
                                            onClick={() => setFormData({...formData, modernFillColor: fillColor.value})}
                                            className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                                                formData.modernFillColor === fillColor.value
                                                    ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 dark:ring-indigo-400/20'
                                                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 cursor-pointer'
                                            }`}
                                        >
                                            <div className={`h-12 ${fillColor.value} transition-transform group-hover:scale-105`}></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-[9px] font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                                    {fillColor.name}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    El color de fondo aparece dentro de la tarjeta con el estilo moderno
                                </p>
                            </div>
                        )}

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