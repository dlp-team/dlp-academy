<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.md -->
# ClassesCoursesSection.deleteConfirm.test.jsx

## Overview
- **Source file:** `tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx`
- **Last documented:** 2026-04-02
- **Role:** Focused regression coverage for Institution Admin course/class delete confirmation and paper-bin behavior.

## Coverage
- Course delete action opens in-page confirmation modal before mutation.
- Course delete cancel path closes modal and avoids destructive handlers.
- Class delete action opens in-page confirmation modal before mutation.
- Confirm path invokes only the expected delete handler for the targeted entity.
- Browser `window.confirm(...)` is never used in migrated flows.
- Bin tab restore action triggers the expected restore handler for trashed courses.
- Permanent delete in bin is gated by exact typed-name confirmation before calling destructive handlers.

## Changelog
### 2026-04-02
- Updated delete-confirm expectations to the move-to-trash copy (`Mover ... a papelera`).
- Added bin restore regression coverage for trashed courses.
- Added typed-name guard regression coverage for permanent delete in bin.

### 2026-03-30
- Added initial focused regression suite for `ClassesCoursesSection` confirmation-first delete flows.
- Added assertions for both course and class branches, including cancel behavior and handler isolation.
