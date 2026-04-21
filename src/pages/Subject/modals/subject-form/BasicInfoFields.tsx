// src/pages/Subject/modals/subject-form/BasicInfoFields.tsx
import React from 'react';
import { getCourseDisplayLabel } from '../../../../utils/courseLabelUtils';

const BasicInfoFields = ({
    formData,
    setFormData,
    validationErrors = {},
    setValidationErrors = (_: any) => {},
    nameInputRef,
    courseSelectRef,
    availableCourses = [],
    coursesLoading = false
}: any) => {
    const normalizedSelectedCourseId = String(formData?.courseId || '').trim();
    const normalizedSelectedCourseName = String(formData?.course || '').trim().toLowerCase();
    const selectedCourseValue =
        normalizedSelectedCourseId
        || availableCourses.find((course: any) => String(course?.name || '').trim().toLowerCase() === normalizedSelectedCourseName)?.id
        || '';
    const hasUnavailableCourseSelection = Boolean(normalizedSelectedCourseName) && !selectedCourseValue;

    return (
        <>
            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input 
                    ref={nameInputRef}
                    type="text" 
                    value={formData.name} 
                    onChange={(e: any) => {
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
                    value={hasUnavailableCourseSelection ? '__unavailable__' : selectedCourseValue}
                    onChange={(e: any) => {
                        const nextCourseId = String(e.target.value || '').trim();
                        const selectedCourse = availableCourses.find((course: any) => course.id === nextCourseId);
                        setFormData(prev => ({
                            ...prev,
                            courseId: selectedCourse?.id || '',
                            course: selectedCourse?.name || ''
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
                    {hasUnavailableCourseSelection && (
                        <option value="__unavailable__" disabled className="dark:bg-slate-800">
                            {`${formData.course} (curso no disponible)`}
                        </option>
                    )}
                    {availableCourses.map((course: any) => (
                        <option key={course.id} value={course.id} className="dark:bg-slate-800">
                            {getCourseDisplayLabel(course)}
                        </option>
                    ))}
                </select>
                {!coursesLoading && availableCourses.length === 0 ? (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">No hay cursos disponibles en la institución.</p>
                ) : null}
                {validationErrors?.course ? (
                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{validationErrors.course}</p>
                ) : null}
                {validationErrors?.duplicate ? (
                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{validationErrors.duplicate}</p>
                ) : null}
            </div>
        </>
    );
};

export default BasicInfoFields;