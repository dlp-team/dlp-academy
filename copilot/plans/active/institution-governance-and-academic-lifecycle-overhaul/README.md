<!-- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/README.md -->

# Institution Governance and Academic Lifecycle Overhaul

## Problem Statement
The platform has intertwined gaps across permissions, deletion lifecycle, institution administration UX, academic-year governance, and dual-role account behavior. These gaps are currently causing blocked core operations (teacher subject creation, institution icon upload), inconsistent deletion outcomes, missing governance controls, and high operational risk for large institutions.

## Source of Truth
- Primary source: `copilot/plans/ORIGINAL_INSTRUCTIONS_OF_NEW_PLAN.md`
- Supplemental structured source: user-provided optimized prompt in chat
- If conflicts appear, prioritize the primary source above.

## Objective
Deliver a lossless, phased, security-first overhaul that resolves all requested areas end-to-end while preserving existing non-requested behavior.

## Scope
1. Firestore permission recovery for subject creation and role-appropriate subject deletion.
2. Storage permission recovery for institution branding icon upload.
3. Bin-first deletion architecture for folders/courses/classes and consistency with existing subject bin flow.
4. Institution Admin Dashboard upgrades: exact-app customization preview approach, pagination, policy enforcement hardening.
5. Academic year governance model and UX overhaul across courses/classes and course tab presentation.
6. Home and Admin UX upgrades: selection mode polish, bin ordering/bulk actions, animation fix, institution row navigation.
7. Role model audit and implementation for institution admin + teacher coexistence.
8. Deterministic validation, lossless reports, and documentation synchronization.

## Non-Goals
- Production deployment from agent session.
- Unrelated schema rewrites outside requested flows.
- Broad UI redesign beyond requested UX behavior.

## Security and Multi-Tenant Guardrails
- Preserve strict `institutionId` tenant isolation.
- Apply least-privilege rule changes only.
- Add deny-path checks when changing access controls.
- Do not widen access globally to pass tests.

## Lifecycle Status
- Lifecycle: `active`
- Current phase: `Phase 08 completed (all validation gates green; plan is ready for lifecycle transition to inReview)`
- Overall progress: `99%`

## Key Decisions to Record During Execution
1. Exact approach for institution customization preview (component reuse + mock provider vs account simulation path).
2. Canonical academic year ownership (course-level primary source with subject derivation).
3. End-of-year state determination strategy and visibility model per role.
4. Dual-role model (single identity with role switcher vs segregated identities).

## Deliverables
1. Fully synchronized plan package with phase-level evidence.
2. Implemented code changes with tests for critical behavior.
3. Temporal lossless reports under `copilot/explanations/temporal/lossless-reports/2026-04-02/`.
4. Updated codebase explanations for touched files.
5. Review checklist completed before moving to `finished`.

## Exit Criteria
- All requested behaviors implemented and validated.
- No new errors in touched files from `get_errors`.
- Targeted and impacted tests pass.
- Plan state moved through `active` -> `inReview` -> `finished` with synchronized artifacts.

