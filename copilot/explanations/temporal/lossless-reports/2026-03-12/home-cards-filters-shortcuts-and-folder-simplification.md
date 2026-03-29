<!-- copilot/explanations/temporal/lossless-reports/2026-03-12/home-cards-filters-shortcuts-and-folder-simplification.md -->
# Lossless Change Report — Home Cards, Filters, Clipboard, and Folder Simplification

## 1) Requested scope
1. Ensure card/predefined colors used by element cards have dark-mode variants.
2. Change Home “Crear asignatura” box dark mode style: black background, gray border.
3. Remove folder description field as unnecessary.
4. Hide selected scrollbars where intuitive for cleaner UX.
5. On Ctrl+V subject copy, clear classes/students assignment metadata.
6. Add subject three-dots option to open classes tab (not for students).
7. Fix shared filter behavior so it cannot disable shared items on shared tab; hide that toggle on shared tab.
8. Add a test for the shared-tab filter/toggle behavior.

## 2) Out-of-scope behavior explicitly preserved
- Existing subject/folder CRUD contracts and Firestore collection usage.
- Existing sharing role logic (owner/editor/viewer), shortcut behavior, and delete/unshare action semantics.
- Existing Home view mode routing and non-shared-tab filters/tags workflows.
- Existing keyboard cut/move/undo behavior and clipboard UX text patterns.

## 3) Touched files
- `src/pages/Home/Home.jsx`
- `src/utils/subjectConstants.js`
- `src/components/modules/SubjectCard/SubjectCard.jsx`
- `src/components/modules/SubjectCard/SubjectCardFront.jsx`
- `src/components/modules/ListItems/SubjectListItem.jsx`
- `src/components/modules/ListViewItem.jsx`
- `src/pages/Home/components/HomeContent.jsx`
- `src/pages/Home/components/SharedView.jsx`
- `src/components/modules/FolderCard/useFolderCardLogic.js`
- `src/components/modules/ListItems/FolderListItem.jsx`
- `src/pages/Home/utils/homeKeyboardClipboardUtils.js`
- `src/pages/Home/components/FolderManager.jsx`
- `src/components/modules/FolderCard/FolderCardBody.jsx`
- `src/index.css`
- `src/components/ui/TagFilter.jsx`
- `src/pages/Subject/modals/SubjectFormModal.jsx`
- `tests/unit/pages/home/HomeControls.sharedScopeToggle.test.jsx`
- `copilot/explanations/codebase/src/pages/Home/Home.md`
- `copilot/explanations/codebase/src/pages/Home/components/HomeControls.md`
- `copilot/explanations/codebase/src/pages/Home/utils/homeKeyboardClipboardUtils.md`
- `copilot/explanations/codebase/src/pages/Home/components/FolderManager.md`
- `copilot/explanations/codebase/src/components/modules/SubjectCard/SubjectCardFront.md`
- `copilot/explanations/codebase/src/components/ui/TagFilter.md`

## 4) Per-file verification details

### `src/pages/Home/Home.jsx`
- Added `effectiveSharedScopeSelected` forcing shared-scope filter to enabled in shared tab.
- Added effect to reset shared scope to `true` on shared tab entry.
- Hid shared-scope toggle in shared tab (`hideSharedScopeToggle`).
- Verified shared scope still works outside shared tab.

### `src/utils/subjectConstants.js`
- Added dark variants to predefined `COLORS` values.
- Added `withDarkGradientVariant` helper for legacy gradients lacking `dark:` classes.

### `src/components/modules/SubjectCard/SubjectCard.jsx`
- Normalized subject gradient with dark helper before card shell rendering.
- Passed `onOpenClasses` callback to front face menu.

### `src/components/modules/SubjectCard/SubjectCardFront.jsx`
- Added “Ir a Clases” menu item gated away for students.
- Wired `onOpenClasses(subject)` callback.
- Normalized classic/modern title gradients with dark helper.

### `src/components/modules/ListItems/SubjectListItem.jsx`
- Added list-menu “Ir a Clases” option with non-student gating.
- Normalized list-item gradients with dark helper.

### `src/components/modules/ListViewItem.jsx`
- Passed `onOpenClasses` down to `SubjectListItem`.

### `src/pages/Home/components/HomeContent.jsx`
- Wired subject card and list item `onOpenClasses` to open `SubjectFormModal` on `initialTab: 'classes'`.
- Guarded classes option for student mode.

### `src/pages/Home/components/SharedView.jsx`
- Added `onOpenSubjectClasses` prop.
- Routed subject card/list classes action through that dedicated callback.

### `src/components/modules/FolderCard/useFolderCardLogic.js`
- Normalized folder gradient classes with dark helper.

### `src/components/modules/ListItems/FolderListItem.jsx`
- Normalized folder icon background gradient classes with dark helper.

### `src/pages/Home/utils/homeKeyboardClipboardUtils.js`
- Subject clone payload now clears assignment metadata:
  - `classId: null`
  - `classIds: []`
  - `enrolledStudentUids: []`
- Removed folder clone `description` payload field.

### `src/pages/Home/components/FolderManager.jsx`
- Removed description from form state initialization/edit hydration/new defaults.
- Removed description input from General tab UI.

### `src/components/modules/FolderCard/FolderCardBody.jsx`
- Removed folder description rendering in card body.

### `src/index.css`
- Updated dark create-card style to black background while preserving border color token.
- Added reusable `clean-scrollbar` utility class.

### `src/components/ui/TagFilter.jsx`
- Switched panel scrollbar style to `clean-scrollbar`.

### `src/pages/Subject/modals/SubjectFormModal.jsx`
- Switched form scrolling style to `clean-scrollbar`.

### `tests/unit/pages/home/HomeControls.sharedScopeToggle.test.jsx`
- Added regression coverage for shared-scope toggle visibility:
  - Hidden when `hideSharedScopeToggle=true` (shared-tab context).
  - Visible otherwise.

### Explanation files updated
- Added dated changelog entries for the affected codebase explanation mirrors.

## 5) Risks found + checks
- **Risk:** Shared filter state leaking into shared tab and hiding shared content.
  - **Check:** Forced shared scope on shared tab in Home state and hid toggle in that context; added unit test.
- **Risk:** New menu action appearing for students.
  - **Check:** Explicit role gate (`student` excluded) in subject menu components and student-mode guards in Home content callbacks.
- **Risk:** Legacy color gradients without dark variants remaining unchanged.
  - **Check:** Added helper to append dark variants for legacy strings and used it in card render paths.
- **Risk:** Clipboard copy carrying enrollment assignments.
  - **Check:** Clone payload now explicitly clears class and student assignment metadata.

## 6) Validation summary
- Diagnostics (`get_errors`) on all touched source/test files: **No errors found**.
- Targeted tests: **passed**
  - `tests/unit/pages/home/HomeControls.sharedScopeToggle.test.jsx`
  - `tests/unit/hooks/useHomeKeyboardShortcuts.test.js`
- Full suite: **passed**
  - Test files: `43 passed`
  - Tests: `273 passed`
