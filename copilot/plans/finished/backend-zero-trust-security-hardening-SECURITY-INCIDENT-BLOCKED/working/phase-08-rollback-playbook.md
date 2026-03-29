<!-- copilot/plans/todo/backend-zero-trust-security-hardening/working/phase-08-rollback-playbook.md -->
# Phase 08 — Rollback Playbook

## Purpose
Define the exact steps to revert hardened security rules and function guards in the event of a production incident following rollout.

## Trigger conditions (escalate to rollback immediately if any are true)
- Any unauthorized `allow` detected on a path that should be denied.
- Any legitimate, authorized user flow blocked by the new rules (confirmed false-deny).
- Storage or Firestore deny-rate spike > 5% above pre-rollout baseline within first 30 minutes.
- Critical business operations (invite flow, subject management, institution branding) report access errors.

---

## Rollback scope

### Files changed by this plan (safe to revert together)
| File | Change summary |
|---|---|
| `firestore.rules` | Added deny-by-default hardening, anti-escalation, anti-tenant-reassignment, ownership guards |
| `storage.rules` | Replaced existing rules with token-claim-only allow/deny guards + deny-by-default fallback |
| `functions/index.js` | Wired call guards via `functions/security/guards.js` |
| `functions/security/guards.js` | New privileged path guard module |
| `functions/security/previewHandler.js` | Extracted privileged callable handler |

### Files that are test-only (do NOT revert in production incident)
- `tests/rules/firestore.rules.test.js`
- `tests/rules/storage.rules.test.js`
- `tests/unit/functions/guards.test.js`
- `tests/unit/functions/preview-handler.test.js`

---

## Rollback steps

### Step 1 — Identify blast radius
1. Check Firebase Console → Firestore Usage → Rules Playground or logs.
2. Check Storage Console → Access errors by path.
3. Check Functions logs for `permission-denied` or guard rejection entries.
4. Identify whether the incident is Firestore-only, Storage-only, Functions-only, or all paths.

### Step 2 — Targeted override (preferred — minimal blast radius)
If the incident is isolated to a single path or rule segment:
1. Edit only the offending rule clause in `firestore.rules` or `storage.rules`.
2. Deploy using: `firebase deploy --only firestore:rules` or `firebase deploy --only storage`.
   - **⚠️ NEVER run this from an agent session. This must be executed by a human operator with confirmed access.**
3. Verify the override with Firebase Rules Playground or a targeted test run.
4. Document the targeted override and open a permanent fix issue.

### Step 3 — Full rules rollback (if targeted override is insufficient)
1. Retrieve the prior-version snapshot from git:
   ```
   git log --oneline firestore.rules storage.rules
   git show <prior-commit>:firestore.rules > firestore.rules.rollback
   git show <prior-commit>:storage.rules > storage.rules.rollback
   ```
2. Review the rollback snapshot for correctness; do not blindly apply.
3. Apply with human operator: `firebase deploy --only firestore:rules,storage`.
4. Confirm with smoke regression suite.

### Step 4 — Functions rollback
If guard rejections in Cloud Functions are causing authorized workflow failures:
1. Temporarily disable/bypass the guard clause in `functions/security/guards.js` for the affected callable.
2. Re-deploy the function: `firebase deploy --only functions:<functionName>`.
3. Restore guard once root cause is identified and fixed.

### Step 5 — Post-rollback actions (mandatory)
- [ ] Record incident: timestamp, trigger, affected paths, user impact.
- [ ] Run full regression suite post-rollback: `npm run test`, `npm run test:rules`.
- [ ] Hold retrospective before re-attempting rollout.
- [ ] Create targeted fix and re-run full test gate before a second rollout attempt.

---

## Rollback readiness checklist (complete before first rollout)
- [ ] Rollback owner designated and available during rollout window.
- [ ] On-call engineer available in first 2 hours post-deploy.
- [ ] Previous rules snapshot committed to git (verify hash before proceeding).
- [ ] Smoke regression suite available and runnable on demand.
- [ ] Firebase Console access confirmed for rollback owner.
- [ ] Rollback steps reviewed by rollback owner (this document read and signed off).
