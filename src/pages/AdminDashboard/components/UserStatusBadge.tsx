// src/pages/AdminDashboard/components/UserStatusBadge.tsx
import React from 'react';

type UserStatusBadgeProps = {
    enabled?: boolean;
};

const UserStatusBadge = ({ enabled = true }: UserStatusBadgeProps) => {
    const active = enabled !== false;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            active
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
            {active ? 'Activo' : 'Deshabilitado'}
        </span>
    );
};

export default UserStatusBadge;
