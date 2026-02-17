// src/components/auth/UserTypeSelector.jsx
import React from 'react';
import { GraduationCap, Briefcase } from 'lucide-react';

const UserTypeSelector = ({ selectedType, onSelect }) => {
    return (
        <div className="grid grid-cols-2 gap-4 mb-6">
            <button
                type="button"
                onClick={() => onSelect('student')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedType === 'student'
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:bg-gray-50 dark:hover:bg-slate-750 cursor-pointer' 
                }`}
            >
                <GraduationCap className={`w-6 h-6 mb-2 ${selectedType === 'student' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
                <span className="font-semibold text-sm">Estudiante</span>
            </button>

            <button
                type="button"
                onClick={() => onSelect('teacher')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedType === 'teacher'
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:bg-gray-50 dark:hover:bg-slate-750 cursor-pointer'
                }`}
            >
                <Briefcase className={`w-6 h-6 mb-2 ${selectedType === 'teacher' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
                <span className="font-semibold text-sm">Docente</span>
            </button>
        </div>
    );
};

export default UserTypeSelector;