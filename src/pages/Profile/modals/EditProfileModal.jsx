// src/components/modals/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Camera, Edit2, Loader2, Save } from 'lucide-react';
import Avatar from '../../../components/ui/Avatar';
import { COUNTRIES } from '../../../utils/profileConstants';

const EditProfileModal = ({ isOpen, onClose, initialData, onSave }) => {
    const [formData, setFormData] = useState({ displayName: '', role: 'student', country: '' });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                displayName: initialData.displayName || '',
                role: initialData.role || 'student',
                country: initialData.country || ''
            });
            setPhotoPreview(null);
            setPhotoFile(null);
        }
    }, [isOpen, initialData]);

    const handlePhotoChange = (e) => {
        if (e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
            setPhotoPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let finalPhoto = initialData.photoURL; // Default to existing
            if (photoFile) {
                finalPhoto = await convertToBase64(photoFile);
            }
            await onSave({ ...formData, photoURL: finalPhoto });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Editar Perfil</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Image Upload */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group cursor-pointer">
                            <Avatar 
                                photoURL={photoPreview || initialData.photoURL} 
                                name={formData.displayName} 
                                size="w-28 h-28" 
                                textSize="text-4xl" 
                            />
                            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                <Camera size={32} />
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            </label>
                            <div className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full text-white border-4 border-white">
                                <Edit2 size={14} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Click para cambiar foto</p>
                    </div>

                    {/* Inputs */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input 
                            value={formData.displayName} 
                            onChange={(e) => setFormData({...formData, displayName: e.target.value})} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                            required 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                        <select 
                            value={formData.country} 
                            onChange={(e) => setFormData({...formData, country: e.target.value})} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        >
                            {Object.entries(COUNTRIES).map(([key, val]) => (
                                <option key={key} value={key}>{val.name} {val.flag}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['student', 'teacher'].map(role => (
                                <label key={role} className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center transition-all ${formData.role === role ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="radio" name="role" value={role} checked={formData.role === role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="hidden" />
                                    <span className="text-2xl mb-1">{role === 'student' ? '👨‍🎓' : '👨‍🏫'}</span>
                                    <span className="text-sm font-bold">{role === 'student' ? 'Estudiante' : 'Docente'}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;