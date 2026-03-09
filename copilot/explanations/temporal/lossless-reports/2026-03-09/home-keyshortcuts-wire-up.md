// copilot/explanations/temporal/lossless-reports/2026-03-09/home-keyshortcuts-wire-up.md

## Requested Scope
Wire up the new Ctrl+C/X/V/Z infrastructure to real Home behavior and update the plan/docs.

## Implemented Behavior
- Ctrl+C (`Home` context): Copies the currently opened folder as a clipboard reference.
- Ctrl+X (`Home` context): Cuts the currently opened folder (permission-gated) for move-on-paste.
- Ctrl+V (`Home` context):
  - If clipboard mode is `copy`: creates or repositions a folder shortcut in the current folder context.
  - If clipboard mode is `cut`: moves the source folder into the current folder context.
- Ctrl+Z (`Home` context): Reverts the latest keyboard-applied folder action from the local undo stack.
- Typing safety: shortcuts do not hijack behavior inside `input`, `textarea`, `select`, or contenteditable fields.
- UX feedback: Spanish inline status text is shown near Home controls (no alerts).

## Preserved Behaviors
- Existing shared-subject shortcut hook (`useShortcuts`) remains untouched.
- Native browser shortcuts remain available when custom handlers return `false`.
- Existing Home DnD and role-gate behavior unchanged.

## Touched Files
- src/pages/Home/Home.jsx
- src/utils/keyShortcutsHandler.js
- tests/unit/utils/keyShortcutsHandler.test.js
- copilot/explanations/codebase/src/pages/Home/Home.md
- copilot/explanations/codebase/src/utils/keyShortcutsHandler.md

## Validation
- `get_errors` on all touched code files: no errors.
- Focused tests passed:
  - `tests/unit/hooks/useKeyShortcuts.test.js`
  - `tests/unit/utils/keyShortcutsHandler.test.js`
  - `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - `tests/unit/hooks/useHomeHandlers.shortcuts.test.js`
- Result: 4 files / 48 tests passed.
