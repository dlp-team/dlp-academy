// src/pages/AdminDashboard/utils/adminUserConfirmActionUtils.ts
export const buildUserConfirmUpdatePayload = (userConfirm: any) => {
    if (!userConfirm?.user) {
        return null;
    }

    if (userConfirm.action === 'toggle') {
        return {
            enabled: !(userConfirm.user.enabled !== false),
        };
    }

    if (userConfirm.action === 'role') {
        return {
            role: userConfirm.newRole,
        };
    }

    return null;
};
