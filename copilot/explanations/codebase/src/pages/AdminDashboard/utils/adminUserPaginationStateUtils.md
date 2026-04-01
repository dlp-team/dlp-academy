# adminUserPaginationStateUtils.ts

## Overview
- **Source file:** `src/pages/AdminDashboard/utils/adminUserPaginationStateUtils.ts`
- **Last documented:** 2026-04-01
- **Role:** Utility helpers for deterministic users-tab pagination response-state handling.

## Responsibilities
- Derives pagination metadata (`lastVisible`, `hasMore`) from Firestore page documents.
- Applies first-page replacement vs next-page append semantics in a centralized helper.
- Keeps `UsersTab` fetch flow branch-light and easier to test.

## Exports
- `buildAdminUsersPageMeta`
- `mergeAdminUsersPage`

## Main Dependencies
- None (pure utility module)

## Changelog
- 2026-04-01: Added to extract pagination response-state logic from `AdminDashboard.tsx` `UsersTab.fetchUsers(...)` and covered with focused tests in `tests/unit/pages/admin/adminUserPaginationStateUtils.test.js`.
