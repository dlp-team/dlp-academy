<!-- copilot/explanations/codebase/tests/unit/pages/content/Exam.test.md -->
# Exam.test.jsx

## Overview
- **Source file:** `tests/unit/pages/content/Exam.test.jsx`
- **Last documented:** 2026-04-04
- **Role:** Unit coverage for exam load fallback determinism and user-visible feedback states.

## Coverage
- Missing exam document renders explicit `Examen no encontrado` fallback.
- Permission-denied exam fetch renders explicit access error feedback.
- Subject-context fetch failure renders non-blocking warning feedback while exam content remains available.
- Subject lifecycle access denial triggers redirect to `/home` for authenticated student access attempts.

## Changelog
### 2026-04-04
- Added mocked `canUserAccessSubject(...)` coverage to verify denied lifecycle visibility redirects exam routes to Home.

### 2026-03-31
- Added regression suite for exam load fallback states introduced in Phase 05 Slice 28.
