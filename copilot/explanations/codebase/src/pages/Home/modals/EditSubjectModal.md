## Changelog
- **2026-04-05:** Migrated from direct `BaseModal` usage to generalized `DashboardOverlayShell`, added open-snapshot reset on modal open, and enabled unsaved-close confirmation for outside/header/cancel exits.
- **2026-04-05:** Migrated modal shell to `BaseModal` while preserving edit form state, icon/color selectors, and submit behavior.

# EditSubjectModal.tsx

## Overview
- **Source file:** `src/pages/Home/modals/EditSubjectModal.tsx`
- **Last documented:** 2026-02-24
- **Role:** Modal/dialog UI used for create, edit, confirm, or detail flows.

## Responsibilities
- Manages local UI state and interaction flow.
- Handles user events and triggers updates/actions.

## Exports
- `default EditSubjectModal`

## Main Dependencies
- `react`
- `lucide-react`
- `../../../utils/subjectConstants`
- `src/components/ui/DashboardOverlayShell.tsx`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
