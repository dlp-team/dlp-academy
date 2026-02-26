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
