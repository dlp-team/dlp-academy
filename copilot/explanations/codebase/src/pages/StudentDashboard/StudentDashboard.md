<!-- copilot/explanations/codebase/src/pages/StudentDashboard/StudentDashboard.md -->

# StudentDashboard.tsx

## Overview
- Source file: `src/pages/StudentDashboard/StudentDashboard.tsx`
- Last documented: 2026-04-02
- Role: Student-specific dashboard shell and summary surface.

## Changelog
### 2026-04-02
- Added file path header comment in source file for touched-file convention alignment.
- Updated unauthorized access guard to evaluate `getActiveRole(user)` so student dashboard access follows selected active role in dual-role sessions.

## Validation
- `get_errors` clean for `src/pages/StudentDashboard/StudentDashboard.tsx`.
- Role-context regression covered by `tests/unit/utils/permissionUtils.test.js` active-role guard expectations.
