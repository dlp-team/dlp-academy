<!-- copilot/explanations/codebase/src/pages/Home/hooks/useHomeKeyboardCoordination.md -->

## [2026-04-08] Undo Registration and Toast API Surface Expansion
### Change
- `useHomeKeyboardCoordination` now forwards undo orchestration primitives from `useHomeKeyboardShortcuts`:
	- `registerUndoAction`
	- `shortcutUndoToast`
	- `undoLatestShortcutAction`
	- `clearShortcutUndoToast`
- This keeps `Home.tsx` integration focused while allowing drag/drop handlers and keyboard flows to share a single undo-notification surface.

# useHomeKeyboardCoordination.ts

## Overview
- **Source file:** `src/pages/Home/hooks/useHomeKeyboardCoordination.ts`
- **Last documented:** 2026-04-01
- **Role:** Lightweight coordination hook that centralizes keyboard-shortcut outputs consumed by Home page rendering.

## Responsibilities
- Calls `useHomeKeyboardShortcuts` with Home context.
- Exposes `handleCardFocus`, `shortcutFeedback`, and `getCardVisualState` as a stable page-level API.
- Keeps keyboard wiring explicit and isolated from Home rendering markup.

## Exports
- `const useHomeKeyboardCoordination`

## Main Dependencies
- `./useHomeKeyboardShortcuts`
