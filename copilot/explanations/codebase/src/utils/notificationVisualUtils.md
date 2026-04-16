<!-- copilot/explanations/codebase/src/utils/notificationVisualUtils.md -->
# notificationVisualUtils.ts

## Overview
- **Source file:** `src/utils/notificationVisualUtils.ts`
- **Last documented:** 2026-04-09
- **Role:** Centralized notification visual mapping utility for icon/tone class consistency across toast, dropdown, and history views.

## Responsibilities
- Resolve normalized notification visual kind from raw notification `type` and optional override `variant`.
- Provide reusable class-token bundles for icon container/color, unread background, and toast surface/border.
- Keep notification presentation logic centralized to avoid style drift across multiple components.

## Exports
- `resolveNotificationVisualKind({ type, variant })`
- `getNotificationVisualClasses(kind)`

## Notes
- Supports explicit variants (`info`, `share`, `assignment`, `shortcut`, `success`, `warning`, `error`).
- Falls back safely to `info` for unknown values.
