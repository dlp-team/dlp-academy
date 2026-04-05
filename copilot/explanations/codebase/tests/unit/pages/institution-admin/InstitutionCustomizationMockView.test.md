# InstitutionCustomizationMockView.test.jsx

## Overview
- **Source file:** `tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx`
- **Last documented:** 2026-04-05
- **Role:** Unit coverage for the mock customization preview workflow.

## Coverage
- Role preview switching (`vista docente` <-> `vista estudiante`).
- Save callback payload correctness after form edits.
- Palette swatch application path (`previewPaletteApply`) without implicit save.
- Fullscreen toggle + collapsible controls panel interaction.
- Preview tab switching across `Papelera`, `Compartido`, and `Manual` plus topic/resource drilldown assertions.

## Changelog
### 2026-04-05
- Added integration parity assertions to confirm exact preview header shell remains aligned with Home content controls across role switching.
- Added deterministic topic/resource/bin transition checks covering bin actions, subject-detail back navigation, and return-to-list behavior after drilldown.
- Added bin layout parity assertions validating list/grid control toggles against preview bin rendering.
- Added deterministic bin search empty-state parity assertions for no-match and reset flows.
- Extended fullscreen regression coverage with explicit stacking-context assertion (`z-[10050]`) to prevent overlap with global fixed header.

### 2026-04-04
- Strengthened fullscreen regression coverage by asserting overlay container layout classes and keyboard `Esc` exit behavior.
- Extended topic drilldown assertions to validate `Archivos` resource rendering in the exact-preview data model.

### 2026-04-03
- Added router-aware rendering harness for shared-tab coverage (`useNavigate` context).
- Added regression tests for fullscreen/collapse controls and new multi-tab/deep-drilldown preview behavior.

### 2026-03-30
- Added initial test suite for mock customization preview behavior.
