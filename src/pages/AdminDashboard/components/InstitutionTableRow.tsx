// src/pages/AdminDashboard/components/InstitutionTableRow.tsx
import React from 'react';
import { ChevronRight, Pencil, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

type InstitutionTableRowProps = {
    school: any;
    onOpenDashboard: (schoolId: string) => void;
    onEdit: (school: any) => void;
    onToggle: (school: any) => void;
    onDelete: (school: any) => void;
};

const InstitutionTableRow = ({ school, onOpenDashboard, onEdit, onToggle, onDelete }: InstitutionTableRowProps) => {
    const isEnabled = school?.enabled !== false;

    return (
        <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isEnabled ? '' : 'opacity-60'}`}>
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{school?.name}</td>
            <td className="px-6 py-4 font-mono text-xs" title={school?.id}>{school?.id}</td>
            <td className="px-6 py-4">{school?.domain || school?.domains?.[0] || '—'}</td>
            <td className="px-6 py-4 capitalize">{school?.type || 'school'}</td>
            <td className="px-6 py-4">{school?.city || '—'}</td>
            <td className="px-6 py-4">{Array.isArray(school?.institutionAdministrators) ? school.institutionAdministrators.join(', ') : (school?.adminEmail || '—')}</td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {isEnabled ? 'Activa' : 'Deshabilitada'}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={() => onOpenDashboard(school?.id)}
                        title="Abrir panel de institución"
                        className="text-slate-400 hover:text-violet-500 p-2 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onEdit(school)}
                        title="Editar"
                        className="text-slate-400 hover:text-indigo-500 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onToggle(school)}
                        title={isEnabled ? 'Deshabilitar' : 'Habilitar'}
                        className="text-slate-400 hover:text-amber-500 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                    >
                        {isEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => onDelete(school)}
                        title="Eliminar"
                        className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default InstitutionTableRow;
