<!-- copilot/explanations/codebase/copilot/autopilot/PENDING_COMMANDS.md -->
# Explanation: copilot/autopilot/PENDING_COMMANDS.md

## Current Role
Queue for unknown commands pending explicit approval or rejection.

## Changes Introduced
- Added category, impact scope, risk tier, and rollback plan fields.
- Added deterministic decision rules based on command approval matrix.
- Clarified deny-until-reviewed default behavior.

## Why It Matters
Improves command review quality and makes approval decisions auditable and reversible.

## Changelog
- 2026-04-06: Upgraded pending template to structured risk-review format.
