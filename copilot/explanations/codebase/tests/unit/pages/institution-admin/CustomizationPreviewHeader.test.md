<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.md -->
# CustomizationPreviewHeader.test.jsx

## Overview
- **Source file:** `tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx`
- **Last documented:** 2026-04-05
- **Role:** Deterministic unit coverage for preview-header parity behavior used by customization exact preview.

## Coverage
- Fallback institution identity rendering (`Tu Institución`) when no institution name is provided.
- Teacher context rendering (`Panel docente`) and preview header action visibility (`Inicio`).
- Student context rendering (`Panel estudiante`) with student avatar marker output.
- Admin context rendering (`Panel de administración`) with admin action label and avatar marker output.
- Label and role assertions designed to remain stable independent of icon SVG internals.

## Changelog
### 2026-04-12
- Added admin parity assertions for subtitle, action label, and avatar initial (`A`).

### 2026-04-05
- Added initial focused regression suite for Phase 04 Block C parity hardening.
