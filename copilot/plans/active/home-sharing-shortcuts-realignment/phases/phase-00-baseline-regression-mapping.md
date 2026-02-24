# Phase 00 — Baseline Regression Mapping

## Goal
Identify precisely where colleague changes diverged from intended shortcut-first non-owner behavior.

## Scope
- Trace manual tab data pipeline in Home hooks.
- Inventory where non-owned source items are still entering render pipeline.
- Confirm share path for subject/folder and where shortcut creation can be skipped.

## Output
- File/symbol map of offending code paths.
- Regression matrix (expected vs current).
- Change list for implementation phase.

## Exit Criteria
- All visibility and share regressions reproducible and mapped to concrete hook/handler logic.
