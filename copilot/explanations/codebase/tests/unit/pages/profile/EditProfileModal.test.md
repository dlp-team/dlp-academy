// copilot/explanations/codebase/tests/unit/pages/profile/EditProfileModal.test.md

## Changelog
### 2026-03-09: New unit coverage for profile edit modal lifecycle
- Added tests for:
  - cancel behavior without save side effects,
  - image selection preview flow via `URL.createObjectURL`,
  - save flow with storage upload and final `photoURL` propagation.

## Overview
This suite validates `EditProfileModal` behavior for user edits and avatar update workflows.

## Notes
- Firebase Storage calls are mocked to keep tests deterministic.
- Avatar rendering is mocked to assert preview-photo propagation directly.
