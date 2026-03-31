<!-- copilot/explanations/codebase/tests/unit/pages/viewResource/ViewResource.errorHandling.test.md -->
# ViewResource.errorHandling.test.jsx

## Overview
- **Source file:** `tests/unit/pages/viewResource/ViewResource.errorHandling.test.jsx`
- **Last documented:** 2026-03-31
- **Role:** Unit coverage for ViewResource iframe preview loading/error fallback behavior.

## Coverage
- Loading feedback is visible while iframe preview is unresolved.
- Timeout-backed failure path surfaces explicit preview error feedback.
- Retry action returns the viewer to loading state after an error.

## Changelog
### 2026-03-31
- Added regression tests for Slice 30 ViewResource iframe fallback hardening.
