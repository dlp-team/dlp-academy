<!-- copilot/plans/active/original-plan-autopilot-execution-2026-04-03/phases/phase-01-codebase-audit-and-dependency-map-in-progress.md -->
# Phase 01 - Codebase Audit and Dependency Map

## Status
COMPLETED

## Objective
Map exact code surfaces for every requested change, preserving all adjacent behaviors and identifying coupling risks before implementation.

## Work Items
- Inventory files/modules for: selection mode, bin selection, settings/auth, dashboard lists, institution admin preview/customization, deletion logic, subject edit save flow, and scrollbars.
- Build requirement coverage map: Original prompt item -> concrete implementation target.
- Identify shared utilities/hooks/components to reuse and centralize logic.
- Record risk hotspots (permissions, ownership, toasts, deeply nested mock navigation).

## Preserved Behaviors
- No functional changes in this phase.
- Existing user flows remain untouched.

## Risks
- Missing hidden coupling in Home/Bin shared components.
- Toast/reporting pipeline may have cross-page listeners.

## Validation
- Documentation consistency check across roadmap, phase file, and working docs.

## Exit Criteria
- Dependency map complete.
- Coverage matrix complete and verified against original prompt.

## Completion Notes
- Created dependency mapping and original-vs-Gemini coverage matrix in `working/`.
- Established architecture audit baseline document for preview 2.0 decision path.
