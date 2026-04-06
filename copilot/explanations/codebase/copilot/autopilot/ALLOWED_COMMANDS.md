<!-- copilot/explanations/codebase/copilot/autopilot/ALLOWED_COMMANDS.md -->
# Explanation: copilot/autopilot/ALLOWED_COMMANDS.md

## Current Role
Defines safe command classes that can execute without pending review in autopilot mode.

## Changes Introduced
- Reframed as trust-by-default-deny allowlist.
- Removed broad staging and unsafe git revert patterns.
- Added explicit safety conditions for branch scope and unknown commands.
- Added security-scan and environment-protection commands.

## Why It Matters
Narrows automatic execution to reversible, auditable commands and reduces accidental destructive behavior.

## Changelog
- 2026-04-06: Reworked allowlist into risk-aware, scoped command policy.
