# Phase 02 — Shared Home Abstractions (IN_PROGRESS)

## Objective
Extract and unify repeated Home behaviors into shared utilities/hooks with lossless semantics.

## Planned changes
- Introduce narrowly scoped shared helpers for repeated merge/share/unshare branches.
- Reduce duplicate condition trees while preserving permissions and mode parity.
- Keep public contracts stable unless explicitly approved.

## Progress update
- Candidate 1 started and implemented: canonical shared relation helpers introduced in `src/utils/permissionUtils.js`.
- Duplicated `isSharedForCurrentUser` predicates replaced in `src/pages/Home/Home.jsx` and `src/pages/Home/components/HomeContent.jsx`.
- Diagnostics passed for all touched files.
- Candidate 2 implemented: source+shortcut merge/dedup extraction to `src/utils/homeMergeUtils.js`.
- Tree merge call sites in `Home.jsx` and `HomeContent.jsx` now use shared utility.
- Reviewing checklist created with explicit regression tests in `reviewing/verification-checklist-2026-02-28-phase-02-candidates-1-2.md`.

## Risks
- Subtle behavior drift in edge-case permissions.
- Touching too many files in a single iteration.
