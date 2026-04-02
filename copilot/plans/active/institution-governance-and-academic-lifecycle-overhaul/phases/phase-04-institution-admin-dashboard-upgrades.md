<!-- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/phases/phase-04-institution-admin-dashboard-upgrades.md -->

# Phase 04 - Institution Admin Dashboard Upgrades

## Status
- PLANNED

## Objective
Upgrade institution administration capabilities with a reliable preview experience, scalable user-list performance, and strict policy behavior.

## Scope
1. Customization preview exact-app replica strategy and implementation.
2. Pagination or cursor-based batching for large student/teacher lists.
3. Policy toggle enforcement verification for:
   - dynamic code requirement,
   - teacher subject creation without admin approval,
   - teacher class/student assignment without admin approval,
   - teacher subject deletion with associated students without admin approval.

## Files Expected
- `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.jsx`
- `src/pages/InstitutionAdminDashboard/components/**`
- `src/pages/InstitutionAdminDashboard/hooks/useCustomization.ts`
- `src/utils/institutionPolicyUtils.js`
- Related tests in `tests/unit/**` and `tests/e2e/**`

## Risks
- Preview implementation drift from real Home behavior.
- Policy toggles affecting unintended workflows.

## Validation Gate
- Preview reflects real app structure and theme behavior.
- Large user lists reduce request load and remain usable.
- Policy toggles produce deterministic allow/deny behavior.

## Rollback
- Feature-flag preview mode and pagination entrypoints when feasible.

## Completion Notes
- Pending.

