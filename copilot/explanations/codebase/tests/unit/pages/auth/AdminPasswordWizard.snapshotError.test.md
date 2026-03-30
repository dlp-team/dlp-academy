<!-- copilot/explanations/codebase/tests/unit/pages/auth/AdminPasswordWizard.snapshotError.test.md -->
# AdminPasswordWizard.snapshotError.test.jsx

## Overview
- **Source file:** `tests/unit/pages/auth/AdminPasswordWizard.snapshotError.test.jsx`
- **Last documented:** 2026-03-30
- **Role:** Focused regression coverage for AdminPasswordWizard user-listener success/failure behavior.

## Coverage
- Renders wizard when user is institution admin and current auth provider is Google-only.
- Confirms listener-error fallback keeps wizard hidden.
- Verifies listener-error logging path.

## Changelog
### 2026-03-30
- Added initial regression tests for AdminPasswordWizard realtime snapshot reliability and fallback behavior.
