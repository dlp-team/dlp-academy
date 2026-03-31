## [2026-03-31] Classes Tab Load Feedback Hardening
### Context & Architecture
The classes-tab loader in `SubjectFormModal` silently fell back to an empty list when the Firestore classes query failed, making load failures indistinguishable from true no-classes states.

### Change
- Added dedicated classes-list load feedback state: `classesLoadError`.
- Added permission-specific classes-load feedback (`No tienes permiso para cargar las clases disponibles de esta asignatura.`).
- Added generic classes-load retry feedback for non-permission failures.
- Kept existing class-assignment action feedback (`classesActionError`/`classesActionSuccess`) independent from the load-error state.

### Validation
- Added focused regression coverage in `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx` for success and permission-denied classes-load paths.

## [2026-03-31] Courses Load Feedback Hardening
### Context & Architecture
`SubjectFormModal` course loading in the general tab previously failed silently by falling back to an empty list when the `courses` query errored.

### Change
- Added dedicated general-tab courses load feedback state: `coursesLoadError`.
- Added permission-specific feedback for denied course reads.
- Added generic retry feedback for non-permission `courses` query failures.
- Rendered explicit inline banner in the general tab so load failures are not confused with no available courses.

### Validation
- Expanded `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx` with denied `courses` query regression coverage.

## [2026-03-31] Sharing Suggestions Load Feedback Hardening
### Context & Architecture
`SubjectFormModal` sharing suggestions preload (institution users list) previously failed silently by falling back to an empty suggestions set when the `users` query errored.

### Change
- Added dedicated sharing preload feedback state: `institutionEmailsLoadError`.
- Added permission-specific feedback for denied institution `users` reads.
- Added generic retry feedback for non-permission suggestion-load failures.
- Rendered explicit inline banner in the sharing tab above share controls.

### Validation
- Expanded `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx` with denied institution `users` query regression coverage.

## [2026-03-31] Owner Email Resolve Feedback Hardening
### Context & Architecture
Owner email resolution in `SubjectFormModal` sharing flows previously failed silently by clearing owner metadata without explicit user feedback when user lookups errored.

### Change
- Added dedicated owner lookup feedback state: `ownerEmailResolveError`.
- Added permission-specific feedback for denied owner-email lookup reads.
- Added generic retry feedback for non-permission owner lookup failures.
- Rendered explicit inline sharing-tab banner when owner email resolution fails.

### Validation
- Expanded `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx` with denied owner-email lookup regression coverage.

## [2026-03-31] Institution Policy Load Feedback Hardening
### Context & Architecture
Institution policy preload in `SubjectFormModal` previously failed silently by reverting to defaults with no explicit classes-tab feedback when institution reads errored.

### Change
- Added dedicated policy preload feedback state: `institutionPolicyLoadError`.
- Added permission-specific feedback for denied institution policy reads.
- Added generic retry feedback for non-permission institution policy load failures.
- Rendered explicit classes-tab banner for policy preload failures.

### Validation
- Expanded `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx` with denied institution policy load regression coverage.

## [2026-03-31] Class Request Mutation Feedback Hardening
### Context & Architecture
Class-assignment request writes in `SubjectFormModal` previously relied on generic raw errors, making denied-write causes unclear in classes-tab request flows.

### Change
- Added permission-specific classes-tab feedback when class-assignment request writes fail with `permission-denied`.
- Preserved existing generic fallback for non-permission request write errors.

### Validation
- Expanded `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx` with denied class-request mutation regression coverage.

## [2026-03-31] Shortcut Self-Unshare Feedback Hardening
### Context & Architecture
Shortcut self-unshare mutations in `SubjectFormModal` previously relied on generic error messaging, making denied-write causes unclear.

### Change
- Added permission-specific feedback when self-unshare writes fail with `permission-denied`.
- Preserved existing generic fallback for non-permission self-unshare failures.

### Validation
- Expanded `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx` with denied self-unshare regression coverage.

