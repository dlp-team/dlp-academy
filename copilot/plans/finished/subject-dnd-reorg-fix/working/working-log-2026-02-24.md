# Working Log — 2026-02-24

## Implemented
- Updated `handleDropOnFolderWrapper` to base confirmation behavior on sharing delta between source folder and target folder.
- Removed parent-shared gating for unshare confirmation so share-loss prompts trigger consistently.
- Updated `moveSubjectBetweenFolders` to remove subject membership from all local non-target source folders during a move.
- Kept optimistic UI updates and rollback behavior for list-mode move responsiveness.

## Validation
- Static errors checked in modified files:
  - `src/pages/Home/hooks/useHomePageHandlers.js`
  - `src/hooks/useFolders.js`
- Result: no errors.

## Pending
- Manual UX verification for breadcrumb shared-folder scenarios.
- Prepare reviewing checklist before plan closure.
