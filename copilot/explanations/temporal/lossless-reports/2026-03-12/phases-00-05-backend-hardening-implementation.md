<!-- copilot/explanations/temporal/lossless-reports/2026-03-12/phases-00-05-backend-hardening-implementation.md -->
# Lossless Report — Phases 00–05 Backend Hardening Implementation

## Requested scope
- Enforce mandatory end-of-task leverage question behavior in instructions and agent config.
- Execute plan phases 00 to 05 in depth.
- Ensure backend hardening is real (rules/functions updated), not only documentation.

## Implemented code changes
- `.github/copilot-instructions.md`
  - Strengthened mandatory `vscode/askQuestions` requirement before closure.
- `AGENTS.md`
  - Added mandatory end-of-task leverage step.
- `firestore.rules`
  - Hardened `users` rules:
    - split create/update/delete
    - prevent self role/institution escalation
    - preserve global admin control and institution-admin scoped management.
- `storage.rules`
  - Replaced with valid deny-by-default policy.
  - Added role+tenant checks backed by `users/{uid}` lookups.
  - Scoped active paths: profile pictures + institution branding.
- `functions/security/guards.js` (new)
  - Added reusable auth/validation/permission helpers.
- `functions/index.js`
  - Refactored callables to use shared guards.
- `tests/rules/firestore.rules.test.js`
  - Added adversarial security tests for user escalation and admin-promotion boundaries.

## Plan artifacts completed/updated
- Working phase evidence files for 00–05.
- Phase status markers updated for 00–05.
- Execution evidence matrix updated with real command outcomes.
- Completion report for phases 00–05.

## Validation summary
- `npm run test:rules` → pass.
- `npm run test` → pass (44/44, 279/279).
- Expanded rules suite after new tests: `npm run test:rules` → pass (13/13).
- Diagnostics for changed backend files (`firestore.rules`, `storage.rules`, `functions/index.js`, `functions/security/guards.js`) → clean.
- Baseline `npm run lint` remains failing due existing repository backlog (documented).
- Baseline `npx tsc --noEmit` unavailable because TypeScript compiler package missing (documented).

## Preserved behavior
- Existing rules test suite behavior preserved.
- Existing unit test suite behavior preserved.
- Access-code callable behavior preserved while improving validation/guard structure.

## Known limitations
- Firestore hardening in this pass focused on `users` escalation guardrails first; remaining collection-level tightening is tracked for subsequent phases.
