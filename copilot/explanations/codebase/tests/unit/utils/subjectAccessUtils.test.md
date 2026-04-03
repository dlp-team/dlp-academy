<!-- copilot/explanations/codebase/tests/unit/utils/subjectAccessUtils.test.md -->
# subjectAccessUtils.test.js

## Changelog
### 2026-04-03
- Extended normalization coverage for optional subject metadata fields in `normalizeSubjectAccessPayload(...)`:
  - verifies `courseId` and `academicYear` are trimmed when present,
  - verifies `periodType` / `periodLabel` normalization and `periodIndex` integer coercion,
  - verifies empty values are stored as `null`.
- Preserved existing access-control behavior coverage for owner/shared/class/institution paths.

## Overview
- **Source file:** `tests/unit/utils/subjectAccessUtils.test.js`
- **Role:** Unit coverage for subject access normalization and runtime access decisions.
