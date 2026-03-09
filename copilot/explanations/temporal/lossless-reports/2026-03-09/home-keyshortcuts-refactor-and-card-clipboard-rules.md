// copilot/explanations/temporal/lossless-reports/2026-03-09/home-keyshortcuts-refactor-and-card-clipboard-rules.md

## Requested Scope
1. Do not keep keyboard implementation inside `Home.jsx`; move it to Home hooks/utils.
2. Fix runtime error: `Cannot access 'handleNestFolder' before initialization`.
3. Enforce clipboard semantics:
- Copy works on subject/folder cards only (not shortcuts).
- Copy creates a new card with a new ID on paste (no recipient sharing).
- Folder copy duplicates only folder card metadata, not nested subjects.
- Cut/paste behaves as move and uses existing confirmation flows.

## Implemented
- Extracted keyboard behavior to `src/pages/Home/hooks/useHomeKeyboardShortcuts.js`.
- Added clone-payload helpers in `src/pages/Home/utils/homeKeyboardClipboardUtils.js`.
- `Home.jsx` now wires the hook and remains orchestration-focused.
- Added focus callbacks from Home content/list cards so shortcuts target the active card.
- Reused `handleDropOnFolderWrapper`/`handleNestFolder` for Ctrl+X/Ctrl+V moves.

## Preserved Behaviors
- Shared-subject shortcut system remains unchanged.
- Existing DnD and role-gate logic remains in existing Home handlers.
- Typing fields preserve native clipboard/undo behavior.

## Validation
- `get_errors`: clean for all touched files.
- Unit tests executed:
  - `tests/unit/hooks/useKeyShortcuts.test.js`
  - `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - `tests/unit/hooks/useHomeHandlers.shortcuts.test.js`
- Result: all executed tests passed.
