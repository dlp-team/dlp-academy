## [2026-02-26] Feature Update: In-Card Share Confirmations (No Browser Alerts)
### Context & Architecture
`FolderManager` sharing tab now stages share mutations in local state and only executes after inline confirmation.

### Previous State
- Permission change confirmations used browser dialogs.
- Share/unshare actions executed directly from controls.

### New State & Logic
- Introduced `pendingShareAction` state for `share`, `permission`, and `unshare` intents.
- Added inline confirmation card within the sharing tab with role-aware and action-aware messages.
- Centralized confirm execution paths to call `onShare`/`onUnshare` after explicit user confirmation.

---

## [2026-02-26] Feature Update: Wider Sharing Layout + Permission Change Confirmation
### Context & Architecture
`FolderManager` is the folder edit/share UI in Home and fronts `useFolders.shareFolder` updates.

### Previous State
- Sharing row controls could compress in the modal.
- Owner permission changes had no explicit warning/confirmation step.

### New State & Logic
- Increased modal width to improve fit for sharing controls and user rows.
- Added confirmation dialogs before owner changes user role with role-specific warning text.
- Maintains owner-only role editing and existing unshare behavior.

---

## [2026-02-26] Feature Update: Folder Modal Parity with Subject Modal
### Context & Architecture
`FolderManager` is the Home folder modal and consumes sharing handlers from `useFolders` through `HomeModals`. It now follows the same interaction model as `SubjectFormModal`.

### Previous State
- General tab structure diverged from subject modal UX.
- Sharing tab was simpler and lacked robust feedback/search behavior.
- Shared user permissions were not editable in-row by owner.

### New State & Logic
- Rebuilt the modal structure to mirror subject tabs (`General` / `Compartir`) while omitting icon controls for folders.
- Added modern fill selector with collapsed/expand behavior for better edit-tab parity.
- Added role selection before share, owner-level per-user permission update, and search bar when shared users exceed 5.
- Added loading/success/error feedback consistency on sharing actions.

---

# FolderManager.jsx

## Overview
- **Source file:** `src/pages/Home/components/FolderManager.jsx`
- **Last documented:** 2026-02-24
- **Role:** Reusable UI component consumed by the parent page/module.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.

## Exports
- `default FolderManager`

## Main Dependencies
- `react`
- `lucide-react`
- `../../../utils/subjectConstants`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
