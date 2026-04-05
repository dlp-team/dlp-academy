<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/phase-03-settings-and-automation-kickoff.md -->
# Phase 03 Working Note - Settings and Automation Kickoff

## Status
- IN_PROGRESS

## Block Tracking
- Block A (2026-04-05): COMPLETED
- Block B: PLANNED
- Block C: PLANNED

## Block A Scope
- Institution-level automation toggles in settings hook + UI.
- Organization transfer tool gating from institution toggle state.
- Callable deny-path enforcement for transfer dry-run/apply when disabled.

## Block A Validation Evidence
- `npm run test -- tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx tests/unit/functions/transfer-promotion-dry-run-handler.test.js tests/unit/functions/transfer-promotion-apply-handler.test.js tests/unit/functions/transfer-promotion-roundtrip.test.js` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Upcoming Block B Scope
- Propagate institution period defaults deeper into course create/edit flows.
- Preserve backward compatibility for institutions missing periodized settings data.
- Add deterministic tests for default propagation and save/read consistency.

## Upcoming Block C Scope
- Add deterministic course-order normalization and persistence flow.
- Validate Spanish naming heuristics for default ordering where explicit order is absent.
- Add edge coverage for duplicate labels and unknown course naming patterns.
