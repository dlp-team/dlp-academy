# Working Log — 2026-02-24 (b)

## Bugfix: Residual Subject Duplication
- Added a post-move cleanup step in `moveSubjectBetweenFolders`.
- After every subject move, all folders are scanned and the subject is forcibly removed from any folder's subjectIds except the destination.
- This guarantees no subject duplication even if a previous batch or state update failed.

## Validation
- Static error check: no errors in updated file.
- Pending: manual test to confirm subject never appears in two folders after move and reload.
