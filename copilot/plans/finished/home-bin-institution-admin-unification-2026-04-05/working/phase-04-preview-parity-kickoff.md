<!-- copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/phase-04-preview-parity-kickoff.md -->
# Phase 04 Working Note - Preview Parity Kickoff

## Status
- IN_PROGRESS

## Interruption Log
- 2026-04-05: Two user-update priority blocks were executed between Block C slices:
	- scrollbar right-edge behavior refinement,
	- non-modal overlay audit + first shared-shell migration slice.
- Phase 04 parity resumes from Block C slice 6.

## Block Tracking
- Block A (2026-04-05): COMPLETED
- Block B (2026-04-05): COMPLETED
- Block C (2026-04-05): IN_PROGRESS

## Block A Scope (Completed)
- Fix fullscreen customization preview overlap with global fixed header.
- Add deterministic regression assertion for fullscreen stacking context contract.

## Block A Validation Evidence
- `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block B Scope (Completed)
- Integrated header parity shell inside exact Home preview surface.
- Replaced generic preview title strip with header-like composition aligned with production layout intent.
- Preserved role-aware preview identity text and responsive behavior.

## Block B Validation Evidence
- `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block C Progress (Slice 1 Completed)
- Added focused unit coverage for preview header parity behavior.
- New test file: [tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx](tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx).
- Deterministic assertions now cover fallback institution text, role-aware subtitle, and avatar marker output.

## Block C Progress (Slice 2 Completed)
- Extended integration-level parity assertions in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).
- Verified exact preview header shell (`Panel docente/estudiante`, `Inicio`) remains aligned with Home controls (`Manual`, `Cursos`) across role toggles.

## Block C Progress (Slice 3 Completed)
- Hardened topic/resource/bin composition transition checks in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).
- Added deterministic assertions for bin action labels, subject-detail back navigation, and return-to-list behavior after topic drilldown.

## Block C Progress (Slice 4 Completed)
- Implemented layout-aware mock bin rendering in [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx).
- Added list/grid mode parity checks in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).

## Block C Progress (Slice 5 Completed)
- Added deterministic empty-state parity assertions for preview bin search in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).
- Validated no-match fallback and reset-to-results behavior for bin preview composition.

## Block C Progress (Slice 6 Completed)
- Added deterministic cross-tab drilldown parity assertions in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).
- Coverage now validates topic drilldown from `Uso` and `Cursos` tabs, including the collapsed year/course expansion path required by courses-mode wrappers.

## Block C Progress (Slice 7 Completed)
- Added deterministic shared-tab drilldown parity assertions in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).
- Coverage now validates shared-subject topic drilldown/resource rendering and return-to-shared-list behavior.

## Block C Progress (Slice 8 Completed)
- Added deterministic nested-folder navigation parity assertions in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).
- Coverage now validates parent-folder to child-folder traversal before subject-topic drilldown in manual mode.

## Block C Progress (Slice 9 Completed)
- Added deterministic usage-filter parity assertions in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).
- Coverage now validates `Alternar filtro de asignaturas vigentes` behavior in `Uso` mode for current vs non-current subjects.

## Block C Progress (Slice 10 Completed)
- Added deterministic courses-mode current-subject filter parity assertions in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).
- Coverage now validates `Alternar filtro de asignaturas vigentes` behavior in `Cursos` mode for current-year vs non-current year wrappers.

## Block C Progress (Slice 11 Completed)
- Added deterministic courses-mode academic-year range filter parity assertions in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).
- Coverage now validates `Año académico` filter removal of out-of-range wrappers while preserving in-range wrappers.

## Block C Progress (Slice 12 Completed)
- Added student-role transition guard in [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx) to force exit from shared-only preview mode.
- Added deterministic integration test in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx) validating fallback from `Compartido` to manual view when switching to `Vista estudiante`.

## Block C Progress (Slice 13 Completed)
- Hardened temporary active-zone highlighting behavior in [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx).
- Added deterministic integration test in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx) to validate highlight appears on color-field focus and clears after focus leaves.

## Block C Progress (Slice 14 Completed)
- Added stable viewport-frame test hook in [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx).
- Added responsive parity assertions in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx) for desktop/tablet/mobile viewport width transitions.

## Block C Progress (Slice 15 Completed)
- Added deterministic invalid-hex fallback parity assertions in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).
- Coverage now verifies color input preserves last valid hex value when an invalid hex token is entered.

## Block C Progress (Slice 16 Completed)
- Added deterministic live-color reflection parity assertions in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).
- Coverage now verifies primary color edits propagate immediately into preview header avatar styling.

## Block C Validation Evidence (Slice 1)
- `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block C Validation Evidence (Slice 2)
- `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block C Validation Evidence (Slice 3)
- `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block C Validation Evidence (Slice 4)
- `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block C Validation Evidence (Slice 5)
- `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block C Validation Evidence (Slice 6)
- `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block C Validation Evidence (Slice 7)
- `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block C Validation Evidence (Slice 8)
- `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block C Validation Evidence (Slice 9)
- `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block C Validation Evidence (Slice 10)
- `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block C Validation Evidence (Slice 11)
- `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block C Validation Evidence (Slice 12)
- `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block C Validation Evidence (Slice 13)
- `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block C Validation Evidence (Slice 14)
- `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block C Validation Evidence (Slice 15)
- `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block C Validation Evidence (Slice 16)
- `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Upcoming Block C Scope (Slice 17)
- Expand real-surface parity for topic/resources/bin rendering deltas.
- Add focused parity assertions for requested preview behavior consistency.

## Phase Closure
- 2026-04-05: Phase 04 marked as COMPLETED and execution transitioned to Phase 05.


