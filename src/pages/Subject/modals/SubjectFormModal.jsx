// src/pages/Subject/modals/SubjectFormModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Users, Trash2, Share2 } from 'lucide-react';
import { MODERN_FILL_COLORS, EDUCATION_LEVELS } from '../../../utils/subjectConstants';

// Sub-components
import BasicInfoFields from './subject-form/BasicInfoFields';
import TagManager from './subject-form/TagManager';
import AppearanceSection from './subject-form/AppearanceSection';
import StyleSelector from './subject-form/StyleSelector';

const SubjectFormModal = ({ isOpen, onClose, onSave, initialData, isEditing, onShare, onUnshare, initialTab = 'general' }) => {
    const [formData, setFormData] = useState({ 
        name: '', level: '', grade: '', course: '', 
        color: 'from-blue-400 to-blue-600', icon: 'book', tags: [],
        cardStyle: 'default', modernFillColor: MODERN_FILL_COLORS[0].value
    });
    const [activeTab, setActiveTab] = useState('general');
    const [shareEmail, setShareEmail] = useState('');
    const [sharedList, setSharedList] = useState([]);

    // 1. Initialize Logic
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
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
                // Load shared list
                setSharedList(initialData.sharedWith || []);
            } else {
                // When creating new subject, pre-fill course, level, and grade if provided
                // Validate that level exists in EDUCATION_LEVELS
                const prefilledLevel = initialData?.level || '';
                const prefilledGrade = initialData?.grade || '';
                console.log('📝 SubjectFormModal - Initializing with:', { initialData, prefilledLevel, prefilledGrade, educationLevels: EDUCATION_LEVELS });
                const validLevel = prefilledLevel && EDUCATION_LEVELS[prefilledLevel] ? prefilledLevel : '';
                const validGrade = validLevel && prefilledGrade && EDUCATION_LEVELS[validLevel].includes(prefilledGrade) ? prefilledGrade : '';
                console.log('✅ SubjectFormModal - Validated:', { validLevel, validGrade });
                
                setFormData({ 
                    name: '',
                    level: validLevel,
                    grade: validGrade,
                    course: initialData?.course || '',
                    color: 'from-blue-400 to-blue-600',
                    icon: 'book',
                    tags: [],
                    cardStyle: 'default',
                    modernFillColor: MODERN_FILL_COLORS[0].value
                });
                setSharedList([]);
            }
        }
    }, [isOpen, isEditing, initialData, initialTab]);

    // 2. Auto-generate Course Name (only if course is not pre-filled from outside)
    useEffect(() => {
        if (formData.level && formData.grade && !isEditing) {
            // Only auto-generate if we don't already have a manually set course
            // or if the course doesn't match the expected format
            const expectedCourse = `${formData.grade} ${formData.level}`;
            const reversedCourse = `${formData.level} ${formData.grade}`;
            if (formData.course !== expectedCourse && formData.course !== reversedCourse) {
                setFormData(prev => ({ ...prev, course: expectedCourse }));
            }
        }
    }, [formData.level, formData.grade, isEditing]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleShareAction = async () => {
        if (!shareEmail.trim()) {
            alert('Por favor ingresa un correo');
            return;
        }
        try {
            await onShare(formData.id, shareEmail);
            setSharedList(prev => [...prev, { email: shareEmail.toLowerCase(), role: 'viewer', sharedAt: new Date() }]);
            setShareEmail('');
        } catch (error) {
            console.error('Error sharing subject:', error);
        }
    };

    const handleUnshareAction = async (emailToRemove) => {
        try {
            await onUnshare(formData.id, emailToRemove);
            setSharedList(prev => prev.filter(u => u.email !== emailToRemove));
        } catch (error) {
            console.error('Error unsharing subject:', error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleShareAction();
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
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{isEditing ? 'Editar Asignatura' : 'Nueva Asignatura'}</h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>

                    {/* Tabs */}
                    {isEditing && (
                        <div className="px-6 pt-4 border-b border-gray-100 dark:border-slate-800 flex gap-2">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`px-4 py-2 rounded-t-xl font-medium transition-colors ${
                                    activeTab === 'general'
                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                                }`}
                            >
                                General
                            </button>
                            <button
                                onClick={() => setActiveTab('sharing')}
                                className={`px-4 py-2 rounded-t-xl font-medium transition-colors flex items-center gap-2 ${
                                    activeTab === 'sharing'
                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                                }`}
                            >
                                <Share2 size={16} /> Compartir
                            </button>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        
                        {/* General Tab */}
                        {activeTab === 'general' && (
                            <>
                                <BasicInfoFields formData={formData} setFormData={setFormData} />
                                <TagManager formData={formData} setFormData={setFormData} />
                                <AppearanceSection formData={formData} setFormData={setFormData} />
                                <StyleSelector formData={formData} setFormData={setFormData} />
                            </>
                        )}

                        {/* Sharing Tab */}
                        {activeTab === 'sharing' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Compartir con
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            value={shareEmail}
                                            onChange={(e) => setShareEmail(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="usuario@ejemplo.com"
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleShareAction}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2"
                                        >
                                            <Users size={16} /> Compartir
                                        </button>
                                    </div>
                                </div>

                                {/* Shared Users List */}
                                {sharedList.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Compartido con ({sharedList.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {sharedList.map((share) => (
                                                <div
                                                    key={share.email}
                                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {share.email}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {share.role === 'viewer' ? 'Visualizador' : 'Editor'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUnshareAction(share.email)}
                                                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                                                        title="Dejar de compartir"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {sharedList.length === 0 && (
                                    <div className="text-center py-6">
                                        <Users className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Esta asignatura no está compartida con nadie
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors cursor-pointer">Cancelar</button>
                            {activeTab === 'general' && (
                                <button type="submit" className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 flex items-center gap-2 cursor-pointer transition-colors">
                                    <Save className="w-4 h-4" /> {isEditing ? 'Guardar' : 'Crear'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubjectFormModal;