// Archivo: src/components/modals/SubjectModal.jsx
import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

const SubjectModal = ({ isOpen, onClose, formData, setFormData, onSubmit, colorOptions }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">Crear Nueva Asignatura</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none" placeholder="Matemáticas" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Curso</label>
                        <input type="text" value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none" placeholder="1º ESO" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Color</label>
                        <div className="grid grid-cols-4 gap-3">
                            {colorOptions.map((color) => (
                                <button key={color.value} onClick={() => setFormData({ ...formData, color: color.value })} className={`relative h-20 rounded-xl bg-gradient-to-br ${color.value} transition-all ${formData.color === color.value ? 'ring-4 ring-indigo-500 scale-105' : 'hover:scale-105'}`}>
                                    {formData.color === color.value && <div className="absolute inset-0 flex items-center justify-center"><CheckCircle2 className="w-8 h-8 text-white drop-shadow-lg" /></div>}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={onSubmit} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold">Crear Asignatura</button>
                </div>
            </div>
        </div>
    );
};
export default SubjectModal;