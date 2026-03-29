// src/pages/Topic/components/CategorizFileModal.jsx
import React, { useState } from 'react';
import { X, BookMarked, FlaskConical } from 'lucide-react';

const CategorizFileModal = ({
    isOpen,
    onClose,
    onSubmit,
    fileName = '',
    isLoading = false
}) => {
    const [category, setCategory] = useState('resumen');

    const handleSubmit = () => {
        if (!category) return;
        onSubmit(category);
        setCategory('resumen');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full animate-in fade-in scale-in duration-200">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            Categorizar Archivo
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </button>
                    </div>

                    {/* File Name */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 truncate">
                        <span className="font-medium text-slate-900 dark:text-white">{fileName}</span>
                    </p>

                    {/* Category Options */}
                    <div className="space-y-3 mb-8">
                        {/* Resumen Option */}
                        <button
                            onClick={() => setCategory('resumen')}
                            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                                category === 'resumen'
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                                <BookMarked className="w-5 h-5 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                            </div>
                            <div className="text-left">
                                <p className={`font-semibold ${
                                    category === 'resumen'
                                        ? 'text-indigo-900 dark:text-indigo-200'
                                        : 'text-slate-900 dark:text-white'
                                }`}>
                                    Resumen
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Apuntes y referencias
                                </p>
                            </div>
                        </button>

                        {/* Examen Option */}
                        <button
                            onClick={() => setCategory('examen')}
                            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                                category === 'examen'
                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900">
                                <FlaskConical className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                            </div>
                            <div className="text-left">
                                <p className={`font-semibold ${
                                    category === 'examen'
                                        ? 'text-amber-900 dark:text-amber-200'
                                        : 'text-slate-900 dark:text-white'
                                }`}>
                                    Examen
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Evaluaciones y pruebas
                                </p>
                            </div>
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !category}
                            className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Guardando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategorizFileModal;
