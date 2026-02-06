// src/components/profile/ProfileSubjects.jsx
import React from 'react';
import { BookOpen } from 'lucide-react';
import SubjectIcon from '../modals/SubjectIcon'; // Adjust path as needed

const ProfileSubjects = ({ subjects }) => {
    return (
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-indigo-500" />
                    Mis Asignaturas
                </h2>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                    Total: {subjects.length}
                </span>
            </div>

            {subjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {subjects.map((sub) => (
                        <div key={sub.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${sub.color || 'from-gray-400 to-gray-500'} mb-4 flex items-center justify-center text-white`}>
                                <SubjectIcon iconName={sub.icon} className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-900 truncate">{sub.name}</h3>
                            <p className="text-sm text-gray-500 mb-3">{sub.course}</p>
                            <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-3">
                                <span>{(sub.topics || []).length} Temas generados</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
                    <p className="text-gray-500">Aún no has creado asignaturas.</p>
                </div>
            )}
        </div>
    );
};

export default ProfileSubjects;