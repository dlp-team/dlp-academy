<!-- copilot/explanations/codebase/tests/unit/utils/permissionUtils.test.md -->

# permissionUtils.test.js

## Overview
- Source file: `tests/unit/utils/permissionUtils.test.js`
- Last documented: 2026-04-02
- Role: Deterministic unit coverage for permission and role helper behavior.

## Changelog
### 2026-04-02
- Added dual-role coverage for `getAssignedRoles(...)` and `getActiveRole(...)`.
- Added active-role guard assertions verifying `hasRequiredRoleAccess(...)` evaluates switched context correctly.
- Added fallback test ensuring invalid `activeRole` safely resolves to primary assigned role.

## Validation
- `npm run test -- tests/unit/utils/permissionUtils.test.js` passed as part of focused Phase 07 slice validation.
