## [2026-04-03] Shortcut Bin Lifecycle Support

### Context
- Phase 08 required different deletion outcomes for shortcut actions:
  - orphan shortcut deletion should move to bin,
  - non-owner shared delete should remove shortcut directly after unshare.

### Change
- `deleteShortcut(shortcutId, { moveToBin: true })` now supports soft-delete into shortcut bin state (`status: trashed`, `trashedAt`).
- Added shortcut-bin lifecycle helpers:
  - `getTrashedShortcuts()`
  - `restoreShortcut(shortcutId)`
  - `permanentlyDeleteShortcut(shortcutId)`
- Active Home shortcut stream now filters out trashed shortcuts so bin-routed entries disappear from normal views.

### Impact
- Shortcut deletion flows can now be losslessly routed either to direct removal or recoverable bin state depending on action context.

## [2026-04-02] Active-Role Shortcut Read Context

### Context
- Student-vs-non-student shortcut query branching was still derived from `user.role`.

### Change
- `useShortcuts` now resolves role context using `getActiveRole(user)`.
- Home read readiness and student-only shortcut query filters now follow switched active role context.

### Impact
- Shortcut visibility/filtering remains deterministic for dual-role users after role switching.

## [2026-03-29] Student Shortcut Query Rule-Compatibility Fix

### Context
- Student accounts hit permission-denied errors when listening to `shortcuts` with query `ownerId == uid`.
- Firestore rules intentionally deny folder shortcuts for student role, so an unfiltered owner query can be rejected.

### Change
- Updated `src/hooks/useShortcuts.js` to add `where('targetType', '==', 'subject')` when current user role is `student`.
- Kept existing behavior unchanged for non-student roles.

### Validation
- `get_errors` clean for `src/hooks/useShortcuts.js`.
- Focused tests passed: `tests/unit/hooks/useShortcuts.test.js`.

## [2026-03-07] Home Data Readiness No Longer Requires Country

### Context
- Country is no longer a required registration/profile field.

### Change
- Updated `canReadHomeData` in `src/hooks/useShortcuts.js` to require `role` and `displayName` only.

### Validation
- No type/lint errors on touched files and full unit suite passes.

# useShortcuts.js

## Purpose
- **Source file:** `src/hooks/useShortcuts.js`
- **Last documented:** 2026-02-24
- **Role:** Custom hook providing shared state and business logic.

## File Flow (High Level)
- Receives data/capabilities from imported modules and React ecosystem APIs.
- Defines 7 function(s) that implement the module behavior.
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### useShortcuts
- **Type:** const arrow
- **Parameters:** `user`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### resolveShortcutTargets
- **Type:** const arrow
- **Parameters:** `shortcuts`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### createShortcut
- **Type:** const arrow
- **Parameters:** `targetId`, `targetType`, `parentId = null`, `institutionId = 'default'`, `visualOverrides = {}`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### deleteShortcut
- **Type:** const arrow
- **Parameters:** `shortcutId`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### moveShortcut
- **Type:** const arrow
- **Parameters:** `shortcutId`, `newParentId`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### updateShortcutAppearance
- **Type:** const arrow
- **Parameters:** `shortcutId`, `appearanceData = {}`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### deleteOrphanedShortcuts
- **Type:** const arrow
- **Parameters:** none
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useState()` from `react` is called 3 time(s).
  - `useEffect()` from `react` is called 1 time(s).
  - `canView()` from `../utils/permissionUtils` is called 1 time(s).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `useState`, `useEffect`
- `../firebase/config`: `db`
- `../utils/permissionUtils`: `canView`

## Example
```jsx
import { useShortcuts } from '../hooks/useShortcuts';

function ExampleComponent() {
  const state = useShortcuts();
  return <pre>{JSON.stringify(state, null, 2)}</pre>;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
