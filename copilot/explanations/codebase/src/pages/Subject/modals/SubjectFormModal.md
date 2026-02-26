## [2026-02-26] Feature Update: In-Card Share Confirmations (No Browser Alerts)
### Context & Architecture
`SubjectFormModal` sharing tab now mediates potentially destructive changes through inline confirmation UI state before calling `onShare/onUnshare`.

### Previous State
- Permission changes relied on browser confirm dialogs.
- Share and unshare actions executed immediately without a confirmation step.

### New State & Logic
- Added `pendingShareAction` state to represent pending operations (`share`, `permission`, `unshare`).
- Added inline confirmation panel inside the sharing card with contextual warning text and explicit confirm/cancel actions.
- Removed browser alert/confirm dependency for these actions.

---

## [2026-02-26] Feature Update: Wider Sharing Layout + Permission Change Confirmation
### Context & Architecture
`SubjectFormModal` is the subject edit/share entrypoint in Home and receives `onShare/onUnshare` from hook-backed handlers.

### Previous State
- Share controls could feel cramped in modal width.
- Owner role changes had no explicit confirmation before applying permission changes.

### New State & Logic
- Increased modal width for better fit of share input + role selector + action button.
- Added confirmation dialog before owner changes a user's permission, with role-specific warning text.
- Keeps owner-only role mutation behavior intact.

---

## [2026-02-26] Feature Update: Unified Subject Sharing UX + Owner Permission Management
### Context & Architecture
`SubjectFormModal` is used from Home-level modal orchestration and talks to sharing handlers exposed by `useSubjects` through `HomeModals`.

### Previous State
- Sharing always sent viewer permission.
- Existing shared users could not have role changed in-place from this tab.
- The shared users list had no search utility for large lists.

### New State & Logic
- Added role selection before sharing (`viewer` / `editor`) and pass-through to `onShare(subjectId, email, role)`.
- Added owner-level permission editing per shared row (role dropdown per user).
- Added conditional search input when shared users > 5.
- Kept edit/general section behavior intact while integrating the new sharing controls.

---

# SubjectFormModal.jsx

## Overview
- **Source file:** `src/pages/Subject/modals/SubjectFormModal.jsx`
- **Last documented:** 2026-02-24
- **Role:** Modal/dialog UI used for create, edit, confirm, or detail flows.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.

## Exports
- `default SubjectFormModal`

## Main Dependencies
- `react`
- `lucide-react`
- `../../../utils/subjectConstants`
- `./subject-form/BasicInfoFields`
- `./subject-form/TagManager`
- `./subject-form/AppearanceSection`
- `./subject-form/StyleSelector`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
