// src/pages/Topic/components/CategorizFileModal.tsx
import React, { useState } from 'react';
import { X, BookMarked, Dumbbell, FlaskConical } from 'lucide-react';
import BaseModal from '../../../components/ui/BaseModal';

const CategorizFileModal = ({
    isOpen,
    onClose,
    onSubmit,
    fileName = '',
    isLoading = false
}) => {
    const [category, setCategory] = useState('material-teorico');

    const handleSubmit = () => {
        if (!category) return;
        onSubmit(category);
        setCategory('material-teorico');
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            closeOnBackdropClick={false}
            rootClassName="fixed inset-0 z-50"
            backdropClassName="absolute inset-0 bg-black/50 backdrop-blur-sm"
            contentWrapperClassName="relative z-10 flex min-h-full items-center justify-center p-4"
            contentClassName="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full animate-in fade-in scale-in duration-200"
        >
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
                        {/* Material teórico */}
                        <button
                            onClick={() => setCategory('material-teorico')}
                            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                                category === 'material-teorico'
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                                <BookMarked className="w-5 h-5 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                            </div>
                            <div className="text-left">
                                <p className={`font-semibold ${
                                    category === 'material-teorico'
                                        ? 'text-indigo-900 dark:text-indigo-200'
                                        : 'text-slate-900 dark:text-white'
                                }`}>
                                    Material teórico
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Contenido base y explicaciones
                                </p>
                            </div>
                        </button>

                        {/* Ejercicios */}
                        <button
                            onClick={() => setCategory('ejercicios')}
                            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                                category === 'ejercicios'
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                                <Dumbbell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                            </div>
                            <div className="text-left">
                                <p className={`font-semibold ${
                                    category === 'ejercicios'
                                        ? 'text-emerald-900 dark:text-emerald-200'
                                        : 'text-slate-900 dark:text-white'
                                }`}>
                                    Ejercicios
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Práctica y actividades
                                </p>
                            </div>
                        </button>

                        {/* Exámenes */}
                        <button
                            onClick={() => setCategory('examenes')}
                            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                                category === 'examenes'
                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900">
                                <FlaskConical className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                            </div>
                            <div className="text-left">
                                <p className={`font-semibold ${
                                    category === 'examenes'
                                        ? 'text-amber-900 dark:text-amber-200'
                                        : 'text-slate-900 dark:text-white'
                                }`}>
                                    Exámenes
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
        </BaseModal>
    );
};

export default CategorizFileModal;
