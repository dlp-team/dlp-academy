<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/classes-courses/academicYearUtils.md -->
# academicYearUtils.ts

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/classes-courses/academicYearUtils.ts`
- **Last documented:** 2026-04-02
- **Role:** Shared academic-year normalization/validation defaults for institution admin classes/courses flows.

## Responsibilities
- Validates strict `YYYY-YYYY` format with consecutive years only.
- Normalizes values before persistence to Firestore.
- Computes default year using requested cutoff logic:
  - Jul-Dec => `currentYear-currentYear+1`
  - Jan-Jun => `previousYear-currentYear`
- Builds selectable year range (`-20` to `+10`) for picker UIs.

## Exports
- `getAcademicYearStartYear(value)`
- `isValidAcademicYear(value)`
- `normalizeAcademicYear(value)`
- `getDefaultAcademicYear(referenceDate?)`
- `buildAcademicYearRange({ referenceDate?, minOffset?, maxOffset? })`

## Changelog
- 2026-04-02: Added deterministic academic-year helpers for Phase 05 governance baseline.
