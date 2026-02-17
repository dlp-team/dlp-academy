// src/components/modals/EditSubjectModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ICON_MAP, ICON_KEYS, COLORS } from '../../../utils/subjectConstants';

const EditSubjectModal = ({ isOpen, onClose, initialData, onSave }) => {
    const [formData, setFormData] = useState(initialData);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
                <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-900">Editar Asignatura</h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                            <input
                                type="text"
                                value={formData.course}
                                onChange={(e) => setFormData({...formData, course: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
                            <div className="grid grid-cols-6 gap-2">
                                {ICON_KEYS.map((key) => {
                                    const Icon = ICON_MAP[key];
                                    return (
                                        <button key={key} type="button" onClick={() => setFormData({...formData, icon: key})} className={`p-2 rounded-lg flex items-center justify-center ${formData.icon === key ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-500' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                            <Icon className="w-5 h-5" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                            <div className="grid grid-cols-4 gap-3">
                                {COLORS.map((color) => (
                                    <button key={color} type="button" onClick={() => setFormData({...formData, color})} className={`w-full aspect-square rounded-full bg-gradient-to-br ${color} hover:scale-105 transition-transform ${formData.color === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105' : ''}`} />
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancelar</button>
                            <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditSubjectModal;