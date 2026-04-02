<!-- copilot/explanations/codebase/src/hooks/useHomeHandlers.md -->

# useHomeHandlers.ts

## Changelog
### 2026-04-02
- Updated `toggleGroup` to accept an optional explicit `currentState` parameter so callers can reliably invert UI sections with non-standard defaults (used by courses groups default-collapsed behavior).

### 2026-04-02
- Updated `handleDelete` subject branch to allow deletion attempts by:
	- owner,
	- global admin,
	- institution admin within the same institution as the subject.
- Replaced silent close on unauthorized non-owner subject delete with explicit modal error messaging (`No tienes permisos para eliminar esta asignatura.`), improving diagnosability of deletion denials.

### 2026-04-01
- `handleSaveSubject` now surfaces the policy-specific teacher-denial message emitted by subject creation guards when institution policy blocks autonomous creation.
- Preserves generic save-failure fallback for all non-policy errors.

## Overview
- **Source file:** `src/hooks/useHomeHandlers.ts`
- **Role:** Home page action orchestration hook for save/delete/share and drag/drop workflows.
