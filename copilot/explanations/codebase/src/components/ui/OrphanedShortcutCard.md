# OrphanedShortcutCard.jsx

## Purpose
- **Source file:** `src/components/ui/OrphanedShortcutCard.jsx`
- **Last documented:** 2026-02-24
- **Role:** UI primitive/reusable presentational component.

## File Flow (High Level)
- Receives data/capabilities from imported modules and React ecosystem APIs.
- Defines 1 function(s) that implement the module behavior.
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### OrphanedShortcutCard
- **Type:** const arrow
- **Parameters:** `{ 
    shortcut`, `cardScale = 100`, `onDelete`, `layoutMode = 'grid' 
}`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- No direct callable imported relations detected (imports may be constants/components/styles).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `React`
- `lucide-react`: `Trash2`, `Ghost`, `Folder`, `BookOpen`

## Example
```jsx
import OrphanedShortcutCard from '../components/ui/OrphanedShortcutCard';

function ExampleScreen() {
  return <OrphanedShortcutCard />;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
