<!-- copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminInstitutionInviteQueryUtils.md -->

# adminInstitutionInviteQueryUtils.ts

## Overview
- **Source file:** `src/pages/AdminDashboard/utils/adminInstitutionInviteQueryUtils.ts`
- **Last documented:** 2026-04-01
- **Role:** Loads current institution-admin invite records for institutions edit flow.

## Responsibilities
- Queries institution invite records filtered by institutionId and role.
- Maps Firestore snapshots to lightweight invite records (`id`, `email`).
- Centralizes invite-query loading logic used by edit submit orchestration.

## Exports
- `const loadInstitutionAdminInvites`

## Main Dependencies
- `firebase/firestore`
- `src/firebase/config`