## [2026-03-31] Transfer Ownership Feedback Hardening
### Context & Architecture
Transfer-ownership mutations in `SubjectFormModal` previously relied on generic error messaging, making denied-write causes unclear.

### Change
- Added permission-specific feedback when transfer-ownership writes fail with `permission-denied`.
- Preserved existing generic fallback for non-permission transfer failures.

### Validation
- Expanded `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx` with denied transfer-ownership regression coverage.

## [2026-03-13] Permission Hardening: Viewer Class Tab is Read-Only
### Context & Architecture
Teachers with `viewer` shortcut permissions were still able to interact with class assignment controls in the `Clases` tab.

### Change
- Split class-tab access from class-assignment mutation: `canAccessClassesTab` vs `canModifyClassAssignments`.
- Preserved invite-code visibility/copy for viewer-level access.
- Disabled class checkbox edits and hid class mutation actions for read-only viewers.
- Expanded avatar URL normalization for shared-user rows and owner row fallback fields.

### Validation
- `get_errors` reports no issues in `src/pages/Subject/modals/SubjectFormModal.jsx`.

## [2026-03-12] Feature Update: Subject Course Selector Uses Firestore Courses
### Context & Architecture
`SubjectFormModal` now loads available courses from Firestore (`courses` collection filtered by `institutionId`) and passes them to `BasicInfoFields` for selection.

### Previous State
- Course selection in the general tab depended on static `EDUCATION_LEVELS` (`level` + `grade`) and auto-generated `course` labels.
- New courses created from institution administration were not automatically reflected in the subject form selector.

### New State & Logic
- Added modal-level course loading state: `availableCourses` + `coursesLoading`.
- Added `loadCourses` effect scoped to modal open and institution context.
- Removed strict validation dependency on `level`/`grade`; save now requires `name` and `course`.
- Preserved backward compatibility by keeping legacy `level`/`grade` values when present and deriving fallback course label from them when needed.

## [2026-03-09] Feature Update: Required-Field Validation Feedback in General Tab
### Context & Architecture
`SubjectFormModal` now performs explicit required checks for subject name and academic course before saving from the `General` tab.

### Previous State
- Save could fail by required constraints without a consistent inline visual cue on each missing field.

### New State & Logic
- Added `validationErrors` state and propagated it into `BasicInfoFields`.
- Added ref-based focus/scroll to the first invalid required field.
- Clears field-level errors as users correct input.

---

## [2026-02-26] Feature Update: Institution Email Autocomplete Suggestions
### Context & Architecture
`SubjectFormModal` sharing input now preloads institution user emails and suggests candidates while typing.

### Previous State
- Sharing relied on manual email input without discovery assistance.

### New State & Logic
- Added Firestore-backed preload of emails from same `institutionId`.
- Added suggestion list under the share input while typing.
- Prioritizes same-domain emails (matching current user domain), then prefix matches.
- Filters out owner/current user/already shared users.

---

## [2026-02-26] Feature Update: Owner Row Visibility + Owner Protection in Sharing Tab
### Context & Architecture
`SubjectFormModal` now composes sharing rows as `owner + shared users`, ensuring ownership context is always visible in-card.

### Previous State
- Owner did not always appear explicitly in the sharing list.
- Owner could be targeted by generic list actions depending on source data.

### New State & Logic
- Added synthetic owner row rendering with `Propietario` label.
- Prevented owner from unshare and permission-change actions at UI level.
- Added owner-email guard before share execution to avoid sharing with owner.

---

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

# [2026-03-07] Clase Tab: Subject Invite Code Visibility

## Context
- Teachers needed to retrieve the subject invite code from the existing three-dots edit flow without leaving the subject modal.

## Change
- Added an invite-code panel in the `Clases` tab of `SubjectFormModal`.
- The panel displays the current subject invite code and includes a copy action.
- Messaging clarifies this code is for enrolling students not tied to a class.

## Validation
- Manual UI path validated in code: `activeTab === 'classes'` block now renders invite-code panel using `formData.inviteCode || initialData.inviteCode`.

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
