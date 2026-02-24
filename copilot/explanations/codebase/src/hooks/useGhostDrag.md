# useGhostDrag.js

## Purpose
- **Source file:** `src/hooks/useGhostDrag.js`
- **Last documented:** 2026-02-24
- **Role:** Custom hook providing shared state and business logic.

## File Flow (High Level)
- Receives data/capabilities from imported modules and React ecosystem APIs.
- Defines 4 function(s) that implement the module behavior.
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### useGhostDrag
- **Type:** const arrow
- **Parameters:** `{ item`, `type`, `onDragStart`, `onDragEnd }`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleDragStartWithCustomImage
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleDrag
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleDragEndCustom
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useState()` from `react` is called 1 time(s).
  - `useRef()` from `react` is called 3 time(s).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `useState`, `useRef`

## Example
```jsx
import { useGhostDrag } from '../hooks/useGhostDrag';

function ExampleComponent() {
  const state = useGhostDrag();
  return <pre>{JSON.stringify(state, null, 2)}</pre>;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
