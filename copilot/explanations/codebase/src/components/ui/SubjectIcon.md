# SubjectIcon.jsx

## Purpose
- **Source file:** `src/components/ui/SubjectIcon.jsx`
- **Last documented:** 2026-02-24
- **Role:** UI primitive/reusable presentational component.

## File Flow (High Level)
- Receives data/capabilities from imported modules and React ecosystem APIs.
- Defines 2 function(s) that implement the module behavior.
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### SubjectIcon
- **Type:** const arrow
- **Parameters:** `{ iconName`, `className = "w-6 h-6"`, `...props }`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### getIconColor
- **Type:** const arrow
- **Parameters:** `gradientString`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- No direct callable imported relations detected (imports may be constants/components/styles).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `React`
- `../../utils/subjectConstants`: `ICON_MAP`
- `lucide-react`: `BookOpen`

## Example
```jsx
import SubjectIcon from '../components/ui/SubjectIcon';

function ExampleScreen() {
  return <SubjectIcon />;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
