# Worklog Phase 04 (Completed)

## Objective
Finalize runtime behavior for shortcut-aware drag/drop and merged content resolution in Home so recipient organization never mutates source ownership/parent structure.

## Session chronology (detailed)

### A) DnD path verification and normalization
- Confirmed drag payload includes shortcut context (`subjectShortcutId`) in both card and list modules.
- Verified wrappers route shortcut drops to `moveShortcut` instead of source update paths.
- Verified root/upward drop path supports moving shortcut to root/parent.
- Confirmed non-owner direct source moves are blocked when no shortcut is present.

### B) Resolution + merge behavior verification
- Verified shortcuts are subscribed by `ownerId == currentUser.uid`.
- Verified shortcut targets are resolved by `targetType` and `targetId`.
- Verified normalized shortcut output includes metadata for transparent rendering.
- Verified folder and subject merged selectors dedupe by target identity.
- Verified behavior where owner’s direct entities remain visible while non-owner view prioritizes shortcut entries.

### C) Orphan handling verification
- Confirmed resolver outputs orphan state for:
  - missing target docs
  - inaccessible target docs
  - target resolution errors
- Confirmed Home grid/list renders orphan cards.
- Confirmed orphan card removal path deletes only shortcut doc.

### D) Scope alignment correction
- Adjusted phase documentation to reflect product decision:
  - shortcut creation is share-driven, not drag-created.
  - Phase 04 DnD handles movement/resolution of existing shortcuts.

## Implemented/validated components
- Home DnD handlers and wrappers
- Shortcut resolver and movement operations
- Home merged selectors for folders/subjects
- Orphan UI rendering and cleanup action
- Permission checks for move/edit behaviors

## Production behavior ensured in this phase
- Recipient reorganization does not mutate source `parentId`.
- Existing shortcuts can be moved across recipient folders and root.
- Merged Home lists render stable content without duplicate target cards.
- Deleted/unshared targets degrade to ghost/orphan cards and are removable.

## Remaining dependencies
- Phase 06 (migration): data consistency backfill for legacy docs.
- Phase 07 (security rules): tighten and fully validate least-privilege policy.

## Mandatory Security Verification (you must run)
Run this checklist in your environment after deploy and before declaring stable:

- [ ] **Share + shortcut creation path**
   - Share subject A to user B.
   - Expected: subject updates (`sharedWith*`) and one shortcut appears for B.

- [ ] **Shortcut dedupe path**
   - Re-share same subject A to same user B.
   - Expected: no duplicate share entry and no duplicate shortcut.

- [ ] **Shortcut move path (recipient)**
   - As B, drag shortcut into folder X, then back to root.
   - Expected: shortcut `parentId` changes; source subject `parentId/folderId` unchanged.

- [ ] **Non-owner source mutation denial**
   - As B, attempt to move source entity directly without shortcut context.
   - Expected: operation blocked or no source mutation.

- [ ] **Orphan deletion path**
   - Delete or unshare source from owner account.
   - As B, confirm orphan card appears, then remove it.
   - Expected: only shortcut deleted; no source-side writes.

- [ ] **Cross-user isolation check**
   - As unrelated user C, query/attempt access to B shortcut docs.
   - Expected: denied by rules.

- [ ] **Tenant boundary check (if institutionId enabled)**
   - Attempt cross-institution read/write for shortcut/source.
   - Expected: denied by rules/query constraints.

## Sign-off criteria
Phase 04 is considered secure and complete only if all 7 checks pass on real project rules (not permissive temporary rules).
