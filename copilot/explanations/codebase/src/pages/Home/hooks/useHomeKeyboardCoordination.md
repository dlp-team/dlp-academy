<!-- copilot/explanations/codebase/src/pages/Home/hooks/useHomeKeyboardCoordination.md -->

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
