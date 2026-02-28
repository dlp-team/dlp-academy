# Phase 02 — Shared Home Abstractions (COMPLETED)

## Objective
Extract and unify repeated Home behaviors into shared utilities/hooks with lossless semantics.

## Planned changes
- Introduce narrowly scoped shared helpers for repeated merge/share/unshare branches.
- Reduce duplicate condition trees while preserving permissions and mode parity.
- Keep public contracts stable unless explicitly approved.

## Risks
- Subtle behavior drift in edge-case permissions.
- Touching too many files in a single iteration.

## Progress update
- Candidate 1 implemented with minimal scope: centralized `isSharedForCurrentUser` logic in `src/utils/permissionUtils.js` and replaced duplicated call sites in Home surfaces.
- Candidate 2 implemented with minimal scope: centralized source+shortcut merge/dedup pattern in `src/utils/mergeUtils.js` and replaced repeated merge blocks in Home tree collections.
- Candidate 2 extension implemented: centralized owner/shared relation predicates for `useHomeState` shared collections and related filters.
- Touched files are limited to:
	- `src/utils/permissionUtils.js`
	- `src/utils/mergeUtils.js`
	- `src/pages/Home/Home.jsx`
	- `src/pages/Home/components/HomeContent.jsx`
	- `src/pages/Home/hooks/useHomeState.js`

## Completion notes
- Phase 02 completed with lossless abstractions only.
- No features were added or removed.
- Public contracts and user-facing behavior branches were preserved.
