// copilot/explanations/codebase/src/utils/keyShortcutsHandler.md

## Changelog
### 2026-03-09: Initial implementation
- Added `handleKeyShortcut` utility for clipboard and undo actions.
- Supports custom handlers and preserves default browser behavior if not provided.

---

### Overview
`handleKeyShortcut` is a central handler for keyboard shortcut actions (copy, cut, paste, undo). It is used by `useKeyShortcuts` to route events to custom logic or allow native browser actions.

---

### Usage Example
```js
import { handleKeyShortcut } from 'src/utils/keyShortcutsHandler';

handleKeyShortcut('copy', event, customCopyHandler);
```
