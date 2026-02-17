// src/components/modals/subject-form/StyleSelector.jsx
import React from 'react';
import { MODERN_FILL_COLORS } from '../../../../utils/subjectConstants';

const StyleSelector = ({ formData, setFormData }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estilo de Tarjeta</label>
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Classic Style */}
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({...prev, cardStyle: 'default'}))}
                    className={`relative p-3 rounded-xl border transition-all duration-200 group ${
                        formData.cardStyle === 'default' 
                            ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 dark:ring-indigo-400/20 bg-indigo-50 dark:bg-indigo-900/20' 
                            : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer'
                    }`}
                >
                    <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${formData.color} shadow-sm mb-2`}></div>
                    <span className={`text-sm font-medium ${
                        formData.cardStyle === 'default' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'
                    }`}>Clásico</span>
                </button>

                {/* Modern Style */}
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({...prev, cardStyle: 'modern'}))}
                    className={`relative p-3 rounded-xl border transition-all duration-200 group ${
                        formData.cardStyle === 'modern' 
                            ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 dark:ring-indigo-400/20 bg-indigo-50 dark:bg-indigo-900/20' 
                            : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer'
                    }`}
                >
                    <div className={`w-full h-12 rounded-lg p-[2px] bg-gradient-to-br ${formData.color} shadow-sm mb-2`}>
                        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[6px]"></div>
                    </div>
                    <span className={`text-sm font-medium ${
                        formData.cardStyle === 'modern' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'
                    }`}>Moderno</span>
                </button>
            </div>

            {/* Fill Color Selector - Only shown for Modern style */}
            {formData.cardStyle === 'modern' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color de Fondo (Moderno)</label>
                    <div className="grid grid-cols-3 gap-3">
                        {MODERN_FILL_COLORS.map((fillColor) => (
                            <button
                                key={fillColor.value}
                                type="button"
                                onClick={() => setFormData(prev => ({...prev, modernFillColor: fillColor.value}))}
                                className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                                    formData.modernFillColor === fillColor.value
                                        ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 dark:ring-indigo-400/20'
                                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 cursor-pointer'
                                }`}
                            >
                                <div className={`h-12 ${fillColor.value} transition-transform group-hover:scale-105`}></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[9px] font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                        {fillColor.name}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        El color de fondo aparece dentro de la tarjeta con el estilo moderno
                    </p>
                </div>
            )}
        </div>
    );
};

export default StyleSelector;