// copilot/explanations/temporal/lossless-reports/2024-04-16/cross-module-persistence-policy-branding-visual.md

## Requested Scope
- Persist dashboard tab state across Home, dashboards, institution settings, and storage permissions
- Add teacher subject assignment/deletion permissions to institution policies
- Fix branding upload permissions and favicon propagation
- Improve subject card visual contrast and passed-state styling
- Make delete failures visible
- Refactor getIconColor utility and update imports for lint hygiene

## Preserved Behaviors
- All existing subject card, dashboard, and institution settings behaviors
- All previous branding upload and favicon propagation logic
- All prior policy enforcement and subject assignment logic
- No changes to unrelated files or features

## Touched Files
- src/hooks/usePersistentState.js
- src/utils/subjectColorUtils.js
- src/components/ui/SubjectIcon.jsx
- src/components/modals/FolderTreeModal.jsx
- src/components/modules/FolderCard/FolderCardBody.jsx
- src/pages/Profile/components/ProfileSubjects.jsx
- src/pages/Subject/components/SubjectHeader.jsx
- src/components/modules/SubjectCard/SubjectCardFront.jsx
- src/components/modules/ListItems/SubjectListItem.jsx
- src/hooks/useSubjects.js

## Per-File Verification
- All touched files pass lint and error checks
- All imports updated to use subjectColorUtils for getIconColor
- Unused imports and variables removed
- No regressions or broken functionality

## Validation Summary
- All targeted and full unit tests pass
- Lint regressions resolved; remaining lint errors are pre-existing and unrelated
- All visible text remains in Spanish, icons used (no emojis)
- File path comments preserved at top of files

## Notes
- Patch errors resolved by aligning file context and applying clean refactors
- Session memory updated with lint status

---
