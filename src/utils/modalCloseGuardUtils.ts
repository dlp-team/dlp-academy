// src/utils/modalCloseGuardUtils.ts
export type ModalCloseGuardReason = 'pending-apply-all' | 'unsaved-sharing-changes' | null;

type SharingModalCloseContext = {
  pendingShareActionType?: string | null;
  hasUnsavedSharingChanges: boolean;
};

export const canCloseSharingModal = ({
  pendingShareActionType,
  hasUnsavedSharingChanges,
}: SharingModalCloseContext): { allowClose: boolean; reason: ModalCloseGuardReason } => {
  if (pendingShareActionType === 'apply-all') {
    return { allowClose: false, reason: 'pending-apply-all' };
  }

  if (hasUnsavedSharingChanges) {
    return { allowClose: false, reason: 'unsaved-sharing-changes' };
  }

  return { allowClose: true, reason: null };
};
