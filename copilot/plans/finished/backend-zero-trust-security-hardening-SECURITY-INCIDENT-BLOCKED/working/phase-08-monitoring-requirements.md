<!-- copilot/plans/todo/backend-zero-trust-security-hardening/working/phase-08-monitoring-requirements.md -->
# Phase 08 — Monitoring Requirements

## Purpose
Define what must be actively monitored in the first 30 minutes and first 24 hours after production rollout of the hardened security rules.

---

## Critical metrics to watch

### 1. Firestore rules deny rate
- **Signal**: `firebase_functions_requests_count{response_code="permission-denied"}` or Firebase Console `Rules` tab.
- **Baseline**: Capture deny-rate average 48h before rollout, broken down by collection.
- **Alert threshold**: >5% above pre-rollout baseline in any protected collection within 30 minutes.
- **What to check if triggered**: Identify which collection/path is denying; compare against authorization matrix; verify if legitimate role is being blocked.

### 2. Storage rules deny rate
- **Signal**: Firebase Storage Console → Usage → Error codes.
- **Baseline**: Capture `storage/unauthorized` event frequency 48h before rollout.
- **Alert threshold**: Any `storage/unauthorized` on `profile-pictures/` or `institutions/*/branding/` for known-good authenticated users.
- **What to check if triggered**: Confirm token custom claims (`role`, `institutionId`) are being correctly set by the Cloud Function auth trigger.

### 3. Cloud Function permission-denied rejections
- **Signal**: Cloud Functions logs → `level=ERROR` entries from `functions/security/guards.js`.
- **Baseline**: Expected zero guard-rejection errors for legitimate callers in normal operation.
- **Alert threshold**: Any guard rejection for users who should be authorized.
- **What to check if triggered**: Verify `request.auth.token.role` and `request.auth.token.institutionId` claims on the caller's token.

### 4. Custom claims propagation lag
- **Problem**: After a role change in Firestore, custom claims on the user's JWT take up to 1 hour to refresh (Firebase ID token TTL). During this window, the old claims may mismatch the Firestore user document.
- **Monitoring**: Watch for access errors in the first hour after role changes. No direct metric; monitor support tickets or error rate alongside admin role-change events.
- **Mitigation**: Force token refresh on role change by calling `firebase.auth().currentUser.getIdToken(true)` after admin role mutation (already handled in frontend admin flows — verify this is wired).

---

## Smoke regression suite (run immediately post-deploy)
Run these manually or via `npm run test` immediately after each environment rollout:

| Workflow | Expected result | Failure action |
|---|---|---|
| Teacher uploads profile picture | Success (200/OK) | Rollback storage rules |
| Admin reads any user's profile picture | Success | Rollback storage rules |
| Institution admin uploads branding logo for own institution | Success | Rollback storage rules |
| Institution admin tries to upload branding for another institution | Denied | Check cross-tenant guard |
| Student cannot write branding | Denied | Check deny rule |
| Institution admin can create subjects for own institution | Success | Rollback Firestore rules |
| Teacher cannot promote another user's role | Denied | Check anti-escalation rule |
| Unauthenticated request to any protected path | Denied | Check deny-by-default |

---

## Rollout sequence
1. **Local emulator verification** — run `npm run test:rules` and `npm run test` (already complete).
2. **Staging environment** — deploy rules to staging Firebase project, run smoke suite manually.
3. **Production** — deploy rules during low-traffic window (recommend off-peak hours) with rollback owner on standby.

---

## Post-deploy confirmation checklist
- [ ] Smoke suite passed on staging.
- [ ] Rollout window approved and communicated.
- [ ] Rules deployed to production (by human operator).
- [ ] Post-deploy smoke suite executed on production.
- [ ] Deny-rate baseline compared — no unexpected spikes.
- [ ] Auth claim propagation spot-checked (one role change + token refresh tested).
- [ ] Rollout confirmed successful with timestamp recorded.
- [ ] Final entry added to `reviewing/test-execution-matrix.md`.
