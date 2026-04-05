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
