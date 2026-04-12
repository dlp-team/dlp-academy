<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/customization/ColorField.md -->
# ColorField.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/customization/ColorField.tsx`
- **Last documented:** 2026-04-07
- **Role:** Color token editor row with separate selection and picker interactions.

## Responsibilities
- Displays token label, description, icon, swatch, and hex input.
- Activates token focus/highlight state without forcing color picker open.
- Opens native color picker only from the swatch action.
- Emits controlled color changes through `onChange(token, value)`.

## Changelog
### 2026-04-08
- Hardened interaction boundaries for customization parity:
  - card-body click selects/activates token,
  - swatch click opens native color picker only,
  - hex field supports incremental typing and commits valid values on enter/blur.

### 2026-04-07
- Split interaction semantics:
  - card click selects/focuses token,
  - swatch button click opens native color picker.
- Added stable test identifiers for deterministic unit tests.
