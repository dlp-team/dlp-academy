<!-- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/phases/phase-05-academic-year-governance-and-courses-ux-overhaul.md -->

# Phase 05 - Academic Year Governance and Courses UX Overhaul

## Status
- IN_PROGRESS

## Objective
Establish a deterministic academic-year model with mandatory format controls and role-aware lifecycle visibility across courses and subject presentation.

## Scope
1. Enforce mandatory `YYYY-YYYY` academic year format in classes/courses forms.
2. Auto-fill academic year from current month rule:
   - Jul-Dec: currentYear-currentYear+1,
   - Jan-Jun: previousYear-currentYear.
3. Calendar-like academic year picker with range `-20` to `+10` years and selectable values.
4. Decide and implement ownership model (course-owned academic year, subject derived).
5. Ended-subject visibility and role-based indicators (teacher yellow, student grade-dependent red-green).
6. Remove history tab and send-to-history option.
7. Courses tab year filter next to Filtrar with persisted user selection.
8. Multi-year layout behavior with nested collapsibles (collapsed by default).

## Files Expected
- `src/pages/InstitutionAdminDashboard/components/classes-courses/**`
- `src/pages/InstitutionAdminDashboard/modals/**`
- `src/pages/Home/Home.jsx`
- `src/pages/Home/hooks/useHomeState.ts`
- `src/pages/Home/components/HomeControls.jsx`
- `src/components/modules/**`

## Risks
- Incorrect year ownership causing query fragmentation.
- Complex collapsible state causing UX regressions.

## Validation Gate
- Year format enforcement and picker behavior verified.
- Persistence works across reloads.
- Single-year and multi-year layouts behave as specified.
- History pathways removed without side effects.

## Rollback
- Keep migration-compatible fallbacks for legacy course records without academic year.

## Completion Notes
- 2026-04-02 (Slice 01 complete):
   - Added strict academic-year utility baseline (`YYYY-YYYY` consecutive validation, Jul-Dec/Jan-Jun default, range builder).
   - Added reusable academic-year picker and wired it into course creation/detail editing flows.
   - Enforced course-owned academic-year model with class derivation in create/edit/hook write paths.
   - Added deterministic tests for utility logic and class/course modal behavior.
- 2026-04-02 (Slice 02 complete):
   - Retired Home `history` mode and removed send-to-history wiring from Home controls/state/content paths.
   - Removed `history` from persisted mode allow-list so stale saved preferences restore to supported modes.
   - Updated Home subject grouping so completed subjects remain visible in regular grouped/manual views.
   - Updated deterministic hook tests to validate post-history fallback behavior.
- Remaining for phase closure:
   - Home courses-tab year filter persistence + nested year collapsibles.
   - Role-aware ended-subject indicators.

