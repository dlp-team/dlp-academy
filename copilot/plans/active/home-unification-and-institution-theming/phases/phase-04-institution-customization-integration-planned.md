# Phase 04 — Institution Customization Integration (PLANNED)

## Objective
Connect theming tokens with institution-level settings managed via AdminInstitutionDashboard.

## Planned changes
- Define read path for institution appearance configuration.
- Implement safe fallback chain: institution theme -> default theme.
- Wire token consumer layer so client UI remains in Spanish while logic/config stay English.

## Risks
- Config-read latency or stale cache inconsistencies.
- Partial rollout where only some surfaces consume institution theme.
