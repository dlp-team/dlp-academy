<!-- copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/risk-and-assumption-register.md -->
# Risk and Assumption Register

## Assumptions
- Existing Home/Bin components can be reused in customization preview with controlled wrappers.
- Institution settings already have a stable persistence surface that can be extended without destructive migration.
- Current permission utilities can support new users-tab deletion constraints with minimal extension.

## Key Risks
- Modal migration can introduce close-behavior regressions.
- Selection-state unification can affect non-selection rendering branches.
- Drag-and-drop course ordering may conflict with unexpected legacy naming formats.
- Preview parity can increase coupling and render complexity.
- User deletion can create orphaned references if cleanup paths are incomplete.

## Observed Risks from Initial Audit (2026-04-05)
- Global scrollbar compensation currently uses `scrollbar-gutter: stable both-edges` in [src/index.css](src/index.css), which can create visible left-side spacing if not balanced with container strategy.
- Bin grid selected-state presentation is tightly coupled to [src/pages/Home/components/bin/BinSelectionOverlay.tsx](src/pages/Home/components/bin/BinSelectionOverlay.tsx), where backdrop blur and ring styling are currently hardcoded.
- Modal behavior is distributed across multiple feature-local and shared components instead of a single base wrapper, increasing regression risk during unification.
- User detail badge text in [src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx](src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx) still includes emoji markers, requiring UI-icon migration in parallel with past-classes/profile work.
- Settings period defaults are split across `useInstitutionSettings`, `useClassesCourses`, and `CreateCourseModal`; schema consistency checks are required to avoid drift.
- Customization preview currently reuses Home surfaces with deterministic mock data in [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx), so exact parity for deeper content pages may still require additional adapter work.

## Mitigations
- Migrate modal routes incrementally with tests.
- Preserve old selection hooks until parity checks pass.
- Normalize course names and store stable identifiers where possible.
- Use parity checklist and targeted performance checks for preview.
- Define delete preconditions and reference cleanup safeguards.

## Escalation Rule
If a risk cannot be remediated within the phase scope, log it in [copilot/plans/out-of-scope-risk-log.md](copilot/plans/out-of-scope-risk-log.md) with concrete follow-up actions.


