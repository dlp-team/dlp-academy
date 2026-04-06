<!-- copilot/explanations/codebase/copilot/autopilot/FORBIDDEN_COMMANDS.md -->
# Explanation: copilot/autopilot/FORBIDDEN_COMMANDS.md

## Current Role
Hard deny list for destructive, deployment, or history-rewrite commands.

## Changes Introduced
- Added explicit unsafe revert commands (`git checkout --`, `git checkout .`, `git clean`).
- Added broad staging pattern ban (`git add .`).
- Kept deployment and force-history rewrite commands forbidden.

## Why It Matters
Prevents high-impact shortcuts that can silently discard work or alter protected history.

## Changelog
- 2026-04-06: Expanded forbidden patterns and aligned with risk-tier governance.
