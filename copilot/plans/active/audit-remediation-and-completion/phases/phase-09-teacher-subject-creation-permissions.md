<!-- copilot/plans/active/audit-remediation-and-completion/phases/phase-09-teacher-subject-creation-permissions.md -->

# Phase 09: Teacher Subject Creation Permissions

**Duration:** 6-8 hours | **Priority:** 🟡 HIGH | **Status:** ✅ COMPLETED

## Objective
Allow teachers to create subjects without institution admin approval, with an institution-level configurable toggle.

## Slice Completed (2026-04-01)

### Added policy model support
- Updated `src/utils/institutionPolicyUtils.ts`:
  - added `teachers.allowTeacherAutonomousSubjectCreation` default (`true`),
  - added helper `canTeacherCreateSubjectsAutonomously(...)`.

### Added permission helper enforcement path
- Updated `src/utils/permissionUtils.ts`:
  - `canCreateSubjectByRole(...)` now accepts policy options and blocks teacher creation when autonomous creation is disabled.

### Hook-level creation enforcement
- Updated `src/hooks/useSubjects.ts`:
  - added teacher policy resolution state (`teacherSubjectCreationAllowed`),
  - added `ensureTeacherCanCreateSubject(...)` gate before subject creation transaction,
  - emits explicit user-facing denial error when institution disables autonomous teacher creation.

### Home guard wiring
- Updated `src/pages/Home/hooks/useHomeLogic.ts` and `src/pages/Home/hooks/useHomeCreationGuards.ts`:
  - passes and consumes policy-aware creation state,
  - create-subject controls now reflect institution policy for teachers.
- Updated `src/pages/Home/Home.tsx` to provide policy flag to creation guards.
- Updated `src/hooks/useHomeHandlers.ts` to surface policy-specific denial messaging in save flow.

### Institution admin toggle
- Updated `src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx`:
  - added policy checkbox: "Los profesores pueden crear asignaturas sin aprobacion del administrador",
  - included in existing policy save payload.

### Firestore rules enforcement
- Updated `firestore.rules`:
  - added `allowsTeacherAutonomousSubjectCreation(institutionId)` helper,
  - subject create rule now denies teacher create when institution policy is disabled.

## Validation
- `get_errors` on all touched files: clean.
- Unit tests:
  - `npm run test -- tests/unit/utils/permissionUtils.test.js tests/unit/hooks/useHomeCreationGuards.test.js tests/unit/hooks/useSubjects.test.js tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx`
  - result: passed (`45/45` tests)
- Rules tests:
  - `npm run test:rules`
  - result: passed (`49/49` tests)

## Risks and Notes
- Policy defaults to enabled when missing to preserve backward compatibility.
- Enforcement exists in both client hook path and Firestore rules path to preserve least-privilege guarantees.
- Teacher-creation policy preload in `useSubjects` introduces expected asynchronous state updates in test runtime; tests were adjusted to stable mocks.
