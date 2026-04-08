<!-- copilot/explanations/codebase/src/pages/Subject/Subject.md -->
# Subject.jsx

## Overview
- **Source file:** `src/pages/Subject/Subject.jsx`
- **Last documented:** 2026-03-30
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Handles user events and triggers updates/actions.
- Participates in navigation/routing behavior.

## Exports
- `default Subject`

## Main Dependencies
- `react`
- `react-router-dom`
- `lucide-react`
- `./hooks/useSubjectManager`
- `./hooks/useSubjectPageState`
- `../../components/layout/Header`
- `./components/SubjectHeader`
- `./components/TopicGrid`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
### 2026-04-08
- Added bin-origin read-only mode parsing (`?mode=readonly`) in `Subject.jsx`.
- In read-only mode, subject-level mutating actions are disabled while topic navigation remains available.
- Topic navigation now propagates read-only query context (`?mode=readonly&source=bin`) to preserve mutation guard on Topic page.

### 2026-04-02
- Subject page teacher-vs-student UI gating now resolves from `getActiveRole(user)` for dual-role switched sessions.

### 2026-03-30
- Replaced topic deletion browser confirm dialog with an in-page confirmation modal in `Subject.jsx`.
- Topic delete flow now requires explicit modal confirmation and includes safe cancel behavior without side effects.
