<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/course-lifecycle-automation-subplan.md -->
# Course Lifecycle Automation Subplan

## Objective
Consolidate Phase 04 lifecycle behavior so subject visibility is consistent across Home and direct resource entry points.

## Constraints
- Preserve multi-tenant isolation via `institutionId` checks.
- Keep least-privilege role behavior (student restrictions must not weaken).
- Avoid broad schema rewrites; consume existing lifecycle snapshot fields when available.
- Keep behavior deterministic and test-covered.

## Data Model Impact
- No new fields required in this slice.
- Consumes existing fields:
  - `lifecyclePhase`
  - `lifecyclePostCourseVisibility`
  - `postCoursePolicy`
  - `periodEndAt`
  - `periodExtraordinaryEndAt`

## Validation Strategy
- Run `get_errors` on touched files.
- Run targeted unit coverage:
  - `npm run test:unit -- tests/unit/utils/subjectAccessUtils.test.js`
- Keep full-suite gates (`npm run lint`, `npx tsc --noEmit`, `npm run test`) for phase transition to `inReview`.

## Rollback Notes
- Revert only the lifecycle gate insertion in `canUserAccessSubject(...)` if regression is detected.
- Preserve tests and docs to keep regression evidence, then reintroduce gate behind corrected predicate logic.

## Status
- IN_PROGRESS (Phase 04)

## Progress Notes
- 2026-04-03: Added lifecycle visibility enforcement in shared subject access gate and corresponding deterministic unit tests.
- 2026-04-03: Extended lifecycle enforcement to additional direct content/editor routes (`StudyGuide`, `Exam`, `Formula`, `StudyGuideEditor`, `QuizEdit`) and validated impacted unit coverage.
