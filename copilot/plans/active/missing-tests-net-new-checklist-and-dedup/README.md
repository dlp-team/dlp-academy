<!-- copilot/plans/todo/missing-tests-net-new-checklist-and-dedup/README.md -->
# Missing Tests Net-New Checklist and Dedup Plan

## Problem Statement
The current test inventory work identified net-new gaps, but we need organized artifacts and a cleaned checklist baseline. `tests/todo-tests.md` contains duplicated entries that reduce clarity and planning velocity.

## Scope
- Create a net-new missing-tests checklist file with deduplicated, actionable items.
- Deduplicate repeated entries in `tests/todo-tests.md` without changing intended coverage scope.
- Keep naming and content aligned with existing project testing domains.

## Non-Goals
- Implementing tests in this plan.
- Refactoring test framework configuration.
- Changing checklist priorities beyond dedup/organization.

## Current Status
- Plan state: **IN_REVIEW**
- Current phase: **Phase 02 — Review Gate and Closure Evidence (IN_PROGRESS)**
- Last updated: **2026-03-07**
- Blockers: None.

## Key Decisions and Assumptions
- `tests/todo-tests.md` remains the legacy broad backlog.
- New file `tests/missing-tests-net-new.md` stores only net-new items excluded from existing todo list.
- Dedup in `tests/todo-tests.md` is lossless: remove repeated bullets, preserve unique intent.

## Plan Artifacts
- `strategy-roadmap.md`
- `phases/phase-01-inventory-consolidation-and-checklist-normalization-planned.md`
- `reviewing/verification-checklist-2026-03-07.md`
