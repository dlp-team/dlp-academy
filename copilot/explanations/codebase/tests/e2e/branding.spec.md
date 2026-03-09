// copilot/explanations/codebase/tests/e2e/branding.spec.md

## Changelog
### 2026-03-09: Selector stabilization for customization surface
- Updated branding E2E to:
  - navigate through the `Personalización` tab explicitly,
  - use current UI selectors (`Mi Institución` and `Color Primario` field path),
  - skip gracefully when branding UI is unavailable for current fixture account role.

## Overview
This suite validates institution customization interactions for allowed admin-role users.

## Notes
- Uses role-dependent guards to avoid false negatives with non-admin E2E fixtures.
