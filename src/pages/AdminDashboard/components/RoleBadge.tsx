// src/pages/AdminDashboard/components/RoleBadge.tsx
import React from 'react';

type RoleBadgeProps = {
    role: string;
};

const RoleBadge = ({ role }: RoleBadgeProps) => {
    const map: Record<string, { label: string; cls: string }> = {
        admin: { label: 'Admin Global', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
        institutionadmin: { label: 'Admin Institución', cls: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400' },
        teacher: { label: 'Profesor', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
        student: { label: 'Alumno', cls: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400' },
    };

    const cfg = map[role] || { label: role, cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' };
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
};

export default RoleBadge;
