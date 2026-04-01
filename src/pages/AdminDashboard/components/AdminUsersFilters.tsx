// src/pages/AdminDashboard/components/AdminUsersFilters.tsx
import React from 'react';
import { Search } from 'lucide-react';
import {
    ADMIN_USER_ROLE_FILTERS,
    getAdminRoleFilterLabel,
} from '../utils/adminUserRoleConstants';

type AdminUsersFiltersProps = {
    roleFilter: string;
    onRoleFilterChange: (role: string) => void;
    search: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
};

const AdminUsersFilters = ({
    roleFilter,
    onRoleFilterChange,
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
}: AdminUsersFiltersProps) => {
    return (
        <>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit flex-wrap gap-1">
                    {ADMIN_USER_ROLE_FILTERS.map((roleValue) => (
                        <button
                            key={roleValue}
                            onClick={() => onRoleFilterChange(roleValue)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                                roleFilter === roleValue
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            {getAdminRoleFilterLabel(roleValue)}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>

            <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 text-slate-600 dark:text-slate-300"
            >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="disabled">Deshabilitados</option>
            </select>
        </>
    );
};

export default AdminUsersFilters;
