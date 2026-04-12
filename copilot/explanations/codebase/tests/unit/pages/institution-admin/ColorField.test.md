<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/ColorField.test.md -->
# ColorField.test.jsx

## Overview
- **Source file:** `tests/unit/pages/institution-admin/ColorField.test.jsx`
- **Last documented:** 2026-04-07
- **Role:** Verifies card-vs-swatch interaction split in customization color token rows.

## Coverage
- Card click focuses/selects token without opening native color picker.
- Swatch action opens native color picker entrypoint.
- Active-state swatch action still opens native picker when token highlight ping is visible.

## Changelog
### 2026-04-12
- Added active-field swatch-click regression assertion to guarantee picker access in both active and inactive states.

### 2026-04-07
- Added suite for Phase 04 interaction decoupling (`card select` vs `swatch picker`).
