# Phase 06 - Abuse-Resistance Hardening

## Objective
Reduce brute-force/replay risk for invite and access-code endpoints.

## Tasks
- Add server-side attempt controls/rate-limiting strategy for access-code validation.
- Harden invite redemption to transactional single-use semantics.
- Add security telemetry for repeated invalid attempts.

## Exit Criteria
- Replay and brute-force windows are materially reduced and monitored.
