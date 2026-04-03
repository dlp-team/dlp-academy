<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.md -->
# UsersTabContent.removeAccessConfirm.test.jsx

## Overview
- **Source file:** `tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx`
- **Last documented:** 2026-04-02
- **Role:** Focused regression coverage for Institution Admin invite-access removal confirmation behavior.

## Coverage
- Invite delete action opens in-page confirmation modal before remove handler execution.
- Confirm path invokes `onRemoveAccess` only after explicit user confirmation.
- Cancel path closes modal and does not invoke destructive handler.
- Browser `window.confirm(...)` is never used by the migrated flow.
- Policy-save path keeps teacher policy payload stable while teacher-permission controls are delegated to the Configuración tab.
- Teacher table pagination button delegates to `onLoadMoreUsers`.

## Changelog
### 2026-04-03
- Updated policy-save regression assertion to match current UI architecture:
	- teacher autonomous-subject toggle is no longer rendered in `UsersTabContent`,
	- panel now shows guidance text and preserves teacher policy payload on save.

### 2026-04-02
- Added regression case that validates teacher pagination control invokes `onLoadMoreUsers`.

### 2026-04-01
- Added regression assertion for teacher autonomous subject-creation policy toggle save behavior.

### 2026-03-30
- Added initial regression suite for modal-first invite-access removal in `UsersTabContent`.
