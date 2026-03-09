// copilot/explanations/codebase/tests/unit/components/SudoModal.test.md

## Changelog
### 2026-03-09: New security-confirmation modal unit coverage
- Added `SudoModal` unit tests for:
  - wrong-password validation feedback with `onConfirm` blocked,
  - successful reauthentication flow calling `onConfirm` and closing modal.

## Overview
This suite validates security reauthentication behavior before privileged actions.

## Notes
- Firebase auth reauthentication calls are mocked to isolate UI/behavior assertions.
- Validates text-based feedback for failed credentials without browser alerts.
