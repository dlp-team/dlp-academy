// src/pages/AdminDashboard/utils/adminInstitutionBatchQueueUtils.ts
import { buildInstitutionInviteSyncPlan } from './adminInstitutionInviteSyncUtils';

type BatchLike = {
    set: (docRef: any, payload: any) => void;
    update: (docRef: any, payload: any) => void;
    delete: (docRef: any) => void;
};

type ExistingInvite = {
    id: string;
    email: string;
};

type QueueCommonArgs = {
    batch: BatchLike;
    institutionPayload: any;
    admins: string[];
    institutionalCode: string;
    institutionId: string;
    createAutoInviteRef: () => any;
    createInviteRefById: (inviteId: string) => any;
    createTimestamp: () => any;
};

type QueueEditArgs = QueueCommonArgs & {
    institutionRef: any;
    existingInvites: ExistingInvite[];
};

export const queueInstitutionEditBatchOps = ({
    batch,
    institutionRef,
    institutionPayload,
    existingInvites,
    admins,
    institutionalCode,
    institutionId,
    createAutoInviteRef,
    createInviteRefById,
    createTimestamp,
}: QueueEditArgs) => {
    batch.update(institutionRef, institutionPayload);

    const { emailsToAdd, invitesToDelete } = buildInstitutionInviteSyncPlan(existingInvites, admins);

    invitesToDelete.forEach((inviteItem) => {
        batch.delete(createInviteRefById(inviteItem.id));
    });

    emailsToAdd.forEach((emailItem) => {
        batch.set(createAutoInviteRef(), {
            email: emailItem,
            role: 'institutionadmin',
            institutionId,
            invitedAt: createTimestamp(),
        });
    });

    if (institutionalCode) {
        batch.set(createInviteRefById(institutionalCode), {
            type: 'institutional',
            institutionId,
            createdAt: createTimestamp(),
        });
    }
};

type QueueCreateArgs = QueueCommonArgs & {
    institutionRef: any;
};

export const queueInstitutionCreateBatchOps = ({
    batch,
    institutionRef,
    institutionPayload,
    admins,
    institutionalCode,
    institutionId,
    createAutoInviteRef,
    createInviteRefById,
    createTimestamp,
}: QueueCreateArgs) => {
    batch.set(institutionRef, {
        ...institutionPayload,
        enabled: true,
        createdAt: createTimestamp(),
    });

    admins.forEach((emailItem) => {
        batch.set(createAutoInviteRef(), {
            email: emailItem,
            role: 'institutionadmin',
            institutionId,
            invitedAt: createTimestamp(),
        });
    });

    if (institutionalCode) {
        batch.set(createInviteRefById(institutionalCode), {
            type: 'institutional',
            institutionId,
            createdAt: createTimestamp(),
        });
    }
};
