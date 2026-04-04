<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/reviewing/subphase-2-deep-risk-analysis-2026-04-04.md -->
# InReview Subphase 2 - Deep Risk Analysis (2026-04-04)

## Objective
Perform deep risk analysis across security, permissions, and runtime stability following Phase 05-09 completion blocks.

## Reviewed Risk Areas
- Transfer recoverability and non-atomic apply/rollback risk:
  - Controls validated in [functions/security/transferPromotionApplyHandler.js](functions/security/transferPromotionApplyHandler.js), [functions/security/transferPromotionRollbackHandler.js](functions/security/transferPromotionRollbackHandler.js), and non-mock e2e evidence.
- Bin selection visual consistency risk:
  - Controls validated by shared style utility + focused tests in [tests/unit/components/BinGridItem.test.jsx](tests/unit/components/BinGridItem.test.jsx).
- Compile-gate drift risk from env/policy contract mismatch:
  - Controls applied in [src/utils/institutionPolicyUtils.ts](src/utils/institutionPolicyUtils.ts) and [src/global.d.ts](src/global.d.ts).
- Credential pattern scan signal quality risk (historical false positives):
  - Logged as out-of-scope follow-up in [copilot/plans/out-of-scope-risk-log.md](copilot/plans/out-of-scope-risk-log.md).

## Out-of-Scope Entries Logged
- Existing branch-wide credential-pattern scan false positives from historical docs/example strings remain open with dedicated remediation recommendation.

## Validation Evidence
- `npm run lint` -> PASS
- `npx tsc --noEmit` -> PASS
- `npm run test` -> PASS
- `npm run test:e2e -- tests/e2e/transfer-promotion.spec.js` (non-mock path) -> PASS (`3 passed`)

## Result
- Subphase 2 complete.
- High-risk controls validated; residual open risks documented in out-of-scope log.
