# Phase 02 — Manual Tab Visibility Contract

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

## Progress Update (2026-02-24)

- Implemented non-owner source filtering in Home state merge paths.
- Prevented manual-tab leakage of shared source cards by preferring normalized folder sources in page state.
- Initial verification indicates owner view remains correct and non-owner direct-source leakage is resolved.

## Remaining Validation

- Confirm non-owner always sees shortcut card for shared targets (not raw source card).
- Confirm no duplicate card per target in same parent scope.
- Confirm parity in list/tree/search paths.

## Status
- Phase state: **IN_PROGRESS**
