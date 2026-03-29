# Lossless Change Report - 2026-03-13

## Requested Scope
- Prevent viewer users from modifying class assignment in subject edit flow while still seeing invite code.
- Fix missing shared-user avatars in subject/folder share sections.
- Ensure overlays respect header-safe vertical bounds.
- Add transform transition to header theme toggle.
- Resolve subject-creation permission issues tied to invite-code reservation reads.
- Improve scrollbar dark/light transition and visual simplification.
- Fix paste support in onboarding access-code wizard.
- Address bin loading/firestore error behavior.
- Expand profile role badge mapping to admin/institutionadmin/teacher/student.

## Implemented Changes

### 1) Subject classes permission hardening (viewer read-only)
- `src/pages/Subject/modals/SubjectFormModal.jsx`
  - Introduced `canAccessClassesTab` and `canModifyClassAssignments` separation.
  - Kept `Clases` tab visible for access roles, but blocked class assignment controls/actions for viewer-level shortcut users.
  - Preserved invite-code visibility/copy for read-only viewers.

### 2) Shared avatar field normalization
- `src/pages/Subject/modals/SubjectFormModal.jsx`
- `src/pages/Home/components/FolderManager.jsx`
  - Expanded avatar key resolution to include `profilePicture*`, `avatarURL`, `imageUrl/imageURL`, `photo`, and nested `user.*` variants.
  - Expanded owner avatar fallback fields.

### 3) Overlay header-safe positioning
- `src/pages/Home/modals/EditSubjectModal.jsx`
- `src/pages/Home/modals/SubjectModal.jsx`
- `src/pages/Subject/modals/TopicFormModal.jsx`
- `src/pages/Subject/modals/EditTopicModal.jsx`
- `src/pages/Subject/modals/SubjectTopicModal.jsx`
  - Applied `OVERLAY_TOP_OFFSET_STYLE` + `fixed inset-x-0 bottom-0` wrapper pattern.

### 4) Theme toggle transform transition
- `src/components/ui/Toggle.jsx`
  - Added explicit transform transition timing and easing on knob.

### 5) Subject creation permission path
- `firestore.rules`
  - Updated `subjectInviteCodes` read rule to allow missing-document existence checks for same-institution keys (non-student), enabling invite-code collision checks inside transactions.

### 6) Scrollbar visual + theme transition behavior
- `src/index.css`
  - Made track/corner/buttons transparent/hidden.
  - Kept only thumb visible with smooth theme-responsive gradients.

### 7) Onboarding Ctrl+V handling
- `src/pages/Onboarding/components/OnboardingWizard.jsx`
  - Added controlled `accessCode` state.
  - Added explicit `onPaste` handling with normalization to uppercase.

### 8) Bin loading stabilization
- `src/pages/Home/components/BinView.jsx`
  - Removed unstable effect dependency pattern causing repeated reload loops.
  - Stopped automatic expired-item permanent deletion in read path to reduce permission-noise on entry.

### 9) Profile role badge coverage
- `src/pages/Profile/components/UserCard.jsx`
  - Added role mapping and badge rendering for `admin`, `institutionadmin`, `teacher`, and `student`.

### 10) Card multi-select workflow for bulk actions
- `src/pages/Home/Home.jsx`
- `src/pages/Home/components/HomeContent.jsx`
  - Added `Modo selección` UI in Home manual view with bulk actions:
    - delete selected,
    - move selection to existing folder or root,
    - create new folder and move selected elements inside.
  - In select mode, card/list clicks toggle selection instead of opening navigation.
  - Disabled drag and drop while selection mode is active.

### 11) Shared shortcut delayed visibility
- `src/hooks/useSubjects.js`
  - Changed subject state update strategy to render list immediately with cached/empty topics, then hydrate topics asynchronously.
  - This removes topic-fetch blocking from initial subject visibility, improving shared shortcut first paint.

## Preserved Behaviors
- Existing share/unshare flows and owner guards remain intact.
- Invite code visibility in classes tab remains available.
- Existing modal interaction patterns and close/backdrop semantics preserved.
- Existing bin restore/permanent-delete actions preserved.

## Validation Summary
- Ran `get_errors` on all touched files and `firestore.rules`.
- Result: no reported errors in modified files.

## Documentation Updates
- Updated codebase explanation changelogs:
  - `copilot/explanations/codebase/src/pages/Subject/modals/SubjectFormModal.md`
  - `copilot/explanations/codebase/src/pages/Home/components/FolderManager.md`
  - `copilot/explanations/codebase/src/components/ui/Toggle.md`
  - `copilot/explanations/codebase/src/pages/Profile/components/UserCard.md`
  - `copilot/explanations/codebase/src/pages/Home/components/BinView.md`
  - `copilot/explanations/codebase/src/pages/Home/Home.md`
  - `copilot/explanations/codebase/src/pages/Home/components/HomeContent.md`
  - `copilot/explanations/codebase/src/pages/Home/components/HomeSelectionToolbar.md`
  - `copilot/explanations/codebase/src/hooks/useSubjects.md`
