<!-- copilot/explanations/codebase/src/utils/subjectPeriodLifecycleUtils.md -->
# subjectPeriodLifecycleUtils.ts

## Changelog
### 2026-04-03
- Added `buildSubjectPeriodTimeline(...)` to derive subject timeline bounds from:
  - subject academic year,
  - selected period type/index,
  - institution calendar settings (`startDate`, `ordinaryEndDate`, `extraordinaryEndDate`).
- Added `isSubjectActiveInPeriodLifecycle(...)` for role-aware visibility decisions across ordinary/extraordinary windows.
- Added `shouldStudentRemainActiveDuringExtraordinaryWindow(...)` with explicit unknown pass-state handling policy (`treat_as_pending_until_extraordinary_end`).
- Added `isSubjectVisibleByPostCoursePolicy(...)` for post-extraordinary policy decisions (`delete`, `retain_all_no_join`, `retain_teacher_only`).
- Added `normalizePeriodBoundaryDate(...)` helper for safe date-only normalization.

## Overview
- **Source file:** `src/utils/subjectPeriodLifecycleUtils.ts`
- **Role:** Timeline derivation and lifecycle visibility utilities for Phase 04 subject period automation.

## Main Dependencies
- `./permissionUtils`
- `./academicYearLifecycleUtils`
