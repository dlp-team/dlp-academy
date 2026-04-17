// tests/unit/utils/modalCloseGuardUtils.test.js
import { describe, it, expect } from 'vitest';
import { canCloseSharingModal } from '../../../src/utils/modalCloseGuardUtils';

describe('modalCloseGuardUtils', () => {
  it('allows close when there is no pending action and no unsaved sharing changes', () => {
    expect(
      canCloseSharingModal({
        pendingShareActionType: null,
        hasUnsavedSharingChanges: false,
      })
    ).toEqual({
      allowClose: true,
      reason: null,
    });
  });

  it('blocks close while apply-all confirmation is pending', () => {
    expect(
      canCloseSharingModal({
        pendingShareActionType: 'apply-all',
        hasUnsavedSharingChanges: false,
      })
    ).toEqual({
      allowClose: false,
      reason: 'pending-apply-all',
    });
  });

  it('blocks close when there are unsaved sharing changes', () => {
    expect(
      canCloseSharingModal({
        pendingShareActionType: null,
        hasUnsavedSharingChanges: true,
      })
    ).toEqual({
      allowClose: false,
      reason: 'unsaved-sharing-changes',
    });
  });
});
