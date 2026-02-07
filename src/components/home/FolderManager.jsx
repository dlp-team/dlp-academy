// src/components/home/FolderManager.jsx
import React, { useState, useEffect } from 'react';
import { X, Folder, Share2, Users, Mail, Check, FolderPlus } from 'lucide-react';
import { getIconColor } from '../modals/SubjectIcon';

const FolderManager = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialData, 
    isEditing,
    onShare,
    currentFolder = null,
    allFolders = []
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: 'from-indigo-500 to-purple-600',
        icon: 'folder',
        tags: [],
        subjectIds: [],
        parentId: currentFolder?.id || null // Set parent to current folder if creating inside one
    });

    const [showShareModal, setShowShareModal] = useState(false);
    const [shareEmail, setShareEmail] = useState('');
    const [sharePermission, setSharePermission] = useState('view');
    const [shareSuccess, setShareSuccess] = useState(false);
    const [currentTag, setCurrentTag] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                setFormData({
                    name: initialData.name || '',
                    description: initialData.description || '',
                    color: initialData.color || 'from-indigo-500 to-purple-600',
                    icon: initialData.icon || 'folder',
                    tags: initialData.tags || [],
                    subjectIds: initialData.subjectIds || [],
                    parentId: initialData.parentId || null
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    color: 'from-indigo-500 to-purple-600',
                    icon: 'folder',
                    tags: [],
                    subjectIds: [],
                    parentId: currentFolder?.id || null
                });
            }
            setShareSuccess(false);
        }
    }, [isOpen, isEditing, initialData, currentFolder]);

    const gradientOptions = [
        { value: 'from-indigo-500 to-purple-600', name: 'Índigo a Púrpura' },
        { value: 'from-blue-500 to-cyan-600', name: 'Azul a Cian' },
        { value: 'from-green-500 to-teal-600', name: 'Verde a Turquesa' },
        { value: 'from-amber-500 to-orange-600', name: 'Ámbar a Naranja' },
        { value: 'from-pink-500 to-rose-600', name: 'Rosa a Rosa Oscuro' },
        { value: 'from-violet-500 to-fuchsia-600', name: 'Violeta a Fucsia' },
        { value: 'from-red-500 to-pink-600', name: 'Rojo a Rosa' },
        { value: 'from-slate-500 to-gray-600', name: 'Pizarra a Gris' }
    ];

    // Filter out current folder and its descendants to prevent circular nesting
    const getAvailableParentFolders = () => {
        if (!isEditing || !initialData) return allFolders;
        
        const isDescendant = (folderId, potentialAncestorId) => {
            const folder = allFolders.find(f => f.id === folderId);
            if (!folder) return false;
            if (folder.id === potentialAncestorId) return true;
            if (!folder.parentId) return false;
            return isDescendant(folder.parentId, potentialAncestorId);
        };

        return allFolders.filter(f => 
            f.id !== initialData.id && !isDescendant(f.id, initialData.id)
        );
    };

    const handleAddTag = () => {
        if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, currentTag.trim()]
            });
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name.trim()) {
            onSave(formData, isEditing ? initialData.id : null);
            onClose();
        }
    };

    const handleShare = async () => {
        if (shareEmail.trim() && onShare) {
            await onShare(initialData.id, shareEmail.trim(), sharePermission);
            setShareSuccess(true);
            setTimeout(() => {
                setShareSuccess(false);
                setShareEmail('');
            }, 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto transition-colors">
                
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between z-10 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${formData.color} flex items-center justify-center`}>
                            <Folder className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isEditing ? 'Editar Carpeta' : 'Nueva Carpeta'}
                            </h2>
                            {currentFolder && !isEditing && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Dentro de: {currentFolder.name}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing && initialData?.isOwner && (
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="Compartir carpeta"
                            >
                                <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                        )}
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nombre de la Carpeta *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Primer Semestre, Proyectos, etc."
                            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Descripción
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Breve descripción de la carpeta..."
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                        />
                    </div>

                    {/* Parent Folder Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Carpeta Padre
                        </label>
                        <select
                            value={formData.parentId || ''}
                            onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                        >
                            <option value="">Raíz (Sin carpeta padre)</option>
                            {getAvailableParentFolders().map(folder => (
                                <option key={folder.id} value={folder.id}>
                                    {folder.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Selecciona una carpeta padre para anidar esta carpeta
                        </p>
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Color
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {gradientOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color: option.value })}
                                    className={`relative h-12 rounded-xl bg-gradient-to-br ${option.value} transition-all ${
                                        formData.color === option.value 
                                            ? 'ring-4 ring-indigo-500 dark:ring-indigo-400 scale-105' 
                                            : 'hover:scale-105'
                                    }`}
                                    title={option.name}
                                >
                                    {formData.color === option.value && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Check className="w-6 h-6 text-white drop-shadow-lg" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Etiquetas
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                placeholder="Añadir etiqueta..."
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors"
                            >
                                Añadir
                            </button>
                        </div>
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map(tag => (
                                    <span 
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-lg text-sm"
                                    >
                                        #{tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:bg-pink-200 dark:hover:bg-pink-800/50 rounded-full p-0.5 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg transition-colors"
                        >
                            {isEditing ? 'Guardar Cambios' : 'Crear Carpeta'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Compartir Carpeta
                            </h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        {shareSuccess ? (
                            <div className="py-8 text-center">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-green-600 dark:text-green-400 font-medium">
                                    ¡Carpeta compartida exitosamente!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email del usuario
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={shareEmail}
                                            onChange={(e) => setShareEmail(e.target.value)}
                                            placeholder="usuario@ejemplo.com"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Permisos
                                    </label>
                                    <select
                                        value={sharePermission}
                                        onChange={(e) => setSharePermission(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                                    >
                                        <option value="view">Solo lectura</option>
                                        <option value="edit">Puede editar</option>
                                    </select>
                                </div>

                                <button
                                    onClick={handleShare}
                                    disabled={!shareEmail.trim()}
                                    className="w-full px-6 py-3 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Compartir
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FolderManager;