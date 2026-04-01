<!-- copilot/explanations/codebase/src/pages/AdminDashboard/components/UserTableRow.md -->

# UserTableRow.tsx

## Overview
- **Source file:** `src/pages/AdminDashboard/components/UserTableRow.tsx`
- **Last documented:** 2026-04-01
- **Role:** Encapsulates one row in the Admin users table.

## Responsibilities
- Renders user identity, role badge, status badge, role selector, and toggle action.
- Delegates role updates and status toggles through callback props.
- Keeps row-specific markup/interaction logic out of `AdminDashboard.tsx`.

## Exports
- `default UserTableRow`

## Main Dependencies
- `react`
- `lucide-react`
- `./RoleBadge`
- `./UserStatusBadge`
- `../utils/adminUserRoleConstants`

## Changelog
### 2026-04-01
- Replaced inline role option labels with shared constants/mappers from `src/pages/AdminDashboard/utils/adminUserRoleConstants.ts` to keep role display semantics centralized.
