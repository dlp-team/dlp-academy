// copilot/plans/todo/keyboard-shortcuts-clipboard-undo/phases/phase-05-wire-up.md

# Phase 05: Wire Up Shortcuts to Features

## Objectives
- Integrate `useKeyShortcuts` into relevant components (e.g., resource panels, folder lists, editors).
- Define and implement custom handlers for Ctrl+C/X/V/Z based on app context:
  - Copy: Select and copy resource/folder/topic
  - Cut: Remove and copy resource/folder/topic
  - Paste: Insert copied item into current context
  - Undo: Revert last action (deletion, move, etc.)
- Ensure role/permission checks for each action
- Display Spanish info text near affected elements (no alerts)
- Validate lossless behavior: browser default preserved if no handler

## Steps
1. Identify target components for shortcut integration
2. Add `useKeyShortcuts` with custom handlers in each
3. Implement handler logic for each action
4. Test in-app for all shortcut scenarios
5. Update documentation and lossless report
