<!-- copilot/plans/active/original-plan-autopilot-2026-04-07/phases/phase-02-bin-ui-improvements.md -->
# Phase 02 - Bin UI Improvements

## Status
- inReview

## Objectives
- Reduce excessive background dimming in grid mode focus state.
- Add card scale + transition for focused bin item with synchronized option reveal.
- Align list mode visual language/options with grid mode interaction pattern.

## Validation
- get_errors on bin/list card components and styles.
- Manual pass in grid/list bins for focus, transitions, and option menus.

## Outcome (In Review)
- Softened grid focus fade by reducing backdrop opacity and bin subject dimming intensity.
- Synchronized focused-card transition and options reveal cadence in grid overlay.
- Updated list inline panel shell/action visuals to align with grid interaction language while preserving existing action behavior.
- Targeted diagnostics and unit test suite passed for touched bin and dimming paths.
