# academicYearLifecycleUtils.ts

## Changelog
### 2026-04-02: Lifecycle helpers for Home ended-subject UX
- Added canonical helpers for academic-year lifecycle behavior:
  - `getCurrentAcademicYear` using Jul-Dec / Jan-Jun boundary rules,
  - `isSubjectCurrentAcademicYear` / `isSubjectEndedAcademicYear` for visibility decisions.
- Added robust score/pass extraction helpers (`getSubjectScorePercent`, `getSubjectPassedState`) that tolerate multiple subject field shapes.
- Added `getEndedSubjectBadge` role-aware badge mapping:
  - teacher/institution-admin: yellow ended badge,
  - student: red-to-green badge scale from score/pass context.

## Overview
- **Source file:** `src/utils/academicYearLifecycleUtils.ts`
- **Last documented:** 2026-04-02
- **Role:** Shared utility module for Home lifecycle visibility and ended-state visual semantics.

## Exports
- `getAcademicYearStartYear`
- `normalizeAcademicYear`
- `getCurrentAcademicYear`
- `isSubjectCurrentAcademicYear`
- `isSubjectEndedAcademicYear`
- `getSubjectScorePercent`
- `getSubjectPassedState`
- `getEndedSubjectBadge`
