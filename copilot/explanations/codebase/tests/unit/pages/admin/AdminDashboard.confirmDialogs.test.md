<!-- copilot/explanations/codebase/tests/unit/pages/admin/AdminDashboard.confirmDialogs.test.md -->
# AdminDashboard.confirmDialogs.test.jsx

## Overview
- **Source file:** `tests/unit/pages/admin/AdminDashboard.confirmDialogs.test.jsx`
- **Last documented:** 2026-03-30
- **Role:** Focused regression coverage for Admin Dashboard confirmation-first destructive actions.

## Coverage
- Institution enable/disable action opens in-page confirmation and executes only after explicit confirm.
- Institution delete action supports cancel path without calling destructive handlers.
- User enable/disable action opens in-page confirmation and executes only after explicit confirm.
- User role change action opens in-page confirmation and mutates role only after explicit confirm.
- Users pagination load-more action reuses the last visible cursor and appends next-page rows.
- Browser `window.confirm(...)` is not used by migrated Admin Dashboard destructive flows.

## Changelog
### 2026-03-30
- Added initial regression suite for Admin Dashboard institutions/users modal-first confirmations.
- Added pagination regression case that asserts `startAfter(lastVisible)` is used and next-page users are appended.
