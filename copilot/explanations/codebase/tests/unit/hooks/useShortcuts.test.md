// copilot/explanations/codebase/tests/unit/hooks/useShortcuts.test.md

## Changelog
### 2026-04-02: Active-role helper mock compatibility
- Updated `permissionUtils` test mock contract to include `getActiveRole(...)` for hook imports introduced by Phase 07 Slice 03.
- Preserved existing shortcut lifecycle assertions while preventing false failures from missing-export mock shape drift.

### 2026-03-09: Phase 02 realtime and tenant-boundary hardening
- Added realtime synchronization scenarios for shortcut resolution:
  - remote deletion reflected in resolved shortcut state,
  - target removal transitioning shortcut to orphan status.
- Added multi-institution boundary validation:
  - cross-tenant targets resolve as `tenant-mismatch` orphan-safe states.

## Overview
This suite validates `useShortcuts` lifecycle behavior for create/move/delete, orphan cleanup, and resolved shortcut state projection.

## Notes
- Realtime snapshot tests ensure client state converges without manual refresh.
- Tenant-boundary assertions prevent accidental cross-institution resolution leakage.
