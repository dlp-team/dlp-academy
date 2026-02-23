# Subject Feature Modularization ToDo

## Should Subject Be More Divided?

### Current State
- `Subject.jsx` orchestrates Subject logic, UI, and modals (now lossless refactoring complete).
- `useSubjectManager.js` encapsulates all subject/topic CRUD, reordering, and data logic.
- `useSubjectPageState.js` (NEW) encapsulates all UI state, modal states, search, and computed effects.
- `useTopicGridDnD.js` (NEW) encapsulates all drag/drop handlers for TopicGrid.
- `components/SubjectHeader.jsx` and `components/TopicGrid.jsx` are now focused presentational components.
- Modals are already separated by concern.

### Recommendations for Further Division
- **Status**: Core lossless split opportunities identified and implemented.
- **Future optional work**: Additional micro-splits can be done only if desired for readability, but no required functional split remains.

### ToDo List
1. [x] Review `Subject.jsx` for UI state/handler extraction opportunity.
2. [x] Review `TopicGrid.jsx` for DnD logic extraction.
3. [x] Audit `SubjectHeader.jsx` for further modularization.
4. [x] Review all Subject modals for single-responsibility.
5. [x] Ensure all hooks are single-responsibility and colocated with their feature.
6. [x] Document all changes and update README.

### Completed in this pass (2026-02-18)
- Extracted all UI state/modal logic from `Subject.jsx` into `hooks/useSubjectPageState.js` and wired Subject.jsx to it.
- Extracted drag/drop handlers from `TopicGrid.jsx` into `hooks/useTopicGridDnD.js` and wired TopicGrid.jsx to it.
- Validated with npm lint: Subject folder is lint-clean (no Subject-specific errors).
- All splits are lossless and behavior-preserving.

---
This file tracks modularization opportunities and tasks for the Subject feature. Update as progress is made.
