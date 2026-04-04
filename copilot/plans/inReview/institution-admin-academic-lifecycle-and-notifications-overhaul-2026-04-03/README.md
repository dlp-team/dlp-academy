<!-- copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/README.md -->
# Institution Admin Academic Lifecycle and Notifications Overhaul (2026-04-03)

## Problem Statement
Execute the institutional roadmap described by the user in the original plan prompt, with `ORIGINAL_PLAN.md` as the authoritative source of truth and `GEMINI_PLAN.md` as a secondary readability aid only.

## Source Priority
- Primary source: user-authored requirement file relocated into this plan folder as `source-original-user-spec-institution-admin-academic-lifecycle.md`.
- Secondary source: Gemini-structured rewrite relocated into this plan folder as `source-gemini-structured-reference-institution-admin-academic-lifecycle.md`.
- Conflict rule: if wording differs, the primary source always wins.

## Scope
- Institution Admin courses/classes grouped by academic year with collapsible groups and year-range filter.
- Course/class naming and assignment clarity by including academic year in visible labels.
- Enforce class academic year linkage to course academic year (immutable at class level).
- Subject class assignment constrained to classes in the same academic year.
- New Institution Admin settings/configuration section for academic calendar controls.
- Ordinary and extraordinary period timelines plus trimester/cuatrimester/custom period model.
- Institution-level calendar windows remain the default baseline while each course can define per-period start/end timelines for trimester/cuatrimester/custom periods.
- Mandatory subject period metadata on creation and lifecycle-based visibility transitions.
- Home filtering by academic period.
- Course-finish policy controls for deletion/retention/access behavior.
- Move existing teacher-governance toggles from users tab into settings.
- Student-to-course linking model (CSV/manual), plus transfer/promote architecture and lifecycle safeguards.
- New-course visibility controls and enrollment transfer constraints.
- Customization preview full-screen bug fix and high-fidelity preview parity.
- Notifications bell toggle fix, dedicated notifications route, TTL cleanup policy, and email sync opt-in.
- Language strategy audit for Spanish-first product and multi-language roadmap decision.
- Bin selection mode consistency with manual mode, visual dimming behavior, and urgency sort label renames.

## Out of Scope
- Production deployment commands.
- Broad redesign outside requested UX adjustments.
- Multi-tenant scope relaxations or permission broadening.
- Unrequested schema rewrites that are not directly tied to this roadmap.

## Lifecycle Status
- Lifecycle: `finished`
- Current phase: `All roadmap phases completed and review checklist satisfied`
- Last updated: 2026-04-04

## Key Decisions
- This plan starts directly in `active` because execution begins immediately in this same session.
- Execution order prioritizes architectural audits before high-risk data-model and lifecycle automation changes.
- Existing utilities/components already present in the codebase (academic-year and notifications foundations) must be reused where possible.
- Changes will remain lossless and traceable with per-phase verification and temporal reports.
- Plan governance now enforces a final dedicated optimization phase and mandatory `Pending -> Processed` user-update logging before each implementation block.
- Operational docs/logs must use clickable Markdown file references (`[path](path#Lx)`) for Ctrl+Click navigation.
- `inReview` now enforces two mandatory review subphases: (1) optimization/consolidation and (2) deep risk analysis, with out-of-scope findings logged in `copilot/plans/out-of-scope-risk-log.md`.

## Success Criteria
- All requirements from the original user-authored source are represented in phased scope without omission.
- Phase status in `strategy-roadmap.md` stays synchronized with phase files.
- Required audit artifacts are created before related implementation phases.
- Validation gates and rollback strategy are explicit before entering execution-heavy phases.

## Deliverables
- Protocol-compliant plan package (`README`, roadmap, phases, reviewing checklist, subplans, working docs).
- Initial phase-one artifacts: dependency map, course lifecycle summary/deep dive, and language strategy audit.
- Implementation-ready phase sequencing that preserves multi-tenant and least-privilege safety.
