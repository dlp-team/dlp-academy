// src/pages/Subject/modals/subject-form/BasicInfoFields.jsx
import React from 'react';

const BasicInfoFields = ({
    formData,
    setFormData,
    validationErrors = {},
    setValidationErrors = () => {},
    nameInputRef,
    courseSelectRef,
    availableCourses = [],
    coursesLoading = false
}) => {
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Curso</label>
                <select
                    ref={courseSelectRef}
                    value={formData.course || ''}
                    onChange={(e) => {
                        const nextCourse = e.target.value;
                        setFormData(prev => ({
                            ...prev,
                            course: nextCourse
                        }));
                        if (validationErrors?.course) {
                            setValidationErrors(prev => ({ ...prev, course: '' }));
                        }
                    }}
                    disabled={coursesLoading}
                    className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-slate-800/50 dark:disabled:text-gray-500 enabled:cursor-pointer transition-colors ${
                        validationErrors?.course
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-gray-300 dark:border-slate-700'
                    }`}
                >
                    <option value="" className="dark:bg-slate-800">{coursesLoading ? 'Cargando cursos...' : 'Selecciona un curso'}</option>
                    {availableCourses.map((course) => (
                        <option key={course.id} value={course.name} className="dark:bg-slate-800">
                            {course.name}
                        </option>
                    ))}
                </select>
                {!coursesLoading && availableCourses.length === 0 ? (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">No hay cursos disponibles en la institución.</p>
                ) : null}
                {validationErrors?.course ? (
                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{validationErrors.course}</p>
                ) : null}
            </div>
        </>
    );
};

export default BasicInfoFields;