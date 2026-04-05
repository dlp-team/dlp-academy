<!-- copilot/explanations/codebase/tests/unit/pages/subject/SubjectFormModal.closeGuard.test.md -->
# SubjectFormModal.closeGuard.test.jsx

## Overview
- Source file: tests/unit/pages/subject/SubjectFormModal.closeGuard.test.jsx
- Last documented: 2026-04-05
- Role: Protect create-flow close behavior in SubjectFormModal so outside-click close requires confirmation when unsaved form data exists.

## Coverage
- Verifies outside click closes immediately when create form has no unsaved changes.
- Verifies outside click is blocked after create-form edits.
- Verifies discard confirmation text is shown for unsaved general-form changes.
- Verifies confirm discard action closes the modal.

## Notes
- Uses deterministic mock BasicInfoFields input to mutate modal form state without relying on full UI field tree.
- Keeps focus on close-guard contract, not course/share/class flows already covered elsewhere.

## Changelog
### 2026-04-05
- Added initial regression suite for create-flow outside-close discard confirmation in SubjectFormModal.
