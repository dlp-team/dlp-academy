# Review Log — 2026-02-28 — Phase 04 Candidate 1

## Summary
- Candidate 1 implements institution-level token resolution for Home with strict fallback defaults.
- Wiring is limited to Home token consumers and keeps runtime behavior unchanged.

## Key decisions
1. Read institution theme from `institutions/{institutionId}` only when `institutionId` exists.
2. Accept multiple configuration paths to be schema-tolerant.
3. Merge only known token keys and only non-empty string overrides.

## Risk review
- Main risk: stale or unexpected institution config shapes.
- Mitigation: key-whitelisting and full fallback to defaults.

## Status
- Candidate readiness: READY_FOR_FINALIZATION
- Manual smoke: PENDING_USER_SMOKE
