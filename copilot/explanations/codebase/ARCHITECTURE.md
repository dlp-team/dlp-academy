# ARCHITECTURE

## System Overview
DLP Academy is a multi-tenant learning platform with a React + Vite frontend and Firebase backend services.

## Runtime Layers
1. Frontend (React 18 + TypeScript)
- Route-level pages in `src/pages/`.
- Reusable UI in `src/components/`.
- Shared logic in `src/hooks/` and `src/utils/`.

2. Backend Services (Firebase)
- Firestore for domain data and access control.
- Firebase Auth for identity and role-bearing user accounts.
- Firebase Storage for binary assets.
- Cloud Functions in `functions/` for trusted server-side logic.

## Core Domain Boundaries
1. Identity and Permissions
- User role is persisted in `users/{uid}` (`admin`, `institutionadmin`, `teacher`, `student`).
- Permission helpers in `src/utils/permissionUtils.ts` support owner/editor/viewer patterns.
- Firestore rules enforce least-privilege writes and tenant boundaries.

2. Learning Content
- Hierarchy: subjects -> folders/topics -> resources (`documents`, `quizzes`).
- Subject access supports ownership, explicit sharing, and invite-code enrollment.

3. Institution Management
- Institution profiles, invitation workflows, and admin management surfaces are centralized in Admin dashboards.
- Institution scoping uses `institutionId` as canonical tenant key.

## Data Access Flow
1. UI triggers hook action (`useSubjects`, `useFolders`, page-specific hooks).
2. Hook executes Firestore read/write query.
3. Firestore rules validate auth, role, and institution constraints.
4. UI state is updated with optimistic or confirmed server responses.

## Security and Isolation Principles
- Tenant isolation by `institutionId` for cross-user reads/writes.
- Role-aware write restrictions for high-risk collections (`users`, `subjects`, `institution_invites`).
- Invite-code governance fields validated in rules and covered by deterministic tests.

## Testing and Quality Gates
- Unit and page-level tests: Vitest + Testing Library under `tests/unit/`.
- Firestore rules tests under `tests/rules/`.
- Required verification flow for changes:
  - targeted tests for touched modules,
  - impacted-suite regression run,
  - lint + diagnostics,
  - temporal lossless report update.

## Changelog
- 2026-04-01: Created initial architecture reference for Phase 08 documentation scope.
