<!-- copilot/explanations/codebase/src/hooks/useHomeHandlers.md -->

# useHomeHandlers.ts

## Changelog
### 2026-04-01
- `handleSaveSubject` now surfaces the policy-specific teacher-denial message emitted by subject creation guards when institution policy blocks autonomous creation.
- Preserves generic save-failure fallback for all non-policy errors.

## Overview
- **Source file:** `src/hooks/useHomeHandlers.ts`
- **Role:** Home page action orchestration hook for save/delete/share and drag/drop workflows.
