<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/AddTeacherModal.md -->
# AddTeacherModal.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/AddTeacherModal.tsx`
- **Last documented:** 2026-04-05
- **Role:** Institution Admin overlay used to whitelist/authorize teacher emails.

## Responsibilities
- Render teacher authorization form and action buttons.
- Keep user-visible error/success feedback inline.
- Route dismiss actions through shared overlay close guard.
- Enable outside-click close with unsaved-change confirmation when the email input was modified.

## Exports
- `default AddTeacherModal`

## Main Dependencies
- `react`
- `lucide-react`
- `src/components/ui/DashboardOverlayShell.tsx`

## Changelog
### 2026-04-05
- Migrated from a local fixed-overlay implementation to `DashboardOverlayShell`.
- Adopted shared header-to-bottom overlay bounds and close-request routing.
- Added dirty-close confirmation behavior for accidental dismiss protection.
