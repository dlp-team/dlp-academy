<!-- copilot/explanations/codebase/src/utils/subjectAccessUtils.md -->
# subjectAccessUtils.ts

## Changelog
### 2026-04-03
- `normalizeSubjectAccessPayload(...)` now normalizes optional subject linkage metadata:
  - `courseId` (trimmed string or `null`)
  - `academicYear` (trimmed string or `null`)
- `normalizeSubjectAccessPayload(...)` now normalizes optional period metadata:
  - `periodType` (trimmed string or `null`)
  - `periodLabel` (trimmed string or `null`)
  - `periodIndex` (positive integer or `null`)
- `normalizeSubjectAccessPayload(...)` now normalizes optional lifecycle boundary fields:
  - `periodStartAt` (ISO date `YYYY-MM-DD` or `null`)
  - `periodEndAt` (ISO date `YYYY-MM-DD` or `null`)
  - `periodExtraordinaryEndAt` (ISO date `YYYY-MM-DD` or `null`)
- Keeps existing required-course guard and class/enrollment normalization behavior unchanged.

## Overview
- **Source file:** `src/utils/subjectAccessUtils.ts`
- **Role:** Normalization and access utilities for subject creation/join/access checks.

## Main Dependencies
- `firebase/firestore`
- `../firebase/config`
