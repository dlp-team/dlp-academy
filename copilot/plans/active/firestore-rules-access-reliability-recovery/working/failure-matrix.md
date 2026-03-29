# Failure Matrix - Phase 01 (Initial)

| ID | Role | Action | Resource Path | Expected | Actual | Error Message | Rule Section Candidate | Repro Test | Status |
|---|---|---|---|---|---|---|---|---|---|
| FR-001 | editor (shared journey) | login redirect to home before shared operations | n/a (pre-auth navigation) | navigate to /home and proceed with shared folder create flow | passed after env credential correction | previously `page.waitForURL(/\/home/) timeout` + invalid credentials banner | External test fixture (.env credentials), not rules logic | `tests/e2e/home-sharing-roles.spec.js`, `tests/e2e/admin-guardrails.spec.js` | RESOLVED |
| FR-002 | institution admin / email-owner delete invite | delete institution invite | `/institution_invites/{inviteId}` | allow when authorized by role/institution or matching email | runtime evaluation error removed after predicate hardening | previously `Property email is undefined on object`; now explicit deny/allow with no property error | `institution_invites` delete predicate (email-claim + email-field guards) | `npm run test:rules` runtime logs | MITIGATED |

## Notes
- Re-run after credential fix:
  - `tests/e2e/home-sharing-roles.spec.js` + `tests/e2e/admin-guardrails.spec.js`: 12/12 passed.
  - `tests/e2e/bin-view.spec.js` + `tests/e2e/subject-topic-content.spec.js`: 4 passed / 2 skipped.
  - `tests/e2e/home-sharing-roles.spec.js` (strict role assertions): 6/6 passed.
    - Viewer denial path explicitly validated as either redirect to `/home` or zero draggable cards in shared folder.
    - Editor drag-drop mutation path validated (folder nested, source removed from current view).
    - Editor create/delete mutation flow in shared folder validated via UI lifecycle assertion.
- Rules hardening outcome:
  - Added invite delete guards for missing auth-email claim and missing invite email field.
  - Added regression test for missing-invite-email delete path.
  - `npm run test:rules`: 40/40 passed.
- Rule emulator suite currently passes (`39/39`), so reported runtime issues are likely tied to specific workflow/data states not yet covered by existing rules tests.
