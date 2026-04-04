<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-04-subject-periods-and-lifecycle-automation-planned.md -->
# Phase 04 - Subject Periods and Lifecycle Automation (IN_REVIEW)

## Objective
Model and enforce subject period windows and automatic lifecycle transitions with role-aware visibility.

## Planned Changes
- Require period metadata on subject creation.
- Add home filter by trimester/cuatrimester/custom period.
- Implement lifecycle transition logic:
  - period-end behavior
  - ordinary vs extraordinary handling
  - role-sensitive visibility for teachers and students
- Prepare scheduled/triggered lifecycle automation path beyond Home runtime filtering.

## Progress Notes
- Added institution-driven period option modeling in `SubjectFormModal` based on `academicCalendar.periodization`.
- Added general-tab period selector with mandatory validation on subject creation.
- Subject save payloads now persist period metadata fields:
  - `periodType`
  - `periodLabel`
  - `periodIndex`
- Added normalization for the new fields in:
  - `src/hooks/useHomeHandlers.ts`
  - `src/hooks/useSubjects.ts`
  - `src/utils/subjectAccessUtils.ts`
- Added unit coverage updates in `tests/unit/utils/subjectAccessUtils.test.js`.
- Added Home controls period selector (`Periodo`) for `courses` and `usage` modes with persisted preference key `subjectPeriodFilter`.
- Added Home state derivation for `availableSubjectPeriods` and period-filter application across grouped content and search results in `courses`/`usage` modes.
- Added deterministic unit coverage updates in:
  - `tests/unit/hooks/useHomeState.academicYearFilter.test.js`
  - `tests/unit/pages/home/HomeControls.activeCurrentToggle.test.jsx`
- Added timeline-bound metadata generation on subject save using institution calendar inputs:
  - `periodStartAt`
  - `periodEndAt`
  - `periodExtraordinaryEndAt`
- Added lifecycle utility modeling in `src/utils/subjectPeriodLifecycleUtils.ts` for:
  - timeline generation,
  - role-aware extraordinary-window visibility decisions.
- Lifecycle utility now also consumes backend automation snapshot fields when present:
  - `lifecyclePhase`,
  - `lifecyclePostCourseVisibility`,
  while preserving date/policy fallback behavior.
- Subject save payloads now persist `postCoursePolicy` snapshots from institution settings for lifecycle visibility decisions.
- Home `showOnlyCurrentSubjects` filtering now uses period lifecycle windows when available, with academic-year fallback for legacy subjects.
- Home `usage`/`courses` grouping now applies post-extraordinary visibility filtering by `postCoursePolicy`:
  - `delete` => hidden,
  - `retain_teacher_only` => teacher/staff visible, students hidden,
  - `retain_all_no_join` => visible.
- Home lifecycle policy filtering is now shared and reused for auxiliary usage/courses outputs:
  - grouped search results,
  - `searchSubjects`,
  - `filteredSubjects` hook output used by control/tag flows.
- Added deterministic lifecycle matrix coverage in:
  - `tests/unit/utils/subjectPeriodLifecycleUtils.test.js`
  - `tests/unit/hooks/useHomeState.academicYearFilter.test.js`
  - `tests/unit/utils/subjectAccessUtils.test.js`
- Explicitly codified unknown pass-state handling during extraordinary window in `subjectPeriodLifecycleUtils` (`treat_as_pending_until_extraordinary_end`).
- Added lifecycle automation engine in `functions/security/subjectLifecycleAutomation.js` with deterministic phase/policy derivation and minimal-update output generation.
- Added callable trigger `runSubjectLifecycleAutomation` in `functions/index.js`:
  - global admin supports global or institution-scoped execution,
  - institution admin is restricted to own institution,
  - supports dry-run preview mode with bounded affected-subject ID preview.
