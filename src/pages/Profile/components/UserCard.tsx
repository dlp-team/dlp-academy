// src/pages/Profile/components/UserCard.jsx
import React from 'react';
import { Edit2, LogOut, BookOpen, GraduationCap, Shield, Crown } from 'lucide-react';
import Avatar from '../../../components/ui/Avatar'; 

const UserCard = ({ user, userProfile, onEdit, onLogout }: any) => {
    const displayName = userProfile?.displayName || user?.displayName || "Usuario";
    const photoURL = userProfile?.photoURL || user?.photoURL;
    const normalizedRole = String(userProfile?.role || user?.role || '').toLowerCase();

    const roleBadgeConfig = (() => {
        if (normalizedRole === 'admin') {
            return { icon: Crown, label: 'Administrador', classes: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' };
        }
        if (normalizedRole === 'institutionadmin') {
            return { icon: Shield, label: 'Administrador de institución', classes: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' };
        }
        if (normalizedRole === 'teacher') {
            return { icon: BookOpen, label: 'Docente', classes: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' };
        }
        return { icon: GraduationCap, label: 'Estudiante', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' };
    })();
    const RoleIcon = roleBadgeConfig.icon;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8 relative overflow-hidden transition-colors">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                        <Avatar photoURL={photoURL} name={displayName} />
                    </div>
                    
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                             <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{displayName}</h1>
                            <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                                <Edit2 size={18} />
                            </button>
                        </div>
                       
                        <div className="flex flex-col md:flex-row items-center gap-3 text-gray-500 dark:text-gray-400 mb-3">
                            <span>{user?.email}</span>
                        </div>

                        <div className="flex gap-2 justify-center md:justify-start">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${roleBadgeConfig.classes}`}>
                                <RoleIcon className="w-4 h-4" />
                                {roleBadgeConfig.label}
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={onLogout} className="group flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl font-semibold hover:bg-red-600 hover:text-white dark:hover:bg-red-700 dark:hover:text-white transition-all duration-300">
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default UserCard;