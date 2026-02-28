# Phase 01 — Home Duplication Audit (IN_PROGRESS)

## Objective
Create a concrete inventory of duplicated logic across Home hooks, handlers, and components.

## Planned changes
- Map repeated branches and helper patterns in Home movement/sharing/filtering flows.
- Document exact symbols and files where duplication appears.
- Rank extraction candidates by regression risk and implementation effort.

## Progress update
- Initial audit report created: `working/phase-01-duplication-audit-2026-02-28.md`.
- Duplication hotspots identified in shared-visibility predicates, shortcut merge+dedup, and modal shell styles.
- Extraction candidates prioritized with risk ranking.

## Risks
- Over-scoping refactor candidates too early.
- Missing mode-specific behavior differences hidden behind similar code.
