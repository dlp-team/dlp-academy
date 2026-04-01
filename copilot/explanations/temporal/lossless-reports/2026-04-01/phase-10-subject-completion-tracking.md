<!-- copilot/explanations/temporal/lossless-reports/2026-04-01/phase-10-subject-completion-tracking.md -->

# Lossless Report: Phase 10 Subject Completion Tracking

## Requested Scope
Implement phase 10 from the active audit-remediation plan:
- add user-level subject completion tracking,
- expose completion toggles in Home subject actions,
- split Home subject visibility into active vs history behavior,
- add focused tests,
- preserve non-requested behavior.

## Preserved Behaviors
- Existing subject CRUD (create/edit/delete/share) behavior remains unchanged.
- Existing teacher creation policy enforcement from phase 09 remains unchanged.
- Shared and bin view routing behavior remains unchanged.
- Existing Home drag-and-drop, search, and tag filtering behavior remains unchanged outside completion filtering scope.

## Touched Files
- `src/hooks/useSubjects.ts`
- `src/hooks/useHomeState.ts`
- `src/pages/Home/hooks/useHomeLogic.ts`
- `src/pages/Home/hooks/useHomeControlsHandlers.ts`
- `src/pages/Home/hooks/useHomePageState.tsx`
- `src/pages/Home/components/HomeControls.tsx`
- `src/pages/Home/components/HomeMainContent.tsx`
- `src/pages/Home/components/HomeContent.tsx`
- `src/components/modules/SubjectCard/SubjectCard.tsx`
- `src/components/modules/SubjectCard/SubjectCardFront.tsx`
- `src/components/modules/ListViewItem.tsx`
- `src/components/modules/ListItems/SubjectListItem.tsx`
- `tests/unit/hooks/useSubjects.test.js`
- `tests/unit/hooks/useHomeState.completionTracking.test.js`
- `copilot/plans/active/audit-remediation-and-completion/README.md`
- `copilot/plans/active/audit-remediation-and-completion/strategy-roadmap.md`
- `copilot/plans/active/audit-remediation-and-completion/phases/phase-10-subject-completion-tracking.md`

## Per-File Verification Notes
- Added completion IDs derivation and safe profile update helper in `useSubjects`.
- Home state grouping now distinguishes active and completed subjects using a dedicated history mode.
- Home controls expose `Historial` without changing existing mode labels.
- Subject action menus (grid/list) now include completion toggle action in Spanish.
- Home content wiring forwards completion state/action through existing component contracts.
- Added deterministic tests for completion state update semantics and Home completion filtering.

## Validation Summary
- `get_errors` on touched files: no errors.
- Tests passed:
  - `npm run test -- tests/unit/hooks/useSubjects.test.js tests/unit/hooks/useHomeState.completionTracking.test.js`
  - `npm run test -- tests/unit/pages/home/HomeMainContent.test.jsx tests/unit/pages/home/HomeControls.sharedScopeToggle.test.jsx`

## Residual Risks
- Completion toggles depend on user-profile write permissions; if a profile write is blocked by environment/rules drift, UI state may not update.
- History sorting currently relies on `updatedAt` fallback and may not exactly reflect completion timestamp until a dedicated completion timestamp field is introduced.
