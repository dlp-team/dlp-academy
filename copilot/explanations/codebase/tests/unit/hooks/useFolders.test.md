<!-- copilot/explanations/codebase/tests/unit/hooks/useFolders.test.md -->
# useFolders.test.js

## Overview
- **Source file:** `tests/unit/hooks/useFolders.test.js`
- **Last documented:** 2026-03-30
- **Role:** Unit coverage for folder hook data-sync, deletion resilience, sharing, ownership transfer, and move guards.

## Coverage
- Realtime owned/shared snapshot merge behavior.
- Folder creation payload integrity (`ownerId`, `ownerEmail`, `institutionId`).
- Recursive and non-recursive delete flows with best-effort cleanup resilience.
- Transfer ownership validation and shortcut write-through behavior.
- Circular move guard for `moveFolderBetweenParents` with non-blocking behavior.

## Changelog
### 2026-04-02
- Updated deletion assertions to reflect folder trash-first behavior (batch updates with trash metadata instead of immediate batch deletes).
- Added coverage for new folder bin APIs:
	- top-level trashed-folder filtering (`getTrashedFolders`),
	- subtree restore (`restoreFolder`),
	- subtree permanent delete (`permanentlyDeleteFolder`).
- Added nested-scope regression coverage to guarantee that:
	- `getTrashedFolders({ includeNested: true })` returns nested trashed folders for drilldown,
	- restoring a nested trashed folder restores only that selected subtree,
	- permanently deleting a nested trashed folder deletes only that selected subtree.

### 2026-03-30
- Added regression coverage for circular folder move protection to ensure no browser alert is triggered and no batch writes occur.
