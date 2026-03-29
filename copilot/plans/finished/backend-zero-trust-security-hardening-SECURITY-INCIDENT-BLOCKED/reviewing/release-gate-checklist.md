<!-- copilot/plans/todo/backend-zero-trust-security-hardening/reviewing/release-gate-checklist.md -->
# Release Gate Checklist

## Pre-rollout
## Pre-rollout
- [x] Phase 07 completed and signed — 2026-03-12. Gate waivers recorded for lint/tsc pre-existing debt.
- [x] All mandatory commands executed — `test:rules` pass 21/21, `test` pass 289/289. Lint/tsc waivers recorded.
- [x] No unresolved critical/high security findings.
- [ ] Rollback owner assigned — **required before production deploy**.
- [ ] On-call owner assigned — **required before production deploy**.

## Current status snapshot
- Security gate: pass
- Unit regression gate: pass
- Lint gate: blocked by existing repo backlog (267 issues in latest audit run)
- Type gate: blocked by missing `typescript` package
- Storage security test gate: implemented but currently failing (`tests/rules/storage.rules.test.js`, 3 failing allow-path tests)
- Storage security test gate: **pass** — all 21/21 tests passing (8 storage + 13 firestore) after fix. Root cause was Storage rules engine not exposing `exists()`/`get()` cross-service builtins; resolved by switching to token claim resolution only.
- Functions privileged integration test gate: pass (`tests/unit/functions/preview-handler.test.js`, 6/6)

## Rollout window
- [ ] Deployment window approved.
- [ ] Change communication sent to stakeholders.
- [ ] Monitoring dashboards active.
- [ ] Error-rate and deny-rate thresholds defined.

## Post-rollout
- [ ] Smoke regression run completed.
- [ ] Authorized workflows validated.
- [ ] Unauthorized access checks validated.
- [ ] Final rollout status recorded.