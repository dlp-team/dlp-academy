// src/pages/Home/modals/EditSubjectModal.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { ICON_MAP, ICON_KEYS, COLORS } from '../../../utils/subjectConstants';
import DashboardOverlayShell from '../../../components/ui/DashboardOverlayShell';
import { checkSubjectUniqueness } from '../../../utils/subjectValidation';

const EditSubjectModal = ({ isOpen, onClose, initialData, onSave }: any) => {
    const [formData, setFormData] = useState(initialData);
    const [duplicateError, setDuplicateError] = useState('');
    const [checkingUniqueness, setCheckingUniqueness] = useState(false);
    const openFormSnapshotRef = useRef('');

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setFormData(initialData);
        openFormSnapshotRef.current = JSON.stringify(initialData || {});
    }, [isOpen, initialData]);

    const serializedFormData = useMemo(() => JSON.stringify(formData || {}), [formData]);
    const hasOpenSnapshot = openFormSnapshotRef.current.length > 0;
    const hasUnsavedChanges = isOpen && hasOpenSnapshot && serializedFormData !== openFormSnapshotRef.current;

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setDuplicateError('');

        const institutionId = initialData?.institutionId || '';
        if (institutionId && formData.name && formData.course) {
            setCheckingUniqueness(true);
            try {
                const isUnique = await checkSubjectUniqueness({
                    name: formData.name,
                    course: formData.course,
                    institutionId,
                    academicYear: formData.academicYear || '',
                    classIds: Array.isArray(formData.classIds) ? formData.classIds : [],
                    excludeSubjectId: initialData?.id,
                });
                if (!isUnique) {
                    setDuplicateError('Ya existe una asignatura con este nombre y curso.');
                    setCheckingUniqueness(false);
                    return;
                }
            } catch {
                // Allow save on network error
            } finally {
                setCheckingUniqueness(false);
            }
        }

        onSave(formData);
    };

    return (
        <DashboardOverlayShell
            isOpen={isOpen}
            onClose={onClose}
            hasUnsavedChanges={hasUnsavedChanges}
            confirmOnUnsavedClose
            maxWidth="md"
            backdropClassName="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            contentClassName="relative bg-white rounded-2xl w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200"
        >
            {({ requestClose }: any) => (
                <>
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-900">Editar Asignatura</h3>
                        <button onClick={requestClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
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
                                onChange={(e) => { setFormData({...formData, course: e.target.value}); setDuplicateError(''); }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                            {duplicateError ? (
                                <p className="mt-1 text-xs font-medium text-red-600">{duplicateError}</p>
                            ) : null}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
                            <div className="grid grid-cols-6 gap-2">
                                {ICON_KEYS.map((key: any) => {
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
                                {COLORS.map((color: any) => (
                                    <button key={color} type="button" onClick={() => setFormData({...formData, color})} className={`w-full aspect-square rounded-full bg-gradient-to-br ${color} hover:scale-105 transition-transform ${formData.color === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105' : ''}`} />
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={requestClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancelar</button>
                            <button type="submit" disabled={checkingUniqueness} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed">Guardar Cambios</button>
                        </div>
                    </form>
                </>
            )}
        </DashboardOverlayShell>
    );
};

export default EditSubjectModal;