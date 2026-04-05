<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/phase-04-preview-parity-kickoff.md -->
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

## Upcoming Block C Scope (Slice 6)
- Expand real-surface parity for topic/resources/bin rendering deltas.
- Add focused parity assertions for requested preview behavior consistency.
