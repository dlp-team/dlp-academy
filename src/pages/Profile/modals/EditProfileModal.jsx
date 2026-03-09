// src/components/modals/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Camera, Edit2, Loader2, Save } from 'lucide-react';
import Avatar from '../../../components/ui/Avatar';
import { storage } from '../../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const EditProfileModal = ({ isOpen, onClose, initialData, onSave }) => {
    const [formData, setFormData] = useState({ displayName: '' });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadError, setUploadError] = useState("");

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                displayName: initialData.displayName || ''
            });
            setPhotoPreview(null);
            setPhotoFile(null);
        }
    }, [isOpen, initialData]);

    const handlePhotoChange = (e) => {
        setUploadError("");
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setUploadError("La imagen debe ser menor a 2MB.");
                setPhotoFile(null);
                setPhotoPreview(null);
                return;
            }
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    // Upload image to Firebase Storage and return download URL
    const uploadProfileImage = async (file, userId) => {
        const storageRef = ref(storage, `profile-pictures/${userId}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setUploadError("");
        try {
            let finalPhoto = initialData.photoURL;
            if (photoFile) {
                if (photoFile.size > 2 * 1024 * 1024) {
                    setUploadError("La imagen debe ser menor a 2MB.");
                    setIsSaving(false);
                    return;
                }
                // Assume initialData has userId
                finalPhoto = await uploadProfileImage(photoFile, initialData.uid);
            }
            await onSave({ ...formData, photoURL: finalPhoto });
            onClose();
        } catch (error) {
            setUploadError("Error al subir la imagen. Intenta nuevamente.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn border border-transparent dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Editar Perfil</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={20} />
                    </button>
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
                            {/* Removed edit pencil icon */}
                        </div>
                        {uploadError && (
                            <p className="text-xs text-red-600 mt-2">{uploadError}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click para cambiar foto</p>
                    </div>

                    {/* Inputs */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
                        <input 
                            value={formData.displayName} 
                            onChange={(e) => setFormData({...formData, displayName: e.target.value})} 
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" 
                            required 
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-70">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;