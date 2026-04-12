<!-- copilot/explanations/codebase/src/pages/Content/Exam.md -->
# Exam.tsx

## Overview
- **Source file:** `src/pages/Content/Exam.tsx`
- **Last documented:** 2026-04-04
- **Role:** Exam rendering surface with timed navigation and answer reveal UX.

## Responsibilities
- Loads subject context and exam payload by route params.
- Handles timed exam navigation and reveal interactions.
- Renders completion and fallback states for missing/unavailable exam flows.
- Supports temporary student-preview mode UI behavior.

## Reliability Notes
### 2026-03-31 - Explicit Exam Load Fallback Determinism (Phase 05 Slice 28)
- Added explicit state handling for:
  - exam document not found (`examNotFound`),
  - exam load failures (`examLoadError`),
  - non-blocking subject context fetch failures (`subjectLoadWarning`).
- Introduced shared fallback renderer (`ExamFallbackState`) used by:
  - exam-not-found state,
  - exam-error state,
  - no-question state.
- Subject fetch failures are no longer silent; warning feedback is visible while preserving exam usability when exam payload loads successfully.

## Changelog
- 2026-04-04: Removed duplicate `src/pages/Content/Exam.jsx` and kept `Exam.tsx` as the single source of truth; added deterministic test coverage for lifecycle access-denied redirect to Home.
- 2026-04-03: Added lifecycle-aware subject access gate via `canUserAccessSubject(...)` before exam payload rendering; denied lifecycle visibility now redirects direct exam entry to Home.
- 2026-03-31: Added explicit not-found/error/warning fallback states for exam and subject-context loading paths, replacing silent failure behavior.
- 2026-04-01: Resolved callback declaration-order crash in keyboard navigation effect by replacing TDZ-prone callback constants with function declarations (`toggleAnswer`, `navigateQuestion`), restoring stable unit execution.
