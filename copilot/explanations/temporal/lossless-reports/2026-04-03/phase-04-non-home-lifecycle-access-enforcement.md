<!-- copilot/explanations/temporal/lossless-reports/2026-04-03/phase-04-non-home-lifecycle-access-enforcement.md -->
# Lossless Report - Phase 04 Non-Home Lifecycle Access Enforcement

## Requested Scope
- Continue active Phase 04 work by extending lifecycle policy enforcement beyond Home views to direct subject-resource routes.

## Preserved Behaviors
- Institution isolation (`institutionId`) checks remain unchanged and are still evaluated first.
- Admin/institution-admin role pathways remain intact except when lifecycle policy marks the subject as non-visible.
- Owner/shared/class enrollment decision logic remains unchanged for lifecycle-visible subjects.
- Subject creation normalization behavior remains unchanged.

## Implemented Changes
- `src/utils/subjectAccessUtils.ts`
  - Imported `isSubjectVisibleByPostCoursePolicy` from lifecycle utilities.
  - Added a lifecycle visibility gate in `canUserAccessSubject(...)` before role/class allow branches.
  - Result: Subject, Topic, Quiz, and QuizReview direct access flows now consistently enforce post-course visibility.
- `tests/unit/utils/subjectAccessUtils.test.js`
  - Added deterministic tests for lifecycle access denials:
    - hidden lifecycle snapshot,
    - teacher-only lifecycle snapshot for students,
    - elapsed `postCoursePolicy=delete` cutoff.

## Validation Evidence
- `get_errors`:
  - `src/utils/subjectAccessUtils.ts` -> no errors.
  - `tests/unit/utils/subjectAccessUtils.test.js` -> no errors.
- Targeted tests:
  - Command: `npm run test:unit -- tests/unit/utils/subjectAccessUtils.test.js`
  - Result: PASS (`1` file, `14` tests).

## Documentation Sync
- Updated:
  - `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-04-subject-periods-and-lifecycle-automation-planned.md`
  - `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md`
  - `copilot/explanations/codebase/src/utils/subjectAccessUtils.md`
  - `copilot/explanations/codebase/tests/unit/utils/subjectAccessUtils.test.md`

## Lossless Conclusion
This change is surgical and additive. It closes a Phase 04 consistency gap by ensuring lifecycle visibility policies are enforced uniformly across non-Home direct routes while preserving existing tenancy, ownership, and class membership semantics.
