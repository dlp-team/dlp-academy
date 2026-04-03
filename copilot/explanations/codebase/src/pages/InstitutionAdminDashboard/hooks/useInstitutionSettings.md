<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.md -->
# useInstitutionSettings.ts

## Overview
- Source file: `src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.ts`
- Last documented: 2026-04-03
- Role: Hook for loading and saving institution academic settings and relocated teacher-governance policy flags.

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
- Persists teacher governance policy flags inside `accessPolicies.teachers`.
- Provides save-state and validation state for UI consumption.

## Exports
- `useInstitutionSettings`

## Main Dependencies
- `react`
- `firebase/firestore`
- `../../../firebase/config`
- `../../../utils/institutionPolicyUtils`

## Changelog
- 2026-04-03: Added initial hook implementation for the new Institution Admin configuration tab.
