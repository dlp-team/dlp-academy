<!-- copilot/plans/active/audit-remediation-and-completion/phases/phase-05-home-modularization.md -->

# Phase 05: Home Modularization

**Duration:** 6-8 hours | **Priority:** 🔴 CRITICAL | **Status:** 🔄 IN PROGRESS

## Objective
Reduce `Home.tsx` complexity by extracting cohesive logic blocks into dedicated hooks/components while preserving current behavior.

## Slice Completed (2026-04-01)

### Extracted routing and folder sync effects
- New file: `src/pages/Home/hooks/useHomeFolderRoutingSync.ts`
- Moved three effect blocks from `Home.tsx` into the new hook:
  - Initial data-loaded synchronization.
  - Student-mode folder/query cleanup behavior.
  - URL `folderId` <-> `currentFolder` synchronization.

### Home integration
- Added import and invocation of `useHomeFolderRoutingSync` in `Home.tsx`.
- Removed duplicated inline effect blocks from `Home.tsx`.

### Extracted tree data derivation
- New file: `src/pages/Home/hooks/useHomeTreeData.ts`
- Moved `treeFolders` and `treeSubjects` memoized derivation blocks out of `Home.tsx`.
- Replaced inline memo logic with `useHomeTreeData(logic)` in `Home.tsx`.

### Extracted bulk selection orchestration
- New file: `src/pages/Home/hooks/useHomeBulkSelection.ts`
- Moved bulk selection and action orchestration out of `Home.tsx`:
  - selected-item map and selection key derivation.
  - bulk move and bulk delete flows with per-item settled handling.
  - create-folder-from-selection flow and selection reset behavior.
  - auto-clear selection when switching to shared/bin or student mode.
- `Home.tsx` now consumes the hook and keeps only feedback rendering and top-level orchestration.

### Extracted loading shell component
- New file: `src/pages/Home/components/HomeLoader.tsx`
- Moved both loading UIs out of `Home.tsx`:
  - full-page loading shell for app bootstrap/loading gates.
  - inline content loader used while page data hydrates.
- `Home.tsx` now delegates loading presentation to `HomeLoader` and remains coordinator-focused.

### Extracted control-tag derivation and synchronization
- New file: `src/pages/Home/hooks/useHomeControlTags.ts`
- Moved control-tag derivation and pruning synchronization out of `Home.tsx`:
  - shared/manual source selection for tag aggregation.
  - role-scoped folder filtering for student mode.
  - shared/manual selected-tag pruning against available tag set.
- `Home.tsx` now consumes `useHomeControlTags(...)` and only receives `availableControlTags`.

### Added modularization regression tests
- New file: `tests/unit/hooks/useHomeBulkSelection.test.js`
- New file: `tests/unit/hooks/useHomeControlTags.test.js`
- New file: `tests/unit/pages/home/HomeLoader.test.jsx`
- Coverage added for:
  - selection reset invariants when role/view context changes.
  - control-tag aggregation and pruning in shared/manual modes.
  - loader rendering contracts for full-page and inline modes.

### Extracted keyboard feedback coordination
- New file: `src/pages/Home/hooks/useHomeKeyboardCoordination.ts`
- New file: `src/pages/Home/components/HomeShortcutFeedback.tsx`
- New file: `tests/unit/pages/home/HomeShortcutFeedback.test.jsx`
- `Home.tsx` now consumes `useHomeKeyboardCoordination(...)` and delegates feedback banner rendering to `HomeShortcutFeedback`.

### Extracted Home main content router
- New file: `src/pages/Home/components/HomeMainContent.tsx`
- New file: `tests/unit/pages/home/HomeMainContent.test.jsx`
- Moved the large `bin/shared/manual` conditional content branch from `Home.tsx` into `HomeMainContent`.
- Preserved behavior for:
  - shared-folder/shared-subject action menus and shortcut-aware delete/unshare flows.
  - manual view content/loading/empty-state branching.
  - forwarded drag/drop and selection wiring to `HomeContent`.

## Validation
- `get_errors`: clean in touched files.
- `npm run lint`: 0 errors, 4 pre-existing warnings in unrelated files.
- `npm run test -- Home`: 14/14 files passing, 108/108 tests passing.

## Next Slices
- Extract keyboard coordination state from `Home.tsx`.
- Normalize remaining `any` casts in page-level wiring.

## Success Criteria
- [x] One high-cohesion effect block extracted to standalone hook.
- [x] No behavior regressions.
- [x] Lint/test baseline preserved.
- [ ] Continue reducing `Home.tsx` toward manageable size in additional slices.
