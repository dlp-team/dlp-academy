<!-- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/subplans/subplan-01-permissions-and-rules.md -->

# Subplan 01 - Permissions and Rules

## Scope
- Firestore subject creation permission denied flow.
- Subject deletion permission reliability for teacher/institution admin.
- Storage icon upload authorization path.

## Target Files
- `firestore.rules`
- `storage.rules`
- `src/hooks/useSubjects.ts`
- `src/pages/Home/hooks/useHomeHandlers.ts`
- `src/pages/InstitutionAdminDashboard/hooks/useCustomization.ts`

## Acceptance Criteria
- Teacher can create subject without 403 in approved scenarios.
- Institution admin icon upload works for own institution path.
- Deny paths still deny unauthorized tenants and roles.

## Status
- NEXT: start with rules diff and targeted tests.

