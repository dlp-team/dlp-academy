# Phase 01 — Manual Tab Visibility Contract

## Goal
Enforce manual tab rendering contract: owner resources + user-owned shortcuts only.

## Scope
- Normalize card source tagging (`source` vs `shortcut`).
- Centralize visibility filter in Home state hook layer.
- Prevent non-owner source cards from leaking into manual tab collections.

## Implementation Notes
- Use deterministic predicates on `ownerId`, `uid`, `isOwner`, and `shortcut.ownerId`.
- Keep filters in hooks; views remain presentational.

## Exit Criteria
- Manual tab output is stable across grid/list/tree and search.
