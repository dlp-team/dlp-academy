# InstitutionCustomizationMockView.test.jsx

## Overview
- **Source file:** `tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx`
- **Last documented:** 2026-03-30
- **Role:** Unit coverage for the mock customization preview workflow.

## Coverage
- Role preview switching (`vista docente` <-> `vista estudiante`).
- Save callback payload correctness after form edits.
- Palette swatch application path (`previewPaletteApply`) without implicit save.
- Fullscreen toggle + collapsible controls panel interaction.
- Preview tab switching across `Papelera`, `Compartido`, and `Manual` plus topic/resource drilldown assertions.

## Changelog
### 2026-04-03
- Added router-aware rendering harness for shared-tab coverage (`useNavigate` context).
- Added regression tests for fullscreen/collapse controls and new multi-tab/deep-drilldown preview behavior.

### 2026-03-30
- Added initial test suite for mock customization preview behavior.
