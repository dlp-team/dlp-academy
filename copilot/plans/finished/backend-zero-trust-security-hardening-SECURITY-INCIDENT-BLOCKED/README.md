<!-- copilot/plans/inReview/backend-zero-trust-security-hardening/README.md -->
# Backend Zero-Trust Security Hardening

## ?? SECURITY INCIDENT OPEN — Phase 08 Rollout BLOCKED

**Incident Date:** 2026-03-12 (post-implementation audit)  
**Severity:** CRITICAL  
**Status:** Open — Awaiting remediation  
**Findings:** 9 vulnerabilities including student privilege escalation, unvalidated sharing, quiz tampering  

**Read Full Report:** [security-audit-incident-2026-03-12.md](../../temporal/security-audit-incident-2026-03-12.md)

### Why Rollout Is Blocked
The current irestore.rules allows **students to create subjects, modify quiz results, and escalate role privileges within their institution.** The test suite passed because it did NOT include adversarial student scenarios. This is a critical gap that must be fixed before production deployment.

### Immediate Actions Required
1. **Do NOT deploy** rules to production.
2. **Read incident report** for technical details and proof-of-concept attacks.
3. **Create remediation plan** with student role escalation test cases.
4. **Apply fixes** to firestore.rules per Priority 1–4 in the incident report.
5. **Expand test suite** with deny scenarios for student actors.
6. **Re-run audit** before Phase 08 rollout is reconsidered.

---

## Current execution status (2026-03-12)
- Overall: **Phase 07 complete, Phase 08 blocked pending incident remediation.**
- Phases 00–07: Completed (with documented gate waivers for lint/tsc pre-existing debt).
- Phase 08 rollout: **BLOCKED** due to security incident.

## Objective
Raise backend security posture to maximum practical level by enforcing least-privilege access at every layer (Firestore Rules, Storage Rules, Auth claims/roles, server-side flows), while preserving multi-tenant isolation and operational continuity.

## Scope
- Firestore read/write permissions by role and ownership
- Cross-institution isolation enforcement
- Storage path authorization consistency
- Server-side privileged operations with strict input authorization
- Auditability, test coverage, staged rollout, and rollback safety
- **MANDATORY:** Comprehensive adversarial test coverage for all roles (including students attempting unauthorized writes)

## Explicit security model
- Deny-by-default everywhere
- Allow-by-exception with explicit role+resource checks
- Never trust client claims unless verified by rules/server against persisted user role state
- Every mutating path must validate both actor role and tenancy scope

## Non-goals
- Production deployment in this plan document
- "Perfect security" guarantees

## Success metrics
- 100% collection/path coverage in authorization matrix
- 100% critical CRUD actions covered by allow/deny tests **per role** (including student deny cases)
- 0 privilege escalation paths
- 0 regressions in authorized workflows
- **All HIGH/CRITICAL findings from post-implementation audit remediated and re-verified**
