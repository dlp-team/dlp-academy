<!-- copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminUserPaginationQueryUtils.md -->

# adminUserPaginationQueryUtils.ts

## Overview
- **Source file:** `src/pages/AdminDashboard/utils/adminUserPaginationQueryUtils.ts`
- **Last documented:** 2026-04-01
- **Role:** Builds users pagination Firestore queries for AdminDashboard without duplicating inline query assembly in the page component.

## Responsibilities
- Builds first-page users query with `limit(pageSize)`.
- Builds next-page users query with `startAfter(cursor)` and `limit(pageSize)`.
- Keeps query-shape behavior centralized for regression-safe pagination updates.

## Exports
- `const buildAdminUsersPageQuery`

## Main Dependencies
- `firebase/firestore`
- `src/firebase/config`
