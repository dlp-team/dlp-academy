<!-- copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/subplans/subplan-institution-settings-order-and-automation.md -->
# Subplan - Institution Settings, Course Order, and Automation Controls

## Parent Phase
- Phase 03

## Objective
Deliver settings-level configuration for period defaults, course progression ordering, and automation toggles with safe institution scoping.

## Workstreams
1. Add period date default fields and course-creation auto-population.
2. Build non-duplicated drag-and-drop course ordering model.
3. Implement order-persistence and retrieval for automatic transfer workflows.
4. Add institution-level automation tool toggles.
5. Verify backward compatibility for institutions with missing new fields.

## Candidate Files
- src/pages/InstitutionAdmin/**
- src/hooks/**
- src/utils/**
- src/firebase/**
- functions/** (if backend mutation helpers are required)

## Validation
- Unit/integration coverage for settings persistence and default propagation.
- Multi-tenant/permission checks for mutation paths.

## Rollback Trigger
- If settings schema migration causes unstable reads, apply compatibility adapter and defer schema hardening until stable release window.


