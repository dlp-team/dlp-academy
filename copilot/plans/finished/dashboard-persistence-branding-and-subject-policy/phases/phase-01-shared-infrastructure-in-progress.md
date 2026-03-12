<!-- copilot/plans/active/dashboard-persistence-branding-and-subject-policy/phases/phase-01-shared-infrastructure-in-progress.md -->
# Phase 01 — Shared Infrastructure

## Objective
Introduce the minimal shared infrastructure needed to implement persistence and policy-backed behavior without duplicating ad hoc logic across pages.

## Planned changes
- Add localStorage persistence helpers for page tabs/sections.
- Add Home collapsed-group/shared-section persistence hooks.
- Add admin institution navigation plumbing.
- Prepare institution access policy shape extensions.

## Risks
- Overwriting existing Home preference behavior.
- Persistence keys colliding across pages.
- Introducing routing assumptions for admin impersonation/access.

## Completion notes
- Pending implementation.
