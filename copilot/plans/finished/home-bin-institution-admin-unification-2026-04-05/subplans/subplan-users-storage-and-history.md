<!-- copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/subplans/subplan-users-storage-and-history.md -->
# Subplan - Users Tab Governance, Storage Avatars, and Past Classes

## Parent Phase
- Phase 05

## Objective
Improve user administration and user-view fidelity with safe deletion flows and complete historical context.

## Workstreams
1. Add institution-admin delete-user capability with confirmation safeguards.
2. Resolve user profile images from Firebase Storage in user views.
3. Replace emoji-based UI markers with icon components.
4. Build past classes sections for teachers and students.

## Candidate Files
- src/pages/InstitutionAdmin/**
- src/components/modules/**
- src/hooks/**
- src/firebase/**
- src/utils/permissionUtils.js

## Validation
- Authorization checks for delete operation.
- UI fallback behavior for missing/corrupt profile images.
- Past-classes visibility checks by role.

## Rollback Trigger
- If deletion flow introduces high-risk regressions, disable delete action entry point and retain read-only users view until fixed.


