// src/pages/AdminDashboard/utils/adminConfirmDialogTextUtils.ts
export const buildInstitutionConfirmDialogText = (institutionConfirm: any) => {
    const institutionName = institutionConfirm?.institution?.name || 'esta institución';
    const isToggle = institutionConfirm?.action === 'toggle';
    const isEnabled = institutionConfirm?.institution?.enabled !== false;

    return {
        title: isToggle
            ? `${isEnabled ? 'Deshabilitar' : 'Habilitar'} institución`
            : 'Eliminar institución',
        description: isToggle
            ? `Se ${isEnabled ? 'deshabilitará' : 'habilitará'} "${institutionName}".`
            : `Se eliminará permanentemente "${institutionName}". Esta acción no se puede deshacer.`,
        confirmLabel: isToggle
            ? `${isEnabled ? 'Deshabilitar' : 'Habilitar'} institución`
            : 'Eliminar institución',
    };
};

export const buildUserConfirmDialogText = (userConfirm: any, roleLabels: Record<string, string>) => {
    const targetUserLabel = userConfirm?.user?.email || userConfirm?.user?.displayName || 'este usuario';
    const isRoleChange = userConfirm?.action === 'role';
    const isEnabled = userConfirm?.user?.enabled !== false;

    return {
        title: isRoleChange
            ? 'Cambiar rol de usuario'
            : `${isEnabled ? 'Deshabilitar' : 'Habilitar'} usuario`,
        description: isRoleChange
            ? `Se cambiará el rol de "${targetUserLabel}" a "${roleLabels[userConfirm?.newRole] || userConfirm?.newRole}".`
            : `Se ${isEnabled ? 'deshabilitará' : 'habilitará'} "${targetUserLabel}".`,
        confirmLabel: isRoleChange
            ? 'Cambiar rol'
            : `${isEnabled ? 'Deshabilitar' : 'Habilitar'} usuario`,
    };
};
