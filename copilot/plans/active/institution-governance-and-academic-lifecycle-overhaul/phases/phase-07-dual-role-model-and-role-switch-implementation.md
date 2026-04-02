<!-- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/phases/phase-07-dual-role-model-and-role-switch-implementation.md -->

# Phase 07 - Dual-Role Model and Role Switch Implementation

## Status
- PLANNED

## Objective
Support users who need both institution admin and teacher responsibilities without account duplication or permission ambiguity.

## Scope
1. Audit current role constraints and collision points.
2. Define canonical model for dual-role user representation.
3. Implement role switch control in authenticated shell.
4. Persist selected active view and rehydrate safely.
5. Validate route guard behavior and permission checks under switched context.

## Files Expected
- `src/App.tsx`
- `src/components/layout/**`
- `src/utils/permissionUtils.js`
- `src/firebase/**` (if claims/profile access helpers are needed)
- Cloud Functions claims synchronization code if required

## Risks
- Route-level privilege escalation if context switching is weakly validated.
- UI state contamination across role contexts.

## Validation Gate
- Dual-role accounts can switch context without logout.
- Role-specific routes and actions enforce correct permissions.
- Single-role users remain unaffected.

## Rollback
- Keep role switch path gated behind capability checks and fallback to legacy role behavior.

## Completion Notes
- Pending.

