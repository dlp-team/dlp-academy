<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/phases/phase-04-customization-preview-parity.md -->
# Phase 04 - Customization Preview Parity

## Status
- IN_PROGRESS

## Objective
Convert Institution Admin customization preview into a true behavioral replica with correct fullscreen layering and instant visual feedback.

## Deliverables
- Fullscreen preview fix:
  - prevent app header overlap,
  - ensure true fullscreen surface and proper z-index hierarchy.
- Real-component parity for previewed surfaces:
  - subjects,
  - topics,
  - documents/quizzes/exams/study-guide content areas,
  - Bin section,
  - real header integration in preview.
- Live theming reflection:
  - color updates apply immediately in preview,
  - active color input highlights affected preview zones with temporary visual indicators.

## Lossless Constraints
- Preserve current customization save/apply semantics.
- Avoid introducing production-only side effects in preview mode.
- Keep preview responsive for desktop/mobile breakpoints.

## Validation Gate
- Side-by-side parity checks between real view and preview for requested surfaces.
- Fullscreen transition tests and overlap checks.
- Color input focus-to-zone highlighting behavior verified.
- Lint/typecheck pass.

## Exit Criteria
- Preview behavior and visual output are reliable replicas of real app surfaces.

## Kickoff Notes (2026-04-05)
- Phase 03 closed with settings/order/automation deliverables completed.
- Phase 04 starts with a low-risk fullscreen layering correction before deeper parity rewiring.

## Progress Log
- 2026-04-05 - Priority update sync before next parity slice
  - Synced user-update directives into active execution order:
    - scrollbar right-edge smoothing + overlay-first fallback-safe behavior,
    - deep cross-page non-modal overlay audit for shared header-to-bottom overlay shell unification.
  - Next customization parity slices resume after these user-update blocks.

- 2026-04-05 - User-update execution blocks completed
  - Scrollbar directive completed (overlay-first + stable fallback behavior shipped).
  - Overlay-scope directive advanced with deep audit + first shared-shell migration slice.
  - Phase 04 parity slices can resume from Block C slice 6.

- 2026-04-05 - Block A completed
  - Fixed fullscreen preview layering so customization preview sits above the global app header:
    - [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx)
    - [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationView.tsx)
  - Added fullscreen z-index regression assertion in:
    - [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block B completed
  - Integrated header parity layer into exact Home preview surface:
    - [src/pages/InstitutionAdminDashboard/components/customization/CustomizationPreviewHeader.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationPreviewHeader.tsx)
    - [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx)
  - Replaced generic preview title strip with header-like shell aligned to production header visual language (institution identity, role indicator, top actions, avatar chip).
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block C in progress (slice 1)
  - Added focused header parity regression coverage for exact preview shell in:
    - [tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx](tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx)
  - Covered deterministic assertions for:
    - fallback institution identity,
    - role-aware subtitle behavior,
    - preview header action and avatar marker rendering.
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block C in progress (slice 2)
  - Extended integration-level parity assertions in:
    - [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Added deterministic checks to ensure exact preview header shell (`Panel docente/estudiante`, `Inicio`) remains aligned with Home content controls (`Manual`, `Cursos`) across role switching.
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block C in progress (slice 3)
  - Hardened topic/resource/bin composition transition assertions in:
    - [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Added deterministic checks for:
    - bin simulated item/actions rendering (`Tecnología`, `Restaurar`, `Eliminar`),
    - subject detail navigation controls (`Volver a asignaturas`),
    - return-to-list behavior after topic resource drilldown (`Mis Asignaturas`).
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block C in progress (slice 4)
  - Implemented layout-mode parity for mock bin rendering in:
    - [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx)
  - Preview bin now mirrors list/grid control state and exposes deterministic list/grid test hooks.
  - Added/extended integration coverage in:
    - [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block C in progress (slice 5)
  - Added deterministic bin empty-state parity assertions in:
    - [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Coverage now verifies no-match search behavior and reset-to-results behavior in preview bin mode.
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block C in progress (slice 6)
  - Added deterministic cross-tab topic drilldown parity assertions in:
    - [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Coverage now verifies:
    - `Uso` tab subject drilldown path,
    - `Cursos` tab drilldown path after expanding year and course collapsible wrappers.
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block C in progress (slice 7)
  - Added shared-tab topic/resource drilldown parity assertions in:
    - [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Coverage now verifies:
    - shared-subject selection path (`Geografía compartida`),
    - shared-topic selection and resource panel rendering (`Guías de estudio`),
    - return-to-shared-list behavior via `Volver a asignaturas`.
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block C in progress (slice 8)
  - Added deterministic nested-folder navigation parity assertions in:
    - [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Coverage now verifies:
    - manual-mode navigation into parent folder (`Planificación semanal`),
    - nested-folder traversal (`Laboratorio`),
    - downstream subject-topic drilldown from nested context (`Ciencias`).
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block C in progress (slice 9)
  - Added deterministic usage-filter parity assertions in:
    - [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Coverage now verifies:
    - `Uso` mode baseline includes non-current subjects,
    - `Alternar filtro de asignaturas vigentes` hides non-current entries while preserving current subjects.
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block C in progress (slice 10)
  - Added deterministic courses-mode current-filter parity assertions in:
    - [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Coverage now verifies:
    - baseline visibility of historical and current academic-year wrappers in `Cursos` mode,
    - `Alternar filtro de asignaturas vigentes` removes non-current academic-year wrappers while preserving current-year wrapper visibility.
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block C in progress (slice 11)
  - Added deterministic academic-year range filter parity assertions in:
    - [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Coverage now verifies:
    - baseline visibility of `2024-2025` wrappers in `Cursos` mode,
    - selecting `2025-2026` in `Año académico` range filter removes `2024-2025` wrappers,
    - `2025-2026` wrappers remain visible after range filter application.
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block C in progress (slice 12)
  - Added role-transition parity guard in:
    - [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx)
  - Preview now exits `Compartido` mode when switching to student role, preventing stale shared-only surface rendering in `Vista estudiante` mode.
  - Added deterministic integration coverage in:
    - [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block C in progress (slice 13)
  - Hardened temporary active-zone highlight behavior in:
    - [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx)
  - Preview now clears active token highlight when focus leaves color-field controls, preserving temporary zone highlighting semantics.
  - Added deterministic integration coverage in:
    - [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block C in progress (slice 14)
  - Added stable viewport-frame hook in:
    - [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx)
  - Added responsive parity assertions for desktop/tablet/mobile preview width transitions in:
    - [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block C in progress (slice 15)
  - Added deterministic invalid-hex fallback parity assertions in:
    - [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Coverage now verifies color input keeps the last valid hex value when an invalid hex token is entered.
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)
