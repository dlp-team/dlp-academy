<!-- copilot/explanations/codebase/src/pages/Home/hooks/useHomeBulkSelection.md -->

# useHomeBulkSelection.ts

## Overview
- **Source file:** `src/pages/Home/hooks/useHomeBulkSelection.ts`
- **Last documented:** 2026-04-01
- **Role:** Encapsulates Home manual-view selection state and bulk operations.

## Responsibilities
- Tracks selection mode, selected cards, and selection keys.
- Executes bulk move operations with per-entry success/failure handling.
- Executes bulk delete operations with per-entry success/failure handling.
- Creates a folder from the current selection and moves selected items.
- Resets selection when user mode or view mode no longer supports bulk actions.

## Exports
- `const useHomeBulkSelection`

## Main Dependencies
- `react`
- `../../../utils/permissionUtils`

## Changelog
- **2026-04-03:** Bulk delete now routes orphan shortcuts through shortcut bin soft-delete (`moveToBin`) while preserving direct hard-delete behavior for non-orphan shortcuts and non-shortcut items.

## Notes
- This hook is intentionally focused on selection orchestration only; rendering and feedback presentation remain in `Home.tsx`.
