<!-- copilot/explanations/codebase/src/pages/Subject/modals/SubjectTopicModal.md -->
# SubjectTopicModal.jsx

## Overview
- **Source file:** `src/pages/Subject/modals/SubjectTopicModal.jsx`
- **Last documented:** 2026-03-30
- **Role:** Modal/dialog UI used for create, edit, confirm, or detail flows.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.

## Exports
- `default SubjectTopicsModal`

## Main Dependencies
- `react`
- `lucide-react`
- `firebase/firestore`
- `../../../firebase/config`
- `../../../components/ui/SubjectIcon`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
### 2026-03-30
- Added inline snapshot error feedback state (`loadError`) for topic-list listener failures.
- Snapshot failure path now clears stale topic rows and renders visible in-modal feedback (`No se pudieron cargar los temas. Intentalo de nuevo.`).
- Added focused regression coverage in `tests/unit/pages/subject/SubjectTopicModal.snapshotError.test.jsx` for success and error listener paths.
