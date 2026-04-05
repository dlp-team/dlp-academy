<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.md -->
# useInstitutionSettings.ts

## Overview
- Source file: `src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.ts`
- Last documented: 2026-04-05
- Role: Hook for loading and saving institution academic settings, institution-level automation toggles, and relocated teacher-governance policy flags.

## Responsibilities
- Loads current institution settings from Firestore document `institutions/{institutionId}`.
- Normalizes defaults for calendar and policy fields.
- Persists new fields:
  - `academicCalendar.startDate`
  - `academicCalendar.ordinaryEndDate`
  - `academicCalendar.extraordinaryEndDate`
  - `academicCalendar.periodization.mode`
  - `academicCalendar.periodization.customLabel`
  - `courseLifecycle.postCoursePolicy`
- Persists institution automation settings:
  - `automationSettings.transferPromotionEnabled`
  - `automationSettings.subjectLifecycleAutomationEnabled`
- Persists teacher governance policy flags inside `accessPolicies.teachers`.
- Provides save-state and validation state for UI consumption.
- Exposes normalized `automationSettings` to downstream tabs so organization tooling can apply institution-level gating.

## Exports
- `useInstitutionSettings`

## Main Dependencies
- `react`
- `firebase/firestore`
- `../../../firebase/config`
- `../../../utils/institutionPolicyUtils`

## Changelog
- 2026-04-05: Added institution course-hierarchy order loading/merging/persistence (`courseLifecycle.coursePromotionOrder`) using non-duplicated active course names and deterministic default ordering heuristics.
- 2026-04-05: Added normalized automation settings read/write flow with backward-compatible defaults (`true` when missing) and exposed `automationSettings` in hook return payload.
- 2026-04-03: Added initial hook implementation for the new Institution Admin configuration tab.
