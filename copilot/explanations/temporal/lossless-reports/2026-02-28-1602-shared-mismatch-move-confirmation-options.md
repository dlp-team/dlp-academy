# Lossless Change Report — Shared mismatch move confirmation (3 choices)

## Summary
Implemented the requested confirmation flow when dropping a shared subject/folder into a shared folder with different shared-user sets.

## New behavior
When shared sets do not match, a confirmation modal appears with:
1. Cancel
2. Move and align to destination folder users (unshare users not in destination)
3. Move and merge users (destination folder receives union of users)

## Files changed
- `src/pages/Home/hooks/useHomePageHandlers.js`
  - Added helpers:
    - shared set comparison
    - target folder shared-user merge
  - Added mismatch checks and confirm wiring for:
    - subject drop into folder
    - folder drop via breadcrumb
    - folder nest drop
  - New `shareConfirm.type = 'shared-mismatch-move'` payload with `onConfirm` and `onMergeConfirm`.
- `src/pages/Home/components/HomeShareConfirmModals.jsx`
  - Added UI branch for `shared-mismatch-move` with 3 explicit choices.
- `src/hooks/useFolders.js`
  - Added `alignToTargetFolder` option in `moveSubjectBetweenFolders`.
  - Used for strict unshare behavior in option #2.

## Option semantics
- Option #2 (align): moves element and aligns subject sharing to destination folder sharing exactly.
- Option #3 (merge): updates destination folder sharing to union(users destination + dropped element), then moves element.

## Validation
- Diagnostics on touched files: no errors.
