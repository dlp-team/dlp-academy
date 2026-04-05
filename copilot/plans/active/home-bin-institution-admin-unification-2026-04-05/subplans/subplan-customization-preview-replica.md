<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/subplans/subplan-customization-preview-replica.md -->
# Subplan - Customization Preview Replica

## Parent Phase
- Phase 04

## Objective
Replace approximation preview behavior with true component parity and real-time theme feedback.

## Workstreams
1. Fix fullscreen layering/z-index and remove header overlap.
2. Wire preview to real production components for targeted surfaces.
3. Ensure preview includes real header and Bin behavior.
4. Implement instant color-application reflection.
5. Add active-color zone highlighting without polluting saved theme state.

## Candidate Files
- src/pages/InstitutionAdmin/**
- src/components/layout/**
- src/components/modules/**
- src/styles/**

## Validation
- Side-by-side parity checks for each replicated surface.
- Fullscreen and responsive checks.

## Rollback Trigger
- If full parity coupling creates excessive runtime cost, preserve replica fidelity for critical paths first and phase in lower-priority surfaces with profiling evidence.
