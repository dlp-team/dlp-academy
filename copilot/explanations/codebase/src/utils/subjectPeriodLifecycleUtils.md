<!-- copilot/explanations/codebase/src/utils/subjectPeriodLifecycleUtils.md -->
# subjectPeriodLifecycleUtils.ts

## Changelog
### 2026-04-04
- Extended `buildSubjectPeriodTimeline(...)` with optional `coursePeriodSchedule` support.
- Added precedence model for timeline resolution:
  - course-level period boundaries (when valid and matching period type),
  - institution calendar defaults fallback.
- Added guardrails for invalid course schedule windows and extraordinary boundary normalization.

### 2026-04-03
- Added `buildSubjectPeriodTimeline(...)` to derive subject timeline bounds from:
  - subject academic year,
  - selected period type/index,
  - institution calendar settings (`startDate`, `ordinaryEndDate`, `extraordinaryEndDate`).
- Added `isSubjectActiveInPeriodLifecycle(...)` for role-aware visibility decisions across ordinary/extraordinary windows.
- Added `shouldStudentRemainActiveDuringExtraordinaryWindow(...)` with explicit unknown pass-state handling policy (`treat_as_pending_until_extraordinary_end`).
- Added `isSubjectVisibleByPostCoursePolicy(...)` for post-extraordinary policy decisions (`delete`, `retain_all_no_join`, `retain_teacher_only`).
- Added `normalizePeriodBoundaryDate(...)` helper for safe date-only normalization.
- `isSubjectActiveInPeriodLifecycle(...)` now consumes backend lifecycle snapshots (`lifecyclePhase`) when available, with date-window fallback preserved.
- `isSubjectVisibleByPostCoursePolicy(...)` now consumes backend lifecycle visibility snapshots (`lifecyclePostCourseVisibility`) when available, with policy/date fallback preserved.

## Overview
- **Source file:** `src/utils/subjectPeriodLifecycleUtils.ts`
- **Role:** Timeline derivation and lifecycle visibility utilities for Phase 04 subject period automation.

## Main Dependencies
- `./permissionUtils`
- `./academicYearLifecycleUtils`
