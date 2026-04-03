<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-04-subject-periods-and-lifecycle-automation-planned.md -->
# Phase 04 - Subject Periods and Lifecycle Automation (PLANNED)

## Objective
Model and enforce subject period windows and automatic lifecycle transitions with role-aware visibility.

## Planned Changes
- Require period metadata on subject creation.
- Add home filter by trimester/cuatrimester/custom period.
- Implement lifecycle transition logic:
  - period-end behavior
  - ordinary vs extraordinary handling
  - role-sensitive visibility for teachers and students

## Risks and Controls
- Risk: incorrect hiding of active content.
  - Control: role and pass-status decision matrix tests.

## Exit Criteria
- Lifecycle transitions align with configured institutional calendar and policy.
