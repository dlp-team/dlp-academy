// src/pages/AdminDashboard/components/AdminInstitutionsFilters.tsx
import React from 'react';
import { Plus, Search } from 'lucide-react';

type AdminInstitutionsFiltersProps = {
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    typeFilter: string;
    onTypeFilterChange: (value: string) => void;
    search: string;
    onSearchChange: (value: string) => void;
    onToggleCreateForm: () => void;
};

const AdminInstitutionsFilters = ({
    statusFilter,
    onStatusFilterChange,
    typeFilter,
    onTypeFilterChange,
    search,
    onSearchChange,
    onToggleCreateForm,
}: AdminInstitutionsFiltersProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2">
                <select
                    aria-label="Filtrar por estado"
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 text-slate-600 dark:text-slate-300"
                >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activas</option>
                    <option value="disabled">Deshabilitadas</option>
                </select>
                <select
                    aria-label="Filtrar por tipo"
                    value={typeFilter}
                    onChange={(e) => onTypeFilterChange(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 text-slate-600 dark:text-slate-300"
                >
                    <option value="all">Todos los tipos</option>
                    <option value="school">Escuela</option>
                    <option value="academy">Academia</option>
                    <option value="university">Universidad</option>
                    <option value="training-center">Centro</option>
                    <option value="other">Otro</option>
                </select>
            </div>

            <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar institución..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>
            <button
                onClick={onToggleCreateForm}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-purple-200 dark:shadow-purple-900/20 transition-all active:scale-95 text-sm"
            >
                <Plus className="w-4 h-4" /> Nueva Institución
            </button>
        </div>
    );
};

export default AdminInstitutionsFilters;
