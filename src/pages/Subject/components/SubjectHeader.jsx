// src/pages/Subject/components/SubjectHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Home, Pencil, Trash2, Search, X, Users, Crown, Shield, GraduationCap, Maximize2, Minimize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SubjectIcon, { getIconColor } from '../../../components/ui/SubjectIcon';

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
        <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
            {member.photoURL ? (
                <img
                    src={member.photoURL}
                    alt={member.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
                />
            ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white dark:ring-slate-800">
                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
            )}
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
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${config.badgeClass}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        </div>
    );
};

const SubjectHeader = ({
    subject,
    onEdit,
    onDelete,
    hasTopics,
    searchTerm,
    onSearch,
    isTeacher,
    classMembers = [],
    membersLoading = false,
    topicCount
}) => {
    const navigate = useNavigate();
    const [showMembers, setShowMembers] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const panelRef = useRef(null);
    const btnRef = useRef(null);

    // Close on outside click (only for popover mode, not fullscreen)
    useEffect(() => {
        if (!showMembers || expanded) return;
        const handler = (e) => {
            if (
                panelRef.current && !panelRef.current.contains(e.target) &&
                btnRef.current && !btnRef.current.contains(e.target)
            ) {
                setShowMembers(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showMembers, expanded]);

    const closeMembersPanel = () => {
        setShowMembers(false);
        setExpanded(false);
    };

    return (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <style>{`
                @keyframes ios-popover-in {
                    0% {
                        opacity: 0;
                        transform: scale(0.85) translateY(-8px);
                    }
                    60% {
                        opacity: 1;
                        transform: scale(1.02) translateY(2px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                @keyframes ios-popover-out {
                    0% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0.9) translateY(-6px);
                    }
                }
                .ios-popover-enter {
                    animation: ios-popover-in 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                .ios-popover-exit {
                    animation: ios-popover-out 0.2s cubic-bezier(0.4, 0, 1, 1) forwards;
                }
                @keyframes ios-fullscreen-in {
                    0% {
                        opacity: 0;
                        transform: scale(0.7);
                        border-radius: 24px;
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.01);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                        border-radius: 24px;
                    }
                }
                @keyframes ios-backdrop-in {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                .ios-fullscreen-enter {
                    animation: ios-fullscreen-in 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                .ios-backdrop-enter {
                    animation: ios-backdrop-in 0.3s ease-out forwards;
                }
            `}</style>

            <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 cursor-pointer transition-colors"
            >
                <Home className="w-5 h-5" /> Volver a Asignaturas
            </button>

            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    {subject.cardStyle === 'modern' ? (
                        <div className={`w-16 h-16 flex items-center justify-center ${getIconColor(subject.color)}`}>
                            <SubjectIcon iconName={subject.icon} className="w-14 h-14" />
                        </div>
                    ) : (
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-sm shadow-indigo-500/20`}>
                            <SubjectIcon iconName={subject.icon} className="w-8 h-8 text-white" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {subject.name}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {topicCount != null ? topicCount : (subject.topicCount || 0)} temas
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 items-center">

                    {/* --- EXPANDING SEARCH BAR --- */}
                    <div className={`
                        group flex items-center
                        bg-white dark:bg-slate-900
                        border border-gray-200 dark:border-slate-700
                        rounded-xl shadow-sm
                        transition-all duration-300 ease-in-out
                        ${searchTerm ? 'w-64' : 'w-12 hover:w-64 focus-within:w-64'}
                        overflow-hidden
                        mr-1
                    `}>
                        <div className="flex-shrink-0 p-3 text-gray-500 dark:text-gray-400 cursor-pointer">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearch(e.target.value)}
                            placeholder="Buscar tema o número..."
                            className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 text-sm placeholder-gray-400 pr-3"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => onSearch('')}
                                className="p-2 mr-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* --- CLASS MEMBERS BUTTON --- */}
                    <div className="relative">
                        <button
                            ref={btnRef}
                            onClick={() => { setShowMembers(!showMembers); setExpanded(false); }}
                            className={`p-3 border rounded-xl shadow-sm transition-all hover:scale-105 ${
                                showMembers
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                            title="Clase"
                        >
                            <Users className="w-5 h-5" />
                        </button>

                        {/* --- MEMBERS POPOVER (iPhone style) --- */}
                        {showMembers && !expanded && (
                            <div
                                ref={panelRef}
                                className="ios-popover-enter absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 overflow-hidden"
                            >
                                {/* Panel header */}
                                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Clase</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {classMembers.length} {classMembers.length === 1 ? 'miembro' : 'miembros'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setExpanded(true)}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                            title="Expandir"
                                        >
                                            <Maximize2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={closeMembersPanel}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="mx-4 border-t border-gray-100 dark:border-slate-800" />

                                {/* Member list */}
                                <div className="p-2 max-h-72 overflow-y-auto">
                                    {membersLoading ? (
                                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                            Cargando miembros...
                                        </div>
                                    ) : classMembers.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                            No hay miembros en esta clase.
                                        </div>
                                    ) : (
                                        <div className="space-y-0.5">
                                            {classMembers.map((member) => (
                                                <MemberRow key={member.uid} member={member} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- FULLSCREEN MEMBERS MODAL (iPhone style) --- */}
                    {showMembers && expanded && (
                        <div className="ios-backdrop-enter fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/40 backdrop-blur-sm"
                            onClick={(e) => { if (e.target === e.currentTarget) closeMembersPanel(); }}
                        >
                            <div className="ios-fullscreen-enter w-full max-w-lg max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-black/20 dark:shadow-black/40 flex flex-col overflow-hidden">
                                {/* Modal header */}
                                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Clase</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {classMembers.length} {classMembers.length === 1 ? 'miembro' : 'miembros'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setExpanded(false)}
                                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                            title="Minimizar"
                                        >
                                            <Minimize2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={closeMembersPanel}
                                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="mx-6 border-t border-gray-100 dark:border-slate-800" />

                                {/* Scrollable member list */}
                                <div className="flex-1 overflow-y-auto p-3">
                                    {membersLoading ? (
                                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            Cargando miembros...
                                        </div>
                                    ) : classMembers.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            No hay miembros en esta clase.
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {classMembers.map((member) => (
                                                <MemberRow key={member.uid} member={member} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- EDIT BUTTON (Teacher only) --- */}
                    {isTeacher && (
                        <button
                            onClick={onEdit}
                            className="p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:scale-105"
                            title="Editar Asignatura"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                    )}

                    {/* --- DELETE BUTTON (Teacher only) --- */}
                    {isTeacher && (
                        <button
                            onClick={onDelete}
                            className="p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm transition-all hover:scale-105"
                            title="Eliminar Asignatura"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubjectHeader;
