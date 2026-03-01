# Phase 03 — Danger Zone Unit Hardening (PLANNED)

## Objective

Add focused unit protections for complex drag/state logic and strict permission boundaries.

## Planned Changes / Actions

- Add/expand Vitest coverage for:
  - `src/pages/Home/hooks/useHomeContentDnd.js`
  - `src/pages/Home/hooks/useHomeLogic.js`
- Validate folder/subject drag-drop state updates and Firestore payload correctness.
- Expand `src/utils/permissionUtils.js` tests to enforce no edit-state entry for viewer roles.

## Risks

- Complex hook dependencies make deterministic tests harder without robust mocks.
- Over-mocking may hide integration defects if assertions are too shallow.

## Completion Criteria

- New tests cover key drag-drop state transitions and persistence payload behavior.
- Permission test matrix includes explicit viewer denial scenarios.
- Added tests are stable in repeated local runs.
