<!-- copilot/plans/todo/backend-zero-trust-security-hardening/reviewing/release-gate-checklist.md -->
# Release Gate Checklist

## Pre-rollout
- [ ] Phase 07 completed and signed.
- [ ] All mandatory commands executed and passing.
- [ ] No unresolved critical/high security findings.
- [ ] Rollback owner assigned.
- [ ] On-call owner assigned.

## Current status snapshot
- Security gate: pass
- Unit regression gate: pass
- Lint gate: blocked by existing repo backlog
- Type gate: blocked by missing `typescript` package

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