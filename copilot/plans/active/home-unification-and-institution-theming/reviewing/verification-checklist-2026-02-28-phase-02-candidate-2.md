# Verification Checklist — 2026-02-28 — Phase 02 Candidate 2

## Scope under review
- Centralize repeated source+shortcut merge/dedup logic used by Home tree collections.

## Requested-scope checks
- [x] Added shared merge utility in `src/utils/mergeUtils.js`.
- [x] Replaced repeated merge+dedup block in `src/pages/Home/Home.jsx` for `treeFolders` and `treeSubjects`.
- [x] Replaced repeated merge+dedup block in `src/pages/Home/components/HomeContent.jsx` for `allFoldersForTree` and `allSubjectsForTree`.
- [x] No feature additions or removals.

## Lossless-adjacent checks
- [x] Source-first, shortcut-second order preserved.
- [x] Merge keys preserved (`source:${id}`, `shortcut:${shortcutId || id}`).
- [x] Existing filter branches (`matchesSharedFilter`) remain unchanged and run after merge.
- [x] Public props/contracts unchanged.

## Diagnostics checks
- [x] `get_errors` run for all touched runtime files.
- [x] No diagnostics errors found.

## Manual smoke checks (to execute)
- [ ] Home root: folder/subject counts unchanged compared to pre-change behavior.
- [ ] Home current folder: tree navigation still resolves expected entries.
- [ ] Shared scope toggle still filters correctly in HomeContent.
- [ ] Shortcuts and originals deduplicate exactly as before.

## Result status
- Automated checks: PASS
- Manual checks: PENDING
