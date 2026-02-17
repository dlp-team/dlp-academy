// src/components/modals/subject-form/AppearanceSection.jsx
import React from 'react';
import { ICON_MAP, ICON_KEYS, COLORS } from '../../../../utils/subjectConstants';

const AppearanceSection = ({ formData, setFormData }) => {
    return (
        <>
            {/* Icons */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icono</label>
                <div className="grid grid-cols-6 gap-2">
                    {ICON_KEYS.map((key) => {
                        const Icon = ICON_MAP[key];
                        return (
                            <button 
                                key={key} 
                                type="button" 
                                onClick={() => setFormData(prev => ({...prev, icon: key}))} 
                                className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                                    formData.icon === key 
                                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500 dark:ring-indigo-400' 
                                        : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Colors */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color del Tema</label>
                <div className="grid grid-cols-6 gap-3">
                    {COLORS.map((color) => (
                        <button 
                            key={color} 
                            type="button" 
                            onClick={() => setFormData(prev => ({...prev, color}))} 
                            className={`w-full aspect-square rounded-full bg-gradient-to-br ${color} transition-transform hover:scale-105 ${
                                formData.color === color 
                                    ? 'ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-indigo-500 dark:ring-indigo-400 scale-105' 
                                    : 'cursor-pointer'
                            }`} 
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default AppearanceSection;