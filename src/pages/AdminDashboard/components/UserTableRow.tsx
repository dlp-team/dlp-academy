// src/pages/AdminDashboard/components/UserTableRow.tsx
import React from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import RoleBadge from './RoleBadge';
import UserStatusBadge from './UserStatusBadge';

type UserTableRowProps = {
    userData: any;
    handleRoleChange: (userData: any, role: string) => void;
    handleToggle: (userData: any) => void;
};

const UserTableRow = ({ userData, handleRoleChange, handleToggle }: UserTableRowProps) => {
    const isEnabled = userData?.enabled !== false;

    return (
        <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isEnabled ? '' : 'opacity-60'}`}>
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{userData?.displayName || 'Sin nombre'}</td>
            <td className="px-6 py-4">{userData?.email}</td>
            <td className="px-6 py-4"><RoleBadge role={userData?.role} /></td>
            <td className="px-6 py-4"><UserStatusBadge enabled={isEnabled} /></td>
            <td className="px-6 py-4">
                <select
                    value={userData?.role || ''}
                    onChange={(e) => handleRoleChange(userData, e.target.value)}
                    className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-purple-400"
                >
                    <option value="student">Alumno</option>
                    <option value="teacher">Profesor</option>
                    <option value="institutionadmin">Admin Institución</option>
                    <option value="admin">Admin Global</option>
                </select>
            </td>
            <td className="px-6 py-4 text-right">
                <button
                    onClick={() => handleToggle(userData)}
                    title={isEnabled ? 'Deshabilitar' : 'Habilitar'}
                    className="text-slate-400 hover:text-amber-500 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                >
                    {isEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
            </td>
        </tr>
    );
};

export default UserTableRow;
