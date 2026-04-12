<!-- copilot/explanations/codebase/src/components/ui/UndoActionToast.md -->
# UndoActionToast.tsx

## Overview
- **Source file:** `src/components/ui/UndoActionToast.tsx`
- **Last documented:** 2026-04-08
- **Role:** Reusable floating undo notification surface used across Home action flows.

## Responsibilities
- Renders bottom-left floating toast for undoable actions using shared shell primitives.
- Shows action CTA (`Deshacer`) and close control (`Cerrar`) when callbacks are provided.
- Supports tone-based styling (`warning`, `success`, `error`) with safe fallback.

## Props
- `message: string` (required)
- `actionLabel?: string`
- `onAction?: () => void`
- `onClose?: () => void`
- `tone?: 'warning' | 'success' | 'error' | string`

## Changelog
- **2026-04-12:** Migrated `UndoActionToast` to `NotificationToast` wrapper with unified visual system, shared icon slot, and lower-left stacking offset.
- **2026-04-08:** Added as centralized undo UI primitive and registered in component registry for reuse in Home keyboard/selection undo flows.
