# Review Checklist — Home Sharing + Shortcuts Realignment

## Manual Tab Visibility

- [x] Owner account shows owned source cards correctly.
- [x] Non-owner account does not see non-owned source cards directly.
- [ ] Non-owner account sees shortcuts where `shortcut.ownerId == currentUser.uid`.
- [ ] No duplicate card appears for same target in same parent scope.

## Share Flows

- [ ] Sharing a subject creates recipient shortcut.
- [ ] Sharing a folder creates recipient shortcut.
- [ ] Re-sharing same target does not create duplicate shortcuts.
- [ ] Share flow remains successful under existing Firestore rules.

## Interaction Semantics

- [ ] Moving shortcut card updates only shortcut `parentId`.
- [ ] Moving source card updates source hierarchy fields only.
- [ ] Deleting shortcut deletes shortcut only.
- [ ] Deleting source resource preserves expected shortcut orphan behavior.
- [ ] Unsharing preserves orphan shortcuts (ghost cards) without deleting shortcuts.

## Cross-View Parity

- [ ] Grid view matches manual-tab visibility contract.
- [ ] List view matches manual-tab visibility contract.
- [ ] Folder tree modal uses shortcut/source separation correctly.
- [ ] Search respects the same ownership/shortcut visibility contract.

## Orphan Shortcut Behavior

- [x] Decision: Keep orphan shortcuts as ghost cards
- [x] Implementation: Shortcuts not deleted on unshare, ghost card UI pending verification
