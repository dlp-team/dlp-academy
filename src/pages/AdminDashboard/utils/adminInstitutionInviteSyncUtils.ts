// src/pages/AdminDashboard/utils/adminInstitutionInviteSyncUtils.ts
export type InstitutionInviteRecord = {
    id: string;
    email: string;
};

export const buildInstitutionInviteSyncPlan = (
    existingInvites: InstitutionInviteRecord[] = [],
    adminEmails: string[] = []
) => {
    const existingEmails = existingInvites
        .map((inviteItem) => inviteItem?.email)
        .filter(Boolean);

    const emailsToAdd = adminEmails.filter((email) => !existingEmails.includes(email));
    const invitesToDelete = existingInvites.filter((inviteItem) => !adminEmails.includes(inviteItem.email));

    return {
        emailsToAdd,
        invitesToDelete,
    };
};
