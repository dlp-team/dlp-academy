<!-- copilot/explanations/temporal/lossless-reports/2026-04-03/phase-08-shortcut-deletion-and-subject-save-fix.md -->
# Lossless Change Report - Phase 08 Shortcut Deletion and Subject Save Fix (2026-04-03)

## Requested Scope
- Ghost shortcut deletion fix: teacher deletion should move shortcut to bin.
- Non-owner shared deletion fix: unshare for current user and remove shortcut without bin route.
- Root-cause and fix for false subject-save error shown behind modal when save already succeeded.

## Preserved Behaviors
- Owner delete semantics for subjects/folders remain unchanged.
- Shared-tree unshare guard remains intact.
- Shortcut hide/unhide behavior remains unchanged.
- Existing hard-delete behavior remains unchanged for non-orphan shortcut delete actions.
- Subject update primary write path remains unchanged; only post-write invite-code mapping error propagation changed.

## Files Touched
- `src/hooks/useHomeHandlers.ts`
- `src/pages/Home/hooks/useHomeBulkSelection.ts`
- `src/hooks/useShortcuts.tsx`
- `src/pages/Home/components/BinView.tsx`
- `src/pages/Home/components/bin/BinGridItem.tsx`
- `src/pages/Home/components/bin/BinSelectionPanel.tsx`
- `src/hooks/useSubjects.ts`
- `tests/unit/hooks/useHomeHandlers.shortcuts.test.js`
- `tests/unit/hooks/useShortcuts.test.js`

## Per-File Verification
- `src/hooks/useHomeHandlers.ts`
  - Shortcut `unshare` actions now perform unshare + shortcut removal.
  - Orphan shortcut delete actions now route via `{ moveToBin: true }`.
- `src/pages/Home/hooks/useHomeBulkSelection.ts`
  - Bulk delete routes orphan shortcuts to bin and keeps direct delete for non-orphans.
- `src/hooks/useShortcuts.tsx`
  - Added shortcut soft-delete lifecycle (`moveToBin`, `getTrashedShortcuts`, `restoreShortcut`, `permanentlyDeleteShortcut`).
  - Active shortcut stream now filters trashed shortcuts out of Home views.
- `src/pages/Home/components/BinView.tsx`
  - Added shortcut item loading and typed restore/permanent-delete handling.
  - Preserved existing folder drilldown semantics.
- `src/pages/Home/components/bin/BinGridItem.tsx`
  - Added shortcut-aware labels/badges while preserving prior visual structure.
- `src/pages/Home/components/bin/BinSelectionPanel.tsx`
  - Added shortcut-specific restore label.
- `src/hooks/useSubjects.ts`
  - Invite-code mapping sync is now best-effort after successful subject update to avoid false save failure feedback.
- `tests/unit/hooks/useHomeHandlers.shortcuts.test.js`
  - Updated expectations for unshare+delete and orphan-to-bin routes.
- `tests/unit/hooks/useShortcuts.test.js`
  - Added coverage for soft-delete-to-bin behavior.

## Validation Summary
- `get_errors` on touched files: clean.
- `npm run test -- tests/unit/hooks/useHomeHandlers.shortcuts.test.js tests/unit/hooks/useShortcuts.test.js`: passed (40/40).
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with pre-existing warnings only in `src/pages/Content/Exam.jsx` and `src/pages/Content/StudyGuide.jsx`.

## Risk Review
- Shortcut bin integration introduces new shortcut item types in bin view.
- Risk mitigated by typed branching in restore/delete handlers and focused unit coverage for shortcut routing.
