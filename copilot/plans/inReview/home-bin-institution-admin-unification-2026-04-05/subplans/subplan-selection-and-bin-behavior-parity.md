<!-- copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/subplans/subplan-selection-and-bin-behavior-parity.md -->
# Subplan - Selection and Bin Behavior Parity

## Parent Phase
- Phase 02

## Objective
Unify selection logic and apply requested visual/interaction updates for Bin grid/list behavior.

## Workstreams
1. Map existing Home and Bin selection hooks/state ownership.
2. Extract or unify shared selection computations.
3. Add Home dimming of unselected items under active selection.
4. Replace Bin grid selected-state blur/borders with scale-focus transition.
5. Rework Bin list action panel placement under selected row.

## Candidate Files
- src/pages/Home/**
- src/hooks/**
- src/components/modules/**
- src/styles/**

## Validation
- Deterministic selection tests for single and multi-select.
- UI checks for list reflow and action panel placement.

## Rollback Trigger
- If parity introduces degraded keyboard or accessibility behavior, restore previous rendering branch for impacted view and re-iterate with targeted fix.

