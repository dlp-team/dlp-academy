# modalCloseGuardUtils.ts

## Changelog
- **2026-04-05:** Added shared close-guard evaluator for sharing-focused modals to unify dirty-state close decisions.

## Purpose
- **Source file:** `src/utils/modalCloseGuardUtils.ts`
- **Last documented:** 2026-04-05
- **Role:** Utility module for deterministic modal close decisions when there are pending share actions or unsaved sharing changes.

## API
- `canCloseSharingModal({ pendingShareActionType, hasUnsavedSharingChanges })`
  - Returns `{ allowClose, reason }`.
  - Reasons:
    - `pending-apply-all`
    - `unsaved-sharing-changes`
    - `null` (close allowed)

## Current Consumers
- `src/pages/Home/components/FolderManager.tsx`
- `src/pages/Subject/modals/SubjectFormModal.tsx`

## Test Coverage
- `tests/unit/utils/modalCloseGuardUtils.test.js`

## Maintenance Notes
- Keep reason identifiers stable because callers may branch UI behavior based on reason.
- Prefer extending this utility for additional modal close-guard scenarios instead of duplicating branch logic in components.
