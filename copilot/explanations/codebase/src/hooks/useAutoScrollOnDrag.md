# useAutoScrollOnDrag.js

## Purpose
- **Source file:** `src/hooks/useAutoScrollOnDrag.js`
- **Last documented:** 2026-02-24
- **Role:** Custom hook providing shared state and business logic.

## File Flow (High Level)
- Receives data/capabilities from imported modules and React ecosystem APIs.
- Defines 8 function(s) that implement the module behavior.
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### getWindowScrollMax
- **Type:** const arrow
- **Parameters:** none
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### getBounds
- **Type:** const arrow
- **Parameters:** `boundsTarget`, `scrollContainer`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### useAutoScrollOnDrag
- **Type:** const arrow
- **Parameters:** `{
    containerRef`, `enabled = true`, `edgeThreshold = 80`, `maxSpeed = 18`, `scrollContainer = 'element'
} = {}`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### onDragStart
- **Type:** const arrow
- **Parameters:** none
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### onDragEnd
- **Type:** const arrow
- **Parameters:** none
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### onDragOver
- **Type:** const arrow
- **Parameters:** `event`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### onUpdateCoordinates
- **Type:** const arrow
- **Parameters:** `event`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### tick
- **Type:** const arrow
- **Parameters:** none
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useEffect()` from `react` is called 1 time(s).
  - `useRef()` from `react` is called 3 time(s).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `useEffect`, `useRef`

## Example
```js
// Import this module from: src/hooks/useAutoScrollOnDrag.js
// Use its exported functions/components where needed in shared flows.
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
