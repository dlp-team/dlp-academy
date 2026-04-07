# EditProfileModal.tsx

## Changelog
### 2026-04-07: Migrated to BaseModal
- Replaced in-file overlay wrapper with shared [BaseModal](../../../../../../src/components/ui/BaseModal.tsx).
- Preserved explicit close-only behavior by disabling backdrop close (`closeOnBackdropClick={false}`).
- Added backdrop regression coverage in [tests/unit/pages/profile/EditProfileModal.test.jsx](../../../../../../tests/unit/pages/profile/EditProfileModal.test.jsx).

## Overview
- **Source file:** `src/pages/Profile/modals/EditProfileModal.tsx`
- **Last documented:** 2026-02-24
- **Role:** Modal/dialog UI used for create, edit, confirm, or detail flows.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.

## Exports
- `default EditProfileModal`

## Main Dependencies
- `react`
- `lucide-react`
- `../../../components/ui/Avatar`
- `../../../components/ui/BaseModal`
- `../../../firebase/config`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
