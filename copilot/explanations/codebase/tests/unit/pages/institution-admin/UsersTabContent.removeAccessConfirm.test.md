<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.md -->
# UsersTabContent.removeAccessConfirm.test.jsx

## Overview
- **Source file:** `tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx`
- **Last documented:** 2026-03-30
- **Role:** Focused regression coverage for Institution Admin invite-access removal confirmation behavior.

## Coverage
- Invite delete action opens in-page confirmation modal before remove handler execution.
- Confirm path invokes `onRemoveAccess` only after explicit user confirmation.
- Cancel path closes modal and does not invoke destructive handler.
- Browser `window.confirm(...)` is never used by the migrated flow.

## Changelog
### 2026-03-30
- Added initial regression suite for modal-first invite-access removal in `UsersTabContent`.
