// src/pages/Subject/modals/subject-form/BasicInfoFields.jsx
import React from 'react';
import { EDUCATION_LEVELS } from '../../../../utils/subjectConstants';

const BasicInfoFields = ({ formData, setFormData }) => {
    return (
        <>
            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))} 
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors" 
                    placeholder="Ej: Matemáticas"
                    required 
                />
            </div>

            {/* Course Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Curso Académico</label>
                <div className="grid grid-cols-2 gap-3">
                    <select 
                        value={formData.level} 
                        onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value, grade: '' }))} 
                        className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white cursor-pointer transition-colors"
                    >
                        <option value="" className="dark:bg-slate-800">Nivel</option>
                        {Object.keys(EDUCATION_LEVELS).map(l => <option key={l} value={l} className="dark:bg-slate-800">{l}</option>)}
                    </select>
                    <select 
                        value={formData.grade} 
                        onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))} 
                        disabled={!formData.level} 
                        className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-slate-800/50 dark:disabled:text-gray-500 enabled:cursor-pointer transition-colors"
                    >
                        <option value="" className="dark:bg-slate-800">Curso</option>
                        {formData.level && EDUCATION_LEVELS[formData.level].map(g => <option key={g} value={g} className="dark:bg-slate-800">{g}</option>)}
                    </select>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Actual: {formData.course || 'Selecciona nivel y curso'}</p>
            </div>
        </>
    );
};

export default BasicInfoFields;