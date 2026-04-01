// src/pages/AdminDashboard/utils/adminUserRoleConstants.ts
export const ADMIN_USER_ROLE_LABELS: Record<string, string> = {
    admin: 'Admin Global',
    institutionadmin: 'Admin Institución',
    teacher: 'Profesor',
    student: 'Alumno',
};

export const ADMIN_USER_ROLE_FILTERS = ['all', 'admin', 'institutionadmin', 'teacher', 'student'];

export const ADMIN_USER_ROLE_OPTIONS = ['student', 'teacher', 'institutionadmin', 'admin'];

export const getAdminRoleFilterLabel = (role: string) => {
    if (role === 'all') return 'Todos';
    if (role === 'institutionadmin') return 'Admin Inst.';
    return role.charAt(0).toUpperCase() + role.slice(1);
};

export const getAdminRoleOptionLabel = (role: string) => {
    return ADMIN_USER_ROLE_LABELS[role] || role;
};
