# Phase 03 — Dedupe and Idempotency Hardening

## Goal
Prevent duplicate shortcut cards from retries/re-shares/race conditions.

## Scope
- Deterministic uniqueness tuple for logical dedupe.
- Defensive cleanup when multiple shortcuts already exist.
- Safe retry behavior for partially successful share operations.

## Exit Criteria
- Re-running share calls remains stable and duplicate-free.
