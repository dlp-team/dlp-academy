<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/README.md -->
# Home, Bin, and Institution Admin Unification Plan

## Problem Statement
The platform needs a coordinated UX and architecture upgrade across Home, Bin, and Institution Admin so behavior is visually consistent, maintainable, and safe for multi-tenant institutions.

## Source Inputs and Priority
- Primary source of truth: [source-original-user-spec-home-bin-institution-admin-unification.md](copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/source-original-user-spec-home-bin-institution-admin-unification.md)
- Secondary structure reference: [source-gemini-structured-reference-home-bin-institution-admin-unification.md](copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/source-gemini-structured-reference-home-bin-institution-admin-unification.md)
- Precedence rule: when conflicts exist, the primary source remains authoritative and secondary content is used only to improve sequencing and clarity.

## Objective
Deliver a lossless, phased implementation that unifies modal architecture and selection UX, improves Bin interactions, expands Institution Admin settings and user governance, and enforces real preview parity for customization.

## Scope
- Global modal unification with shared closing and dirty-state behavior.
- Scrollbar compensation cleanup without introducing layout shifts.
- Right-edge scrollbar surface smoothing with overlay-first behavior where supported and no layout jump fallback where overlay is unavailable.
- Selection mode parity between Home and Bin sections.
- Bin grid/list interaction and action-panel behavior consistency.
- Cross-page non-modal overlay audit and unification for header-to-bottom overlay shells (create/edit/management overlays beyond classic confirm modals).
- Institution Admin settings enhancements:
  - ordinary/extraordinary period defaults,
  - draggable course hierarchy order,
  - automatic-tool feature toggles.
- Institution Admin customization parity:
  - true fullscreen preview,
  - real component parity for subject/topic/content surfaces,
  - live color reflection and active-zone highlighting.
- Institution Admin users tab enhancements:
  - delete users,
  - Firebase Storage profile-photo reliability,
  - icon standardization,
  - teacher/student past-classes sections.
- Test and documentation hardening for all touched flows.

## Out of Scope
- New design system creation beyond requested unification.
- Institution-wide analytics redesign.
- Firebase deploy operations.
- Unrelated route rewrites or backend feature expansion outside the requested surfaces.

## Lifecycle Status
- Lifecycle: active
- Current phase: Phase 04 - Customization Preview Parity (IN_PROGRESS)
- Last updated: 2026-04-05

## Key Decisions and Assumptions
- Multi-tenant boundaries are preserved with institution-scoped reads/writes and least-privilege checks.
- Existing role/permission utilities remain the source of truth for access gating.
- Reuse existing UI primitives/hooks whenever possible; only create new modules when it reduces complexity and duplication.
- Keep visible UI text in Spanish for frontend changes.

## Plan-Level Rollback Strategy
- Apply changes in isolated, phase-scoped commits so rollback can occur per phase.
- Keep feature behavior parity checks at each phase boundary to prevent cumulative regressions.
- Revert to previous component paths if migration to shared primitives introduces regressions.
- For data-shape changes in settings, use backward-compatible defaults and guarded writes.

## Plan-Level Validation Strategy
- Static checks:
  - npm run lint
  - npx tsc --noEmit
- Unit and rules checks:
  - npm run test
  - targeted tests for changed modules before full impacted suite
- UI/behavior checks:
  - modal close/dirty-state scenarios,
  - Bin grid/list action flows,
  - customization preview parity and fullscreen behavior,
  - settings write/read consistency per institution.
- Security checks for touched backend/rules surfaces:
  - least-privilege verification,
  - deny-path coverage where applicable.

## Risks and Mitigations
- Risk: Regression from replacing modal wrappers.
  - Mitigation: staged adapter approach and per-surface migration with tests.
- Risk: Selection/dimming logic divergence across Home/Bin.
  - Mitigation: centralize selection state logic in shared hook/util.
- Risk: Institution settings data inconsistencies.
  - Mitigation: schema guardrails, non-duplicated course normalization, migration-safe defaults.
- Risk: Preview parity drift versus production views.
  - Mitigation: reuse real components and define parity checklist.

## Success Criteria
- Unified modal behavior across configure/edit/create overlays.
- Home and Bin selection visuals align, including dimming of unselected items.
- Bin list mode action area appears directly under selected item with consistent styling.
- Institution admin can configure academic periods, course order, and automatic-tool toggles.
- Preview surfaces render as true functional replicas and update instantly on color changes.
- User view correctly resolves storage avatars, uses icons, and shows past classes for teacher/student.
- Validation gates pass and plan can transition to active/inReview without unresolved critical risks.

## Immediate Next Actions
1. Advance Phase 04 Block C slice 14 with targeted topic/resource/bin parity hardening.
2. Continue low-risk non-modal overlay-shell migrations from the audited priority queue.
3. Keep normal validate -> commit -> push cadence for each major block.
