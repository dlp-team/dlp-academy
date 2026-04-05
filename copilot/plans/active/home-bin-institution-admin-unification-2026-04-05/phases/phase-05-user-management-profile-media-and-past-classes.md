<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/phases/phase-05-user-management-profile-media-and-past-classes.md -->
# Phase 05 - User Management, Profile Media, and Past Classes

## Status
- PLANNED

## Objective
Strengthen institution-admin user governance and fidelity of user-detail surfaces.

## Deliverables
- Users tab delete-user capability with proper guardrails.
- User-view profile-image loading from Firebase Storage.
- UI iconography cleanup: replace emojis with icons/components.
- Past/previous classes sections for:
  - teacher user view,
  - student user view.

## Security and Data Integrity Constraints
- Enforce role and institution checks before user deletion.
- Protect against accidental cross-tenant user operations.
- Ensure class-history visibility aligns with role permissions.

## Validation Gate
- Tests for authorized and unauthorized user deletion paths.
- Storage avatar fallback behavior checks.
- Regression checks for user view routes and class associations.
- Lint/typecheck pass.

## Exit Criteria
- Institution admins can safely manage users and user views display complete expected profile/history details.
