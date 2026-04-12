# AppToast.tsx

## Purpose
- **Source file:** `src/components/ui/AppToast.tsx`
- **Last documented:** 2026-02-24
- **Role:** UI primitive/reusable presentational component.

## File Flow (High Level)
- Receives data/capabilities from imported modules and React ecosystem APIs.
- Defines 1 function(s) that implement the module behavior.
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### AppToast
- **Type:** const arrow
- **Parameters:** `{ show`, `message`, `onClose }`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- No direct callable imported relations detected (imports may be constants/components/styles).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `React`
- `lucide-react`: `Brain`
- `./NotificationToast`

## Example
```tsx
import AppToast from '../components/ui/AppToast';

function ExampleScreen() {
  return <AppToast />;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.

## Changelog
### 2026-04-12
- Migrated `AppToast` rendering to the shared `NotificationToast` shell.
- Updated toast layout to the unified bottom-left notification style with light/dark adaptation.
- Removed local close-button/icon shell duplication; close behavior remains callback-driven.
