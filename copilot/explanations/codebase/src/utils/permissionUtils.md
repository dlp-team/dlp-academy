<!-- copilot/explanations/codebase/src/utils/permissionUtils.md -->

# permissionUtils.ts

## Changelog
### 2026-04-02
- Added dual-role role-context helpers:
	- `getAssignedRoles(...)` (deduplicated assigned-role resolver across legacy + additive fields).
	- `getActiveRole(...)` (active-role resolver with fallback to assigned primary role).
- Updated `hasRequiredRoleAccess(...)` to evaluate access against active role context.
- Kept backward compatibility for single-role users by preserving `role` as canonical fallback.

### 2026-04-01
- Updated `canCreateSubjectByRole(...)` to accept policy options.
- Teacher create-subject permission now respects `allowTeacherAutonomousSubjectCreation` while preserving admin/institutionadmin behavior.

## Overview
- **Source file:** `src/utils/permissionUtils.ts`
- **Role:** Permission and role utility surface for UI guards and feature-level access checks.

## Notes
- This update is used by Home creation guards to enforce institution-level teacher creation policy in UI flows.
