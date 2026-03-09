// copilot/explanations/codebase/src/pages/Home/hooks/useHomeKeyboardShortcuts.md

## Changelog
### 2026-03-09: Initial extraction and wire-up
- Added `useHomeKeyboardShortcuts` to centralize Home keyboard actions outside `Home.jsx`.
- Implements Ctrl+C/X/V/Z for focused subject/folder cards.
- Blocks copy/cut for shortcuts (ghost cards) and enforces edit permission.
- Ctrl+C duplicates card metadata only (new ID, no shared recipients).
- Ctrl+X + Ctrl+V moves cards using existing Home confirmation flows.

## Overview
`useHomeKeyboardShortcuts` owns keyboard clipboard state, undo stack, focused-card tracking, and inline feedback text for Home.

## Inputs
- `user`
- `logic` (Home logic object)
- `handleDropOnFolderWrapper`
- `handleNestFolder`

## Outputs
- `handleCardFocus(item, type)`
- `shortcutFeedback`
