// src/pages/Subject/modals/PositionModal.jsx
import React, { useState, useEffect } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, List } from 'lucide-react';

const PositionModal = ({ isOpen, onClose, onConfirm, topics = [], newTopicTitle }) => {
    // Estado para saber qué opción elige el usuario: 'end', 'start', o 'specific'
    const [mode, setMode] = useState('end');
    // Estado para guardar el ID del tema después del cual queremos insertar (si elige específico)
    const [afterTopicId, setAfterTopicId] = useState('');

    // Cuando se abre el modal, reseteamos al valor por defecto (Al final)
    useEffect(() => {
        if (isOpen) {
            setMode('end');
            if (topics.length > 0) {
                setAfterTopicId(topics[topics.length - 1].id);
            }
        }
    }, [isOpen, topics]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        let insertIndex = 0;

        if (mode === 'start') {
            insertIndex = 0;
        } else if (mode === 'end') {
            insertIndex = topics.length;
        } else if (mode === 'specific') {
            // Buscamos el índice del tema seleccionado
            const foundIndex = topics.findIndex(t => t.id === afterTopicId);
            // Lo ponemos justo después (+1)
            insertIndex = foundIndex !== -1 ? foundIndex + 1 : topics.length;
        }

        onConfirm(insertIndex);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Cabecera */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">¿Dónde colocamos el tema?</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Nuevo tema: <span className="font-medium text-blue-600">{newTopicTitle}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Contenido / Opciones */}
                <div className="p-6 space-y-4">
                    
                    {/* Opción 1: Al Final (Por defecto) */}
                    <div 
                        onClick={() => setMode('end')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${mode === 'end' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    >
                        <div className={`p-2 rounded-full ${mode === 'end' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <ArrowDownCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className={`font-semibold ${mode === 'end' ? 'text-blue-700' : 'text-gray-700'}`}>Al final de la lista</p>
                            <p className="text-xs text-gray-500">Se añadirá como el tema {topics.length + 1}</p>
                        </div>
                    </div>

                    {/* Opción 2: Al Principio */}
                    <div 
                        onClick={() => setMode('start')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${mode === 'start' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    >
                        <div className={`p-2 rounded-full ${mode === 'start' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <ArrowUpCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className={`font-semibold ${mode === 'start' ? 'text-blue-700' : 'text-gray-700'}`}>Al principio del todo</p>
                            <p className="text-xs text-gray-500">Se convertirá en el tema 01</p>
                        </div>
                    </div>

                    {/* Opción 3: Posición específica */}
                    <div 
                        onClick={() => setMode('specific')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${mode === 'specific' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    >
                        <div className="flex items-center gap-4 mb-3">
                            <div className={`p-2 rounded-full ${mode === 'specific' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <List className="w-6 h-6" />
                            </div>
                            <p className={`font-semibold ${mode === 'specific' ? 'text-blue-700' : 'text-gray-700'}`}>Después de un tema...</p>
                        </div>

                        {/* Desplegable que solo sale si eliges esta opción */}
                        {mode === 'specific' && (
                            <select 
                                value={afterTopicId}
                                onChange={(e) => setAfterTopicId(e.target.value)}
                                className="w-full p-2 mt-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                onClick={(e) => e.stopPropagation()} // Para que no parpadee al clicar el select
                            >
                                {topics.map((topic, index) => (
                                    <option key={topic.id} value={topic.id}>
                                        {index + 1}. {topic.name || topic.title}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                </div>

                {/* Footer con botones */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all transform active:scale-95"
                    >
                        Confirmar Ubicación
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PositionModal;