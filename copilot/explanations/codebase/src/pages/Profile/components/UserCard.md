# [2026-03-13] Role Badge Coverage Expanded

## [2026-04-02] Active-Role Badge Context

### Context
Dual-role sessions can switch active role context without changing the stored primary profile role value.

### Change
- Role badge rendering now resolves with `getActiveRole(...)`.
- Badge icon/label/class mapping remains unchanged; only role-source resolution changed.

### Impact
- Profile header role badge now follows switched active role context consistently.

## Context
Profile role badge previously only differentiated `teacher` vs `student`.

## Change
- Added explicit role mapping for `admin`, `institutionadmin`, `teacher`, and `student`.
- Added icon and style variants per role to keep semantic distinction in profile header card.

## Validation
- `get_errors` reports no issues in `src/pages/Profile/components/UserCard.jsx`.

# UserCard.jsx

## Overview
- **Source file:** `src/pages/Profile/components/UserCard.jsx`
- **Last documented:** 2026-02-24
- **Role:** Reusable UI component consumed by the parent page/module.

## Responsibilities
- Handles user events and triggers updates/actions.

## Exports
- `default UserCard`

## Main Dependencies
- `react`
- `lucide-react`
- `../../../components/ui/Avatar`
- `../../../utils/permissionUtils`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
