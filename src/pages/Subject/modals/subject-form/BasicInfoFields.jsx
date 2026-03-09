// src/pages/Subject/modals/subject-form/BasicInfoFields.jsx
import React from 'react';
import { EDUCATION_LEVELS } from '../../../../utils/subjectConstants';

const BasicInfoFields = ({
    formData,
    setFormData,
    validationErrors = {},
    setValidationErrors = () => {},
    nameInputRef,
    levelSelectRef,
    gradeSelectRef
}) => {
    const buildCourseValue = (level, grade) => {
        if (!level || !grade) return '';
        return `${grade} ${level}`;
    };

    return (
        <>
            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input 
                    ref={nameInputRef}
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => {
                        setFormData(prev => ({...prev, name: e.target.value}));
                        if (validationErrors?.name) {
                            setValidationErrors(prev => ({ ...prev, name: '' }));
                        }
                    }} 
                    className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors ${
                        validationErrors?.name
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-gray-300 dark:border-slate-700'
                    }`} 
                    placeholder="Ej: Matemáticas"
                    required 
                />
                {validationErrors?.name ? (
                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{validationErrors.name}</p>
                ) : null}
            </div>

            {/* Course Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Curso Académico</label>
                <div className="grid grid-cols-2 gap-3">
                    <select 
                        ref={levelSelectRef}
                        value={formData.level} 
                        onChange={(e) => {
                            const nextLevel = e.target.value;
                            setFormData(prev => ({
                                ...prev,
                                level: nextLevel,
                                grade: '',
                                course: nextLevel && prev.grade ? buildCourseValue(nextLevel, prev.grade) : ''
                            }));
                            if (validationErrors?.course) {
                                setValidationErrors(prev => ({ ...prev, course: '' }));
                            }
                        }} 
                        className={`px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white cursor-pointer transition-colors ${
                            validationErrors?.course
                                ? 'border-red-500 dark:border-red-500'
                                : 'border-gray-300 dark:border-slate-700'
                        }`}
                    >
                        <option value="" className="dark:bg-slate-800">Nivel</option>
                        {Object.keys(EDUCATION_LEVELS).map(l => <option key={l} value={l} className="dark:bg-slate-800">{l}</option>)}
                    </select>
                    <select 
                        ref={gradeSelectRef}
                        value={formData.grade} 
                        onChange={(e) => {
                            const nextGrade = e.target.value;
                            setFormData(prev => ({
                                ...prev,
                                grade: nextGrade,
                                course: prev.level && nextGrade ? buildCourseValue(prev.level, nextGrade) : prev.course
                            }));
                            if (validationErrors?.course) {
                                setValidationErrors(prev => ({ ...prev, course: '' }));
                            }
                        }} 
                        disabled={!formData.level} 
                        className={`px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-slate-800/50 dark:disabled:text-gray-500 enabled:cursor-pointer transition-colors ${
                            validationErrors?.course
                                ? 'border-red-500 dark:border-red-500'
                                : 'border-gray-300 dark:border-slate-700'
                        }`}
                    >
                        <option value="" className="dark:bg-slate-800">Curso</option>
                        {formData.level && Array.isArray(EDUCATION_LEVELS[formData.level]) && EDUCATION_LEVELS[formData.level].map(g => (
                            <option key={g} value={g} className="dark:bg-slate-800">{g}</option>
                        ))}
                    </select>
                </div>
                {validationErrors?.course ? (
                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{validationErrors.course}</p>
                ) : null}
            </div>
        </>
    );
};

export default BasicInfoFields;