// src/components/home/FolderManager.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Share2, Users } from 'lucide-react';
import { COLORS } from '../../utils/subjectConstants';

const FolderManager = ({ isOpen, onClose, onSave, initialData, isEditing, onShare }) => {
    const [formData, setFormData] = useState({ 
        name: '', 
        description: '', 
        color: 'from-amber-400 to-amber-600',
        subjectIds: [],
        tags: [] // NEW: Add tags support
    });
    const [shareEmail, setShareEmail] = useState('');
    const [shareRole, setShareRole] = useState('viewer');
    const [tagInput, setTagInput] = useState(''); // NEW: For tag input

    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                setFormData({
                    id: initialData.id,
                    name: initialData.name || '',
                    description: initialData.description || '',
                    color: initialData.color || 'from-amber-400 to-amber-600',
                    subjectIds: initialData.subjectIds || [],
                    tags: initialData.tags || [] // NEW: Load existing tags
                });
            } else {
                setFormData({ 
                    name: '', 
                    description: '', 
                    color: 'from-amber-400 to-amber-600',
                    subjectIds: [],
                    tags: [] // NEW: Empty tags for new folder
                });
            }
            setShareEmail('');
            setShareRole('viewer');
            setTagInput(''); // NEW: Reset tag input
        }
    }, [isOpen, isEditing, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleShare = (e) => {
        e.preventDefault();
        if (shareEmail.trim() && isEditing && initialData) {
            onShare(initialData.id, shareEmail.trim(), shareRole);
            setShareEmail('');
        }
    };

    // NEW: Tag management functions
    const handleAddTag = (e) => {
        e.preventDefault();
        const tag = tagInput.trim().toLowerCase();
        if (tag && !formData.tags.includes(tag)) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tag]
            });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag(e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
                <div className="relative transform overflow-hidden bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl text-left animate-in fade-in zoom-in duration-200 border border-transparent dark:border-slate-800 transition-colors">
                    
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 transition-colors">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {isEditing ? 'Editar Carpeta' : 'Nueva Carpeta'}
                        </h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nombre de la Carpeta
                            </label>
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors" 
                                placeholder="Ej: Matemáticas Avanzadas"
                                required 
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Descripción (Opcional)
                            </label>
                            <input 
                                type="text" 
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors" 
                                placeholder="Ej: Asignaturas de ciencias"
                            />
                        </div>

                        {/* Colors */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Color de la Carpeta
                            </label>
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

                        {/* NEW: Tags Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Etiquetas (Opcional)
                            </label>
                            
                            {/* Tag Input */}
                            <div className="flex gap-2 mb-2">
                                <input 
                                    type="text" 
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagInputKeyDown}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors text-sm" 
                                    placeholder="Añadir etiqueta..."
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    disabled={!tagInput.trim()}
                                    className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            {/* Tag List */}
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map(tag => (
                                        <div 
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                                        >
                                            <span>#{tag}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Share Section - Only for existing folders */}
                        {isEditing && initialData?.isOwner && (
                            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Share2 size={16} className="text-gray-600 dark:text-gray-400" />
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Compartir Carpeta
                                    </label>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input 
                                            type="email" 
                                            value={shareEmail}
                                            onChange={(e) => setShareEmail(e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors text-sm" 
                                            placeholder="email@ejemplo.com"
                                        />
                                        <select
                                            value={shareRole}
                                            onChange={(e) => setShareRole(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors text-sm cursor-pointer"
                                        >
                                            <option value="viewer">Ver</option>
                                            <option value="editor">Editar</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleShare}
                                            disabled={!shareEmail.trim()}
                                            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    {/* Shared With List */}
                                    {initialData?.sharedWith && initialData.sharedWith.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Compartida con:</p>
                                            {initialData.sharedWith.map((share, idx) => (
                                                <div 
                                                    key={idx}
                                                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Users size={14} className="text-gray-400" />
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                                            {share.email}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            ({share.role === 'viewer' ? 'Ver' : 'Editar'})
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {/* Handle unshare */}}
                                                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                                <Save className="w-4 h-4" /> {isEditing ? 'Guardar' : 'Crear'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FolderManager;