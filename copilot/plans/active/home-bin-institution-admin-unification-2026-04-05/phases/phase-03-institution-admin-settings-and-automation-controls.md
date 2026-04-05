<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/phases/phase-03-institution-admin-settings-and-automation-controls.md -->
# Phase 03 - Institution Admin Settings and Automation Controls

## Status
- PLANNED

## Objective
Expand Institution Admin settings to manage academic periods, course-order progression, and automation feature toggles.

## Deliverables
- Settings controls for ordinary/extraordinary period start/end defaults.
- Course hierarchy management section:
  - non-duplicated institution course list,
  - drag-and-drop reorder flow,
  - persisted order used by automatic transfer logic,
  - default ordering heuristics aligned to Spanish academic naming patterns.
- Global automation-tool enable/disable toggles at institution scope.
- Course-creation flow integration so period defaults auto-populate.

## Security and Data Integrity Constraints
- Tenant-safe writes scoped to institution context.
- Least-privilege checks for settings mutation.
- Backward-compatible defaults for institutions missing new fields.
- Avoid destructive rewrites of existing settings payloads.

## Validation Gate
- Deterministic tests for settings read/write paths and default propagation.
- Edge-case checks for duplicate/unknown course labels.
- Manual verification of drag ordering persistence and retrieval.
- Lint/typecheck pass.

## Exit Criteria
- Institution admins can safely configure periods, ordering, and tool toggles with stable persisted behavior.
