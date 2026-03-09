// copilot/explanations/codebase/src/hooks/useKeyShortcuts.md

## Changelog
### 2026-03-09: Initial implementation
- Added `useKeyShortcuts` hook for handling Ctrl+C/X/V/Z globally or in context.
- Integrates with `keyShortcutsHandler` for custom and default actions.
- Unit tests created and validated with Vitest.

---

### Overview
`useKeyShortcuts` provides a lossless, extensible way to handle clipboard and undo shortcuts in DLP Academy. Custom handlers can be passed for copy, cut, paste, and undo, or default browser behavior is preserved.

---

### Usage Example
```js
import { useKeyShortcuts } from 'src/hooks/useKeyShortcuts';

function MyComponent() {
  useKeyShortcuts({
    onCopy: (e) => {/* custom copy logic */},
    onCut: (e) => {/* custom cut logic */},
    onPaste: (e) => {/* custom paste logic */},
    onUndo: (e) => {/* custom undo logic */},
  });
  // ...
}
```
