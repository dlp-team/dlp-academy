// src/components/modals/SubjectModal.jsx
import React from 'react';
import { X, Check } from 'lucide-react';

const SubjectModal = ({ 
    isOpen, 
    onClose, 
    formData, 
    setFormData, 
    onSubmit, 
    colorOptions,
    iconOptions, // Receive icon options
    isEditing    // Receive edit state
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-800">
                        {isEditing ? 'Editar Asignatura' : 'Crear Nueva Asignatura'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Asignatura</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            placeholder="Ej. Matemáticas"
                        />
                    </div>

                    {/* Course Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Curso / Grupo</label>
                        <input 
                            type="text" 
                            value={formData.course}
                            onChange={(e) => setFormData({...formData, course: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            placeholder="Ej. 2º Bachillerato A"
                        />
                    </div>

                    {/* Icon Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
                        <div className="grid grid-cols-4 gap-2">
                            {iconOptions.map((opt) => {
                                const Icon = opt.icon;
                                const isSelected = (formData.icon || 'BookOpen') === opt.name;
                                return (
                                    <button
                                        key={opt.name}
                                        type="button"
                                        onClick={() => setFormData({...formData, icon: opt.name})}
                                        className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                                            isSelected 
                                            ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-500' 
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                        }`}
                                        title={opt.name}
                                    >
                                        <Icon size={24} />
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Color Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color de Fondo</label>
                        <div className="grid grid-cols-4 gap-3">
                            {colorOptions.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => setFormData({...formData, color: color.value})}
                                    className={`w-full h-10 rounded-lg bg-gradient-to-br ${color.value} relative shadow-sm hover:scale-105 transition-transform`}
                                    title={color.name}
                                >
                                    {formData.color === color.value && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Check className="text-white drop-shadow-md" size={18} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        onClick={onSubmit}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        {isEditing ? 'Guardar Cambios' : 'Crear Asignatura'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubjectModal;