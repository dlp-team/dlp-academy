<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/course-period-overrides-subplan.md -->
# Course Period Overrides Subplan

## Objective
Support course-specific start/end schedules for every configured academic period (trimester/cuatrimester/custom) while preserving institution-level calendar windows as default fallback.

## User Requirement Source
- Added via `user-updates.md` on 2026-04-04.

## Constraints
- Institution-level ordinary/extraordinary windows remain canonical defaults.
- Course-level period schedules must be optional overrides, not mandatory for every course.
- Lifecycle and visibility automation must remain deterministic when overrides are partially configured.
- Existing subjects/courses without overrides must continue to work unchanged.

## Data Model Impact (Planned)
- Extend course documents with optional period timeline payload keyed by period index/type.
- Preserve existing institution settings schema as fallback baseline.
- Define precedence: `course override -> institution default -> safe fallback`.

## Validation Strategy
- Unit tests for timeline resolution precedence and partial override scenarios.
- UI tests for course editor setup and period selector propagation.
- Regression tests for Home/Content lifecycle visibility behavior when overrides exist vs absent.

## Progress Update (2026-04-04)
- Completed foundational timeline support in `buildSubjectPeriodTimeline(...)` with optional `coursePeriodSchedule` input.
- Added deterministic unit coverage for:
	- override precedence,
	- fallback to institution defaults when course period data is incomplete.

## Rollback Notes
- Keep additive schema changes only.
- Gate lifecycle consumers behind fallback-first resolver utilities.
- Revert UI wiring without data loss by ignoring override field reads if rollback required.
