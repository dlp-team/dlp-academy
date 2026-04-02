<!-- copilot/plans/inReview/institution-governance-and-academic-lifecycle-overhaul/phases/phase-03-deletion-lifecycle-and-bin-first-architecture.md -->

# Phase 03 - Deletion Lifecycle and Bin-First Architecture

## Status
- COMPLETED

## Objective
Unify deletion behavior so requested entities are routed through bin-first semantics, with explicit exceptions and typed confirmation for destructive operations.

## Scope
1. Folder deletion behavior:
   - cancel,
   - delete folder only (immediate folder removal, children retained appropriately),
   - delete folder plus contents (bin-first nested behavior).
2. Bin top-layer behavior for folder containers and nested internal element management.
3. Institution admin deletion flow for full course/class and dependent content with typed-name confirmation.
4. 15-day retention semantics and permanent delete paths.

## Files Expected
- `src/hooks/useFolders.ts`
- `src/hooks/useSubjects.ts`
- `src/pages/Home/components/BinView.jsx`
- `src/pages/Home/components/bin/**`
- `src/components/modals/FolderDeleteModal.jsx`
- Institution admin dashboard classes/courses components and modals

## Risks
- Orphaning child elements when folder-only delete is selected.
- Inconsistent metadata causing bin visibility mismatches.

## Validation Gate
- Correct behavior for all 3 folder-delete options.
- Bin shows container-first for nested folder deletion.
- Restore and permanent delete both function in nested paths.
- Permissions remain role-correct.

## Rollback
- Introduce behavior behind explicit mode flags where possible to preserve existing defaults.

## Completion Notes
- Slice 01 completed (2026-04-02):
   - Folder `delete all` path moved to trash-first metadata cascade (no direct subtree hard delete).
   - Folder bin APIs implemented in `useFolders` (`getTrashedFolders`, `restoreFolder`, `permanentlyDeleteFolder`).
   - Bin UI upgraded to typed entries (subject + folder) with type-aware restore/delete confirmations.
   - Top-level bin now suppresses subjects nested inside trashed folders to avoid duplicate surface entries.
   - Trashed folder entries can now be opened from bin to inspect nested trashed subjects and restore/delete them individually.
- Slice 02 completed (2026-04-02):
   - Bin drilldown now supports nested subfolder navigation level by level (subfolders + subjects at each active level).
   - Folder restore/permanent-delete scope now depends on selected target:
      - root target => full root tree,
      - nested target => selected nested subtree only.
   - Added regression tests for nested subtree restore/delete scoping and nested folder retrieval.
- Slice 03 completed (2026-04-02):
   - Institution admin course/class lifecycle moved to bin-first semantics in `useClassesCourses` (active/trashed split, restore, and permanent delete APIs).
   - `ClassesCoursesSection` now includes `Papelera` tab with:
      - trashed courses/classes rendering,
      - restore actions,
      - permanent delete actions guarded by exact typed-name confirmation.
   - Added/updated regression coverage for:
      - move-to-trash confirmation copy and handler routing,
      - bin restore action,
      - typed-name guard for permanent delete.
- Slice 04 completed (2026-04-02):
   - Added shared retention helper `trashRetentionUtils` to centralize 15-day lifecycle calculations.
   - Home `BinView` now auto-purges expired trashed entries on load with controlled one-pass guard:
      - expired top-level folders are permanently deleted,
      - expired subjects outside expired folders are permanently deleted.
   - Institution-admin `useClassesCourses` now purges expired trashed courses/classes during fetch cycles (including linked class cleanup for expired trashed courses).
   - Institution-admin paper-bin rows now surface retention countdown copy.
   - Added retention utility unit coverage and revalidated bin utility/component tests.
- Remaining for phase closure:
   - none (transitioned to Phase 04).

