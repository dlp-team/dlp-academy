<!-- copilot/explanations/temporal/lossless-reports/2026-04-04/phase-04-course-period-timeline-overrides-foundation.md -->
# Lossless Report - Phase 04 Course-Period Timeline Overrides Foundation

## Requested Scope
- Continue active plan implementation after adding new requirement for per-course period timelines.
- Deliver a safe first slice that introduces course-level period boundary support with fallback to institution defaults.

## Preserved Behaviors
- Existing timeline derivation from institution settings remains default behavior.
- Existing lifecycle visibility and post-course policy logic remains unchanged.
- Existing subjects/courses without override data behave exactly as before.

## Implemented Changes
- `src/utils/subjectPeriodLifecycleUtils.ts`
  - Extended `buildSubjectPeriodTimeline(...)` to accept optional `coursePeriodSchedule`.
  - Added normalized resolver for course period boundaries.
  - Added precedence/fallback behavior:
    - valid course period schedule for target period -> use course boundaries,
    - missing/invalid course period schedule -> use institution calendar-derived timeline.
  - Added extraordinary-boundary normalization to ensure it does not precede period end.
- `tests/unit/utils/subjectPeriodLifecycleUtils.test.js`
  - Added deterministic test for course-level override precedence.
  - Added deterministic test for fallback to institution timeline when override period is missing.
- Documentation sync:
  - `copilot/explanations/codebase/src/utils/subjectPeriodLifecycleUtils.md`
  - `copilot/explanations/codebase/tests/unit/utils/subjectPeriodLifecycleUtils.test.md`
  - `copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md`
  - `copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-04-subject-periods-and-lifecycle-automation-planned.md`
  - `copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/course-period-overrides-subplan.md`
  - `copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/user-updates.md`

## Validation Evidence
- `get_errors` clean on touched source/test files.
- Focused tests passed:
  - `npm run test:unit -- tests/unit/utils/subjectPeriodLifecycleUtils.test.js`
  - Result: `1` file passed, `7` tests passed.

## Lossless Conclusion
This block adds an additive, backward-compatible foundation for the new per-course period-window requirement without changing existing behavior for institutions that have not configured course overrides.
