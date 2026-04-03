<!-- copilot/plans/active/original-plan-autopilot-execution-2026-04-03/README.md -->
# Original Plan Autopilot Execution (2026-04-03)

## Problem Statement
Execute the full scope defined in `copilot/plans/ORIGINAL_PLAN.md` as the authoritative source, using Gemini's structured rewrite only as a readability aid and never as a replacement. The work includes governance rules, cross-dashboard UX updates, auth enhancements, institution-admin customization preview expansion, permission/deletion bug fixes, scrollbar integration, and real E2E validation.

## Scope
- Build and execute a comprehensive, dependency-aware implementation plan from the original prompt.
- Update Copilot governance files to enforce regular Git commit/push logging at logical intervals.
- Redesign and unify Selection Mode UX in Home and Bin; add multi-select support in Bin.
- Implement Settings auth flow for password setup from Google-auth users with verification, plus Remember Me.
- Add pagination across dashboards with potentially large user/institution lists.
- Reposition Institution Admin Users search bar and remove tab-strip scrollbar.
- Perform architecture audit and implement Customization Preview 2.0 for near 1:1 web replica with deep mock navigation.
- Implement global scrollbar styling variants and no-layout-shift integration.
- Fix element deletion edge cases (ghost shortcuts, non-owner shared deletion bypassing bin).
- Debug and fix false "subject not saved" background error/toast behavior.
- Add and execute real E2E coverage using `.env` variables and other available E2E envs.
- Keep documentation synchronized (plan lifecycle, explanations, temporal lossless report).

## Non-Goals
- Production deployment (`firebase deploy`, hosting deploy, or rules deploy).
- Unrequested visual redesign outside specified sections.
- Broad architecture refactors not required for requested outcomes.
- Relaxing access-control or multi-tenant safeguards to force tests green.

## Status Summary
- Current state: `ACTIVE`
- Current phase: Phase 10 closure complete; pending lifecycle transition review
- Previous phases completed: Phase 01, Phase 02, Phase 03, Phase 04, Phase 05, Phase 06, Phase 07, Phase 08, Phase 09, Phase 10

## Key Decisions
- `ORIGINAL_PLAN.md` is the source of truth for requirement completeness.
- Gemini output is used as structural aid only and is cross-checked against original requirements.
- Work executes in dependency order to minimize rework and regressions.
- Preview 2.0 implementation requires explicit architecture audit before coding deep replica behavior.
- All changes follow lossless-change protocol with explicit preserved-behavior tracking.

## Assumptions
- Existing auth architecture can support provider-linking and verified password setup flow.
- Dashboard listing patterns are sufficiently reusable for centralized pagination helpers.
- Current customization preview already has a mock-data substrate that can be extended.
- E2E test credentials and IDs are available via local `.env` and can run in local/dev environment.

## Security and Risk Controls
- Preserve multi-tenant scoping by `institutionId` in all affected read/write paths.
- Maintain least privilege for permission checks and shared deletion behavior.
- Avoid hidden behavior removals in selection, deletion, and modal-save flows.
- Use deterministic E2E selectors and state assertions, avoiding timing-only fixes.
- Run `get_errors` on touched files and impacted tests before phase closure.

## Out-of-Scope Behavior Explicitly Preserved
- Existing role and institution access model unless explicitly adjusted by requested behavior.
- Existing dashboard data semantics and filtering logic, except added pagination and requested layout moves.
- Existing Home/Bin item models and ownership semantics, except specific deletion edge-case fixes.
- Existing theming model and branding tokens, except preview behavior and requested scrollbar integration.

## Deliverables
- Protocol-compliant plan package with detailed phases, subplans, working docs, and reviewing checklists.
- Incremental implementation with validation evidence.
- Temporal lossless reports and synchronized codebase explanations for all touched areas.
