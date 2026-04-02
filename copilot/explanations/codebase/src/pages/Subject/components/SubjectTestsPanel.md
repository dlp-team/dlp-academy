<!-- copilot/explanations/codebase/src/pages/Subject/components/SubjectTestsPanel.md -->
# SubjectTestsPanel.jsx

## Overview
- **Source file:** `src/pages/Subject/components/SubjectTestsPanel.jsx`
- **Last documented:** 2026-03-30
- **Role:** Subject-level tests management panel with real-time quiz listing, level grouping, and teacher creation entry point.

## Responsibilities
- Subscribes to subject quizzes and groups them by level section (`Basico`, `Intermedio`, `Avanzado`).
- Renders empty, loading, and loaded test states for each section.
- Provides teacher-facing create/edit/open actions.
- Shows inline panel-level feedback when quiz creation or listener operations fail.

## Changelog
### 2026-04-02
- Panel manage permissions now resolve via `getActiveRole(user)` instead of raw role strings.

### 2026-03-30
- Added explicit Firestore snapshot error handling for subject quizzes.
- Listener failures now stop loading and surface inline feedback (`No se pudieron cargar los tests. Intentalo de nuevo.`) instead of leaving the panel blocked in spinner state.
- Listener lifecycle now resets loading/error state deterministically on subject changes.
