<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.md -->
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
### 2026-04-06
- Stabilized two heavy drilldown tests that were intermittently timing out in full-suite runs.
- Converted the affected scenarios to async assertions using `findBy*` checkpoints after tab/drilldown transitions.
- Added explicit per-test timeout (`12000ms`) only to the two high-interaction cases to avoid full-suite timeout flake under load.

### 2026-04-05
- Added integration parity assertions to confirm exact preview header shell remains aligned with Home content controls across role switching.
- Added deterministic topic/resource/bin transition checks covering bin actions, subject-detail back navigation, and return-to-list behavior after drilldown.
- Added bin layout parity assertions validating list/grid control toggles against preview bin rendering.
- Added deterministic bin search empty-state parity assertions for no-match and reset flows.
- Added cross-tab topic drilldown parity coverage for `Uso` and `Cursos`, including courses-mode year/course wrapper expansion before subject selection.
- Added shared-tab topic/resource drilldown parity coverage for shared subjects, including resource-panel assertions and return-to-shared-list navigation.
- Added nested-folder navigation parity coverage in manual mode, verifying parent/child folder traversal before topic drilldown.
- Added `Uso`-mode current-subject filter parity coverage to validate `Alternar filtro de asignaturas vigentes` behavior against preview fixtures.
- Added `Cursos`-mode current-subject filter parity coverage to validate removal of non-current academic-year wrappers while preserving current-year wrapper visibility.
- Added `Cursos`-mode academic-year range parity coverage to validate `Año académico` filter removes out-of-range wrappers while keeping in-range wrappers visible.
- Added student-role transition parity coverage to validate fallback from `Compartido` mode to manual preview when switching to `Vista estudiante`.
- Added temporary active-zone highlight parity coverage to validate color-focus highlight appears and clears when focus leaves the color field.
- Added responsive viewport parity coverage to validate desktop/tablet/mobile toggles update preview frame width deterministically.
- Added invalid-hex fallback parity coverage to validate color input preserves last valid value when invalid hex text is entered.
- Added live-color reflection parity coverage to validate primary color edits update preview header avatar styling immediately.
- Extended fullscreen regression coverage with explicit stacking-context assertion (`z-[10050]`) to prevent overlap with global fixed header.

### 2026-04-04
- Strengthened fullscreen regression coverage by asserting overlay container layout classes and keyboard `Esc` exit behavior.
- Extended topic drilldown assertions to validate `Archivos` resource rendering in the exact-preview data model.

### 2026-04-03
- Added router-aware rendering harness for shared-tab coverage (`useNavigate` context).
- Added regression tests for fullscreen/collapse controls and new multi-tab/deep-drilldown preview behavior.

### 2026-03-30
- Added initial test suite for mock customization preview behavior.
