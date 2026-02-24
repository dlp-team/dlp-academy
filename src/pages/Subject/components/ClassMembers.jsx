// src/pages/Subject/components/ClassMembers.jsx
import React, { useState } from 'react';
import { Users, Crown, Shield, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';

const ROLE_CONFIG = {
    creator: {
        label: 'Creador',
        icon: Crown,
        badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    editor: {
        label: 'Administrador',
        icon: Shield,
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    viewer: {
        label: 'Estudiante',
        icon: GraduationCap,
        badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
};

const MemberRow = ({ member }) => {
    const config = ROLE_CONFIG[member.role] || ROLE_CONFIG.viewer;
    const Icon = config.icon;

    return (
        <div className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
            {/* Avatar */}
            {member.photoURL ? (
                <img
                    src={member.photoURL}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
                />
            ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white dark:ring-slate-800">
                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
            )}

            {/* Name + Email */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {member.name}
                </p>
                {member.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {member.email}
                    </p>
                )}
            </div>

            {/* Role Badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${config.badgeClass}`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </span>
        </div>
    );
};

const ClassMembers = ({ members, loading }) => {
    const [isOpen, setIsOpen] = useState(false);

    const creatorCount = members.filter(m => m.role === 'creator').length;
    const editorCount = members.filter(m => m.role === 'editor').length;
    const viewerCount = members.filter(m => m.role === 'viewer').length;

    return (
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            Clase
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Mini role counters */}
                    {!isOpen && members.length > 0 && (
                        <div className="hidden sm:flex items-center gap-1.5">
                            {creatorCount > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                    <Crown className="w-3 h-3" /> {creatorCount}
                                </span>
                            )}
                            {editorCount > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Shield className="w-3 h-3" /> {editorCount}
                                </span>
                            )}
                            {viewerCount > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    <GraduationCap className="w-3 h-3" /> {viewerCount}
                                </span>
                            )}
                        </div>
                    )}
                    {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </button>

            {/* Expandable member list */}
            {isOpen && (
                <div className="mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                            Cargando miembros...
                        </div>
                    ) : members.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No hay miembros en esta clase.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-slate-800">
                            {members.map((member) => (
                                <MemberRow key={member.uid} member={member} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClassMembers;