- Added scheduled trigger `reconcileSubjectLifecycleAutomation` (`every day 02:15`, `Europe/Madrid`) to apply lifecycle transitions without Home interaction.
- Added deterministic backend automation test coverage in `tests/unit/functions/subjectLifecycleAutomation.test.js`, including dry-run summary/preview behavior.
- Added emulator validation harness `scripts/lifecycle-dry-run-emulator-check.mjs` and executed callable dry-run evidence flow with institution-scoped fixtures:
  - `scannedSubjects: 2`
  - `updatedSubjects: 1`
  - `skippedSubjects: 1`
  - `committedUpdates: 0`
  - `previewSubjectIds: ['dryrun-subject-update']`
- Extended non-Home lifecycle enforcement by applying `isSubjectVisibleByPostCoursePolicy` inside `canUserAccessSubject(...)`:
  - Subject page direct access (`src/pages/Subject/hooks/useSubjectManager.ts` consumer path),
  - Topic page direct access (`src/pages/Topic/hooks/useTopicLogic.ts` consumer path),
  - Quiz player direct access (`src/pages/Quizzes/Quizzes.tsx` consumer path),
  - Quiz review direct access (`src/pages/Quizzes/QuizReviewPage.tsx` consumer path).
- Added deterministic subject access coverage for lifecycle policy gates in `tests/unit/utils/subjectAccessUtils.test.js`:
  - hidden lifecycle visibility,
  - teacher-only lifecycle visibility,
  - elapsed `postCoursePolicy=delete` cutoff.
- Audited additional non-Home direct-entry routes and aligned them with shared lifecycle subject access policy checks:
  - `src/pages/Content/StudyGuide.tsx`,
  - `src/pages/Content/Exam.jsx`,
  - `src/pages/Content/Formula.tsx`,
  - `src/pages/Content/StudyGuideEditor.tsx`,
  - `src/pages/Quizzes/QuizEdit.tsx`.
- Validated impacted route regressions with deterministic focused coverage:
  - `tests/unit/pages/content/StudyGuide.navigation.test.jsx`,
  - `tests/unit/pages/content/StudyGuide.fallback.test.jsx`,
  - `tests/unit/pages/content/Exam.test.jsx`,
  - `tests/unit/pages/quizzes/QuizEdit.test.jsx`,
  - plus `tests/unit/utils/subjectAccessUtils.test.js`.
- Applied a follow-up TypeScript compatibility fix in `src/pages/Content/StudyGuideEditor.tsx` by explicitly typing subject metadata hydration after lifecycle guard insertion; no runtime behavior change.
- Added roadmap extension (2026-04-04): lifecycle timeline modeling must support per-course period start/end overrides for each configured period while retaining institution defaults as fallback.
- Implemented timeline groundwork in `src/utils/subjectPeriodLifecycleUtils.ts`:
  - `buildSubjectPeriodTimeline(...)` now accepts optional `coursePeriodSchedule`.
  - Timeline precedence now supports course-level period boundaries with institution fallback when override data is missing/invalid.
- Added deterministic coverage for override and fallback paths in `tests/unit/utils/subjectPeriodLifecycleUtils.test.js`.

## InReview Notes (2026-04-04)
- Phase 04 implementation scope is complete and now remains under inReview closure checks only.
- Validation evidence covering lifecycle automation and related route guards is consolidated in global closure gates:
  - `npm run lint` -> PASS
  - `npx tsc --noEmit` -> PASS
  - `npm run test` -> PASS (134 files, 606 tests)
- InReview review artifacts created:
  - `reviewing/subphase-1-optimization-consolidation-2026-04-04.md`
  - `reviewing/subphase-2-deep-risk-analysis-2026-04-04.md`

## Remaining in Phase 04
- Complete final plan-level `inReview` closure transition after synchronized verification of all finished/in-review phases.

## Risks and Controls
- Risk: incorrect hiding of active content.
  - Control: role and pass-status decision matrix tests.

## Exit Criteria
- Lifecycle transitions align with configured institutional calendar and policy.
