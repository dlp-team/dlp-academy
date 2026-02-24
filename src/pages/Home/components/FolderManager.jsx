// src/pages/Home/components/FolderManager.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Share2, Users } from 'lucide-react';
import { COLORS, MODERN_FILL_COLORS } from '../../../utils/subjectConstants';

const FolderManager = ({ 
    isOpen, onClose, onSave, initialData, isEditing, 
    onShare, onUnshare, initialTab = 'general'
}) => {
    const [formData, setFormData] = useState({ 
        name: '', 
        description: '', 
        color: 'from-amber-400 to-amber-600',
        tags: [],
        cardStyle: 'default',
        modernFillColor: MODERN_FILL_COLORS[0].value
    });
    const [shareEmail, setShareEmail] = useState('');
    const [shareRole, setShareRole] = useState('viewer');
    const [sharedList, setSharedList] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            if (isEditing && initialData) {
                setFormData({
                    id: initialData.id,
                    name: initialData.name || '',
                    description: initialData.description || '',
                    color: initialData.color || 'from-amber-400 to-amber-600',
                    tags: initialData.tags || [],
                    cardStyle: initialData.cardStyle || 'default',
                    modernFillColor: initialData.fillColor || initialData.modernFillColor || MODERN_FILL_COLORS[0].value
                });
                setSharedList(initialData.sharedWith || []);
            } else {
                setFormData({ 
                    name: '', 
                    description: '', 
                    color: 'from-amber-400 to-amber-600',
                    tags: [],
                    cardStyle: 'default',
                    modernFillColor: MODERN_FILL_COLORS[0].value
                });
                setSharedList([]);
            }
            setShareEmail('');
            setShareRole('viewer');
            setTagInput('');
        }
    }, [isOpen, initialData, isEditing, initialTab]);

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

    // 3. HANDLE SHARE (Add User)
    const handleShareAction = async () => {
        if (!shareEmail.trim()) return;
        
        try {
            const newUser = await onShare(initialData.id, shareEmail, shareRole);

            // 2. If successful, update LOCAL state instantly
            if (newUser) {
                setSharedList(prev => [...prev, newUser]); 
                setShareEmail('');
            }
        } catch (error) {
            alert("Error al compartir. Verifica que el correo exista.");
        }
    };

    // 4. HANDLE UNSHARE (Remove User)
    const handleUnshareAction = async (emailToRemove) => {
        if (!confirm("¿Dejar de compartir con este usuario?")) return;

        try {
            await onUnshare(initialData.id, emailToRemove);
            
            // Update UI Instantly
            setSharedList(prev => prev.filter(user => user.email !== emailToRemove));
        } catch (error) {
            console.error("Failed to unshare", error);
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

    const handleAddUser = async () => {
        if (!shareEmail.trim()) return;
        const newUser = { email: shareEmail, role: shareRole };
        setSharedList(prev => [...prev, newUser]); 
        
        if (onShare) await onShare(shareEmail, shareRole);
        setShareEmail('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddUser();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
                <div className="relative transform overflow-hidden bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl text-left border border-transparent dark:border-slate-800">
                    
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {isEditing ? 'Editar Carpeta' : 'Nueva Carpeta'}
                        </h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs (Only if Editing) */}
                    {isEditing && (
                        <div className="flex border-b border-gray-100 dark:border-slate-800">
                            <button 
                                onClick={() => setActiveTab('general')}
                                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'
                                }`}
                            >
                                General
                            </button>
                            <button 
                                onClick={() => setActiveTab('sharing')}
                                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                                    activeTab === 'sharing' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'
                                }`}
                            >
                                <Users size={16} /> Compartir
                            </button>
                        </div>
                    )}

                    {/* CONTENT BODY */}
                    
                    {/* 1. GENERAL TAB */}
                    <div className={activeTab === 'general' ? 'block' : 'hidden'}>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                    className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    required 
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                                <input 
                                    type="text" 
                                    value={formData.description} 
                                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                    className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                />
                            </div>

                            {/* Colors */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                                <div className="grid grid-cols-6 gap-3">
                                    {COLORS.map((color) => (
                                        <button 
                                            key={color} 
                                            type="button" 
                                            onClick={() => setFormData({...formData, color})} 
                                            className={`w-full aspect-square rounded-full bg-gradient-to-br ${color} ${
                                                formData.color === color ? 'ring-2 ring-indigo-500 scale-110' : ''
                                            }`} 
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Style */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estilo</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, cardStyle: 'default' })}
                                        className={`px-3 py-2 rounded-xl border transition-colors ${formData.cardStyle === 'default' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300'}`}
                                    >
                                        Default
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, cardStyle: 'modern' })}
                                        className={`px-3 py-2 rounded-xl border transition-colors ${formData.cardStyle === 'modern' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300'}`}
                                    >
                                        Modern
                                    </button>
                                </div>
                            </div>

                            {formData.cardStyle === 'modern' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Relleno moderno</label>
                                    <select
                                        value={formData.modernFillColor}
                                        onChange={(e) => setFormData({ ...formData, modernFillColor: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    >
                                        {MODERN_FILL_COLORS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Tags (Simplified for brevity, keep your full logic) */}
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

                            {/* Actions (Only for General Tab) */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">Cancelar</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl flex items-center gap-2">
                                    <Save className="w-4 h-4" /> Guardar
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* 2. SHARING TAB */}
                    <div className={activeTab === 'sharing' ? 'block' : 'hidden'}>
                        <div className="p-6 space-y-6">
                            
                            {/* Add User Input Section */}
                            <div className="flex gap-2">
                                <input 
                                    type="email"
                                    value={shareEmail} 
                                    onChange={e => setShareEmail(e.target.value)}
                                    // --- ENTER KEY HANDLER ---
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault(); // Stop form submit
                                            handleShareAction(); // Trigger add
                                        }
                                    }}
                                    placeholder="email@ejemplo.com"
                                    className="flex-1 px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                />
                                <select 
                                    value={shareRole}
                                    onChange={(e) => setShareRole(e.target.value)}
                                    className="px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                >
                                    <option value="viewer">Ver</option>
                                    <option value="editor">Editar</option>
                                </select>
                                <button 
                                    type="button" 
                                    onClick={handleShareAction} // Call the wrapper
                                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                                >
                                    <Plus size={20}/>
                                </button>
                            </div>

                            {/* Shared Users List */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Usuarios con acceso ({sharedList.length})
                                </h4>
                                
                                {sharedList.length === 0 && (
                                    <p className="text-sm text-gray-400 italic text-center py-4">
                                        Carpeta privada. Añade usuarios para compartir.
                                    </p>
                                )}

                                {sharedList.map((user, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                {user.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user.role === 'viewer' ? 'Lector' : 'Editor'}</p>
                                            </div>
                                        </div>

                                        {/* Owner Controls */}
                                        {initialData?.isOwner && (
                                            <button 
                                                onClick={() => handleUnshareAction(user.email)} // Call the wrapper
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Revocar acceso"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FolderManager;