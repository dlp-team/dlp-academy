// src/components/profile/UserCard.jsx
import React from 'react';
import { Edit2, LogOut, MapPin, LayoutDashboard } from 'lucide-react';
import Avatar from '../ui/Avatar'; // Import the new Avatar component
import { COUNTRIES } from '../../utils/profileConstants';

const UserCard = ({ user, userProfile, onEdit, onLogout }) => {
    const displayName = userProfile?.displayName || user?.displayName || "Usuario";
    const photoURL = userProfile?.photoURL || user?.photoURL;
    const countryData = userProfile?.country ? COUNTRIES[userProfile.country] : null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8 relative overflow-hidden transition-colors">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                        <Avatar photoURL={photoURL} name={displayName} />
                        <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800"></div>
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
                            {countryData && (
                                <span className="flex items-center gap-1 bg-slate-100 dark:bg-gray-700 px-2 py-0.5 rounded text-sm text-gray-700 dark:text-gray-300">
                                    <MapPin size={14} /> {countryData.name} {countryData.flag}
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2 justify-center md:justify-start">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wide">
                                {userProfile?.role === 'teacher' ? '👨‍🏫 Docente' : '👨‍🎓 Estudiante'}
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wide">
                                <LayoutDashboard className="w-3 h-3" />
                                Plan Gratuito
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