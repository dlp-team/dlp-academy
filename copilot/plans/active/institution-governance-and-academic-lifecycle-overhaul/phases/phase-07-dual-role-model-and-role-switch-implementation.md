<!-- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/phases/phase-07-dual-role-model-and-role-switch-implementation.md -->

# Phase 07 - Dual-Role Model and Role Switch Implementation

## Status
- IN_PROGRESS

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
- 2026-04-02 (Slice 01 baseline):
	- Added canonical dual-role helpers in `permissionUtils` (`getAssignedRoles`, `getActiveRole`) and moved role-access checks to active-role semantics.
	- Implemented authenticated-shell role switch control in `Header` with persisted active-role rehydration via app-level storage/event synchronization in `App.tsx`.
	- Updated dashboard guard checks (`AdminDashboard`, `TeacherDashboard`, `StudentDashboard`, `InstitutionAdminDashboard`) to read active role context.
	- Added/updated targeted tests:
		- `tests/unit/utils/permissionUtils.test.js`
		- `tests/unit/App.authListener.test.jsx`
- 2026-04-02 (Slice 02 deterministic route gate):
	- Added explicit `allowedRoles` guard support in `ProtectedRoute` for dashboard routes that must enforce exact active-role context.
	- Applied exact active-role route gates:
		- admin dashboard: `admin` only,
		- institution admin routes: `institutionadmin` + `admin`,
		- teacher routes: `teacher` only,
		- student dashboard: `student` only.
	- Extended `App.authListener` unit suite with active-role switched dual-role denial path for `/admin-dashboard`.

