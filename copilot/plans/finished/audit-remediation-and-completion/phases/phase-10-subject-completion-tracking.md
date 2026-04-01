<!-- copilot/plans/finished/audit-remediation-and-completion/phases/phase-10-subject-completion-tracking.md -->

# Phase 10: Subject Completion Tracking

**Duration:** 6-8 hours | **Priority:** 🟡 HIGH | **Status:** ✅ COMPLETED

## Objective
Implement subject completion tracking so users can mark subjects as completed, hide completed entries from active Home views, and review them in a dedicated history view.

## Slice Completed (2026-04-01)

### Data-layer completion state
- Updated `src/hooks/useSubjects.ts`:
  - added `completedSubjectIds` derivation from `user.completedSubjects`,
  - added `setSubjectCompletion(subjectId, completed)` to update the current user profile with `arrayUnion/arrayRemove`.

### Home state filtering and history mode
- Updated `src/hooks/useHomeState.ts`:
  - added completion-aware filtering across grouped Home data,
  - active Home modes now exclude completed subjects,
  - added dedicated `history` mode that only shows completed subjects,
  - preserved shortcut compatibility by resolving completion IDs with `targetId` for shortcut entries.

### Home control and restore wiring
- Updated `src/pages/Home/hooks/useHomeControlsHandlers.ts`:
  - added `HOME_VIEW_MODES` entry for `history` (`Historial`).
- Updated `src/pages/Home/components/HomeControls.tsx`:
  - added tab icon mapping for `history` mode.
- Updated `src/pages/Home/hooks/useHomePageState.tsx`:
  - added `history` to persisted/allowed view-mode restore set.

### Home composition wiring
- Updated `src/pages/Home/hooks/useHomeLogic.ts`:
  - forwards `completedSubjectIds` into `useHomeState`.
- Updated `src/pages/Home/components/HomeMainContent.tsx`:
  - forwards completion state and completion setter into `HomeContent`.
- Updated `src/pages/Home/components/HomeContent.tsx`:
  - computes per-subject completion state,
  - routes completion toggle callback into subject cards and list rows.

### Subject action menu integration
- Updated `src/components/modules/SubjectCard/SubjectCard.tsx` and `src/components/modules/SubjectCard/SubjectCardFront.tsx`:
  - added menu action: `Marcar como completada` / `Marcar como activa`.
- Updated `src/components/modules/ListViewItem.tsx` and `src/components/modules/ListItems/SubjectListItem.tsx`:
  - added equivalent completion toggle action for list layout.

### Tests
- Updated `tests/unit/hooks/useSubjects.test.js`:
  - added completion-tracking coverage for ID normalization and union/remove updates.
- Added `tests/unit/hooks/useHomeState.completionTracking.test.js`:
  - validates active-mode exclusion and history-mode inclusion behavior.

## Validation
- `get_errors` on all touched files: clean.
- Focused tests passed:
  - `npm run test -- tests/unit/hooks/useSubjects.test.js tests/unit/hooks/useHomeState.completionTracking.test.js`
  - `npm run test -- tests/unit/pages/home/HomeMainContent.test.jsx tests/unit/pages/home/HomeControls.sharedScopeToggle.test.jsx`

## Risks and Notes
- Completion toggling is user-scoped and updates only the current user profile document.
- History-mode visibility relies on `user.completedSubjects` refresh; real-time profile listener keeps state current.
- Completion actions are exposed in both grid and list subject menus for parity.
