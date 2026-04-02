<!-- copilot/explanations/codebase/tests/unit/hooks/useProfile.test.md -->

# useProfile.test.js

## Overview
- **Source file:** `tests/unit/hooks/useProfile.test.js`
- **Role:** Unit coverage for profile hook loading, profile updates, and logout flow.

## Changelog
### 2026-04-02
- Added `permissionUtils.getActiveRole` test mock compatibility after profile hook migrated role checks to active-role semantics.
- Existing assertions for profile/subjects load, profile update, and logout behavior remain unchanged.

## Validation
- Included in focused Phase 07 residual role-audit validation run.
