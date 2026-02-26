## [2026-02-26] Feature Update: Owner Visibility + No-Alert Share Validation
### Context & Architecture
This update aligned subject/folder sharing UX around explicit owner presence and card-level error handling through thrown backend errors.

### Previous State
- Owner was not always shown as explicit `Propietario` row in sharing tabs.
- Folder share flow still used `alert(...)` in validation paths (self-share, missing user, cross-institution).

### New State & Logic
1. **Owner visible in sharing tabs**
   - Added synthetic owner row in `SubjectFormModal` and `FolderManager`.
   - Owner row is non-editable and non-removable.

2. **Cannot share with owner**
   - UI guards prevent share attempts targeting owner email.
   - Backend guard in `useFolders.shareFolder` rejects sharing when target user is folder owner.

3. **No browser alerts in folder share validation**
   - Replaced `alert(...)` branches in `useFolders.shareFolder` with thrown errors.
   - Modal cards now render these errors consistently using existing in-card error UI.

### Verification
- Diagnostics (`get_errors`) reported no issues in updated source files.

---

## [2026-02-26] Feature Update: Inline Share Confirmation Card UX
### Context & Architecture
This follow-up focused on modal sharing UX in `SubjectFormModal` and `FolderManager`, replacing browser-level confirmations with in-flow UI confirmation.

### Previous State
- Role updates used browser confirm dialogs.
- Share and unshare executed immediately.

### New State & Logic
- Added `pendingShareAction` in both modals to stage user actions.
- Added inline confirmation panels inside the sharing card for:
   - Sharing a user,
   - Changing role (viewer/editor),
   - Unsharing a user.
- Confirm/cancel actions now happen in-modal without `window.confirm`.

### Verification
- Diagnostics (`get_errors`) reported no issues for both updated modal files.

---

## [2026-02-26] Feature Update: Root Shared Boundary Lock + Edit Preservation Fixes
### Context & Architecture
This continuation updated Home movement guards and modal sharing UX, then fixed subject save payload behavior that affected shared visibility after editor edits.

### Previous State
- Editors could still move items out of root shared folders in some paths.
- Share tab layout could clip controls in narrower modal width.
- Owner role changes had no confirmation step.
- Editing a shared original subject could clear sharing metadata in the update payload.

### New State & Logic
1. **Root shared boundary lock for editors**
   - Added checks in `useHomePageHandlers` so editors cannot move elements outside a root shared folder tree.
   - Moves remain allowed inside the same root shared hierarchy.

2. **Wider sharing/editing cards**
   - Increased modal width for `SubjectFormModal` and `FolderManager` to improve content fit.

3. **Permission-change confirmation for owners**
   - Added explicit confirm dialogs before changing user role to `editor` or `viewer`.
   - Messages explain the permission impact of each role.

4. **Preserve sharing on editor updates**
   - Refactored `handleSaveSubject` payload in `useHomeHandlers`.
   - Edit path no longer writes `isShared/sharedWith` reset fields.
   - Create path still initializes and inherits sharing as intended.

### Verification
- Diagnostics (`get_errors`) reported no errors for all modified files.

---

## [2026-02-26] Feature Update: Editor Move Restrictions + Subject/Folder Modal Unification
### Context & Architecture
This session touched Home move handlers (`src/pages/Home/hooks/useHomePageHandlers.js`), sharing primitives (`src/hooks/useSubjects.js`, `src/hooks/useFolders.js`), and edit/share UIs (`src/pages/Subject/modals/SubjectFormModal.jsx`, `src/pages/Home/components/FolderManager.jsx`, `src/pages/Subject/modals/subject-form/StyleSelector.jsx`).

The architecture path is:
- UI modals -> `HomeModals` props -> hook share APIs (`useSubjects` / `useFolders`) -> Firestore updates.
- Drag-and-drop/tree moves -> `useHomePageHandlers` permission guards -> folder/subject move operations.

### Previous State
- Item-level editor users could still hit some move paths where source shared-folder write rights were not enforced.
- Subject/Folder sharing tabs were inconsistent in interaction model.
- Subject sharing defaulted to viewer without explicit role selection in UI.
- Existing shared-user roles were not editable in-place from both modals.
- Large shared-user lists had no search control.
- Subject modern fill palette was always expanded.

### New State & Logic
1. **Move restrictions aligned with intent**
   - Added source shared-folder write guard via `canWriteFromSourceFolder` in `useHomePageHandlers`.
   - Enforced for both folder-drop and tree move subject flows.
   - Outcome: subject editors can edit/delete subject content but cannot move if they lack source folder write permission.

2. **Sharing role upsert in data layer**
   - `shareSubject(subjectId, email, role)` now normalizes role and updates existing shared entry role in place.
   - `shareFolder(folderId, email, role)` now does the same for folder sharing.
   - Return payloads include `alreadyShared` and `roleUpdated` for UI feedback.

3. **Subject sharing tab improvements**
   - Added role selector before sharing.
   - Added owner-only per-user role dropdown to modify permissions.
   - Added search bar when shared users > 5.
   - Preserved existing general tab behavior.

4. **Folder modal parity with subject modal**
   - Reworked `FolderManager` tab structure to match subject modal style.
   - General tab mirrors subject layout patterns (without icon controls).
   - Sharing tab includes role preselection, owner role editing, and >5 search.

5. **Modern fill collapse behavior**
   - `StyleSelector` now supports collapsible modern fill palette with selected-value feedback.
   - Folder modal modern fill section follows the same collapsed interaction.

### Verification
- Diagnostics (`get_errors`) reported no errors in all updated source files.

---
