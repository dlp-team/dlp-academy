<!-- copilot/plans/finished/institution-governance-and-academic-lifecycle-overhaul/phases/phase-01-discovery-dependency-graph-and-architecture-decisions.md -->

# Phase 01 - Discovery, Dependency Graph, and Architecture Decisions

## Status
- COMPLETED

## Objective
Lock high-impact architecture decisions before broad implementation to avoid costly rewrites in later phases.

## Scope
1. Build dependency graph for permission, deletion, courses, and dashboard modules.
2. Decide customization preview architecture with explicit rationale.
3. Decide academic year ownership model and lifecycle governance.
4. Decide dual-role identity and role-switch model.

## Decision Outputs Required
- Preview architecture decision record.
- Academic year model decision record.
- Dual-role model decision record.
- Risk register with mitigations.

## Risks
- Premature implementation without architecture decision can force rollback.
- Inconsistent lifecycle ownership can break manual/courses tabs.

## Validation Gate
- Decisions documented in working log.
- Strategy roadmap remains synchronized.
- No unresolved blockers for Phase 02 start.

## Completion Notes
- Dependency graph built for permissions, deletion lifecycle, dashboard surfaces, and role model flows.
- Architecture decisions recorded in working log:
	- customization preview should reuse real app surfaces with mock-data mode,
	- academic year should be owned by course/class and derived by subjects,
	- dual-role should use single identity with active-role switching.
- Risks and downstream sequencing established for immediate Phase 02 start.

