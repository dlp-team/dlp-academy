<!-- copilot/plans/todo/backend-zero-trust-security-hardening/reviewing/test-execution-matrix.md -->
# Test Execution Matrix

## Usage
Record every mandatory execution run by phase. A phase cannot close without this evidence.

## Template
| Phase | Date | Command | Scope | Result | Failures | Notes |
|---|---|---|---|---|---|---|
| 00 | YYYY-MM-DD | `npm run test:rules` | Baseline | Pass/Fail | N |  |
| 00 | YYYY-MM-DD | `npm run test` | Baseline | Pass/Fail | N |  |
| 03 | YYYY-MM-DD | `npm run test:rules` | Firestore rules changes | Pass/Fail | N |  |
| 04 | YYYY-MM-DD | `npm run test:rules` | Storage rules changes | Pass/Fail | N |  |
| 05 | YYYY-MM-DD | `npm run test` | Functions auth guards | Pass/Fail | N |  |
| 06 | YYYY-MM-DD | `npm run test:rules` | Security suite | Pass/Fail | N |  |
| 06 | YYYY-MM-DD | `npm run test` | Regression suite | Pass/Fail | N |  |
| 07 | YYYY-MM-DD | `npm run test:rules` | Full pre-rollout gate | Pass/Fail | N |  |
| 07 | YYYY-MM-DD | `npm run test` | Full pre-rollout gate | Pass/Fail | N |  |
| 07 | YYYY-MM-DD | `npm run lint` | Quality gate | Pass/Fail | N |  |
| 07 | YYYY-MM-DD | `npx tsc --noEmit` | Type gate | Pass/Fail | N |  |

## Required rule
- Any Fail result must include remediation note and re-run evidence.

## Executed runs
| Phase | Date | Command | Scope | Result | Failures | Notes |
|---|---|---|---|---|---|---|
| 00 | 2026-03-12 | `npm run test:rules` | Baseline | Pass | 0 | 10/10 rules tests passed |
| 00 | 2026-03-12 | `npm run test` | Baseline | Pass | 0 | 44/44 files, 279/279 tests |
| 00 | 2026-03-12 | `npm run lint` | Baseline | Fail | many | Pre-existing lint backlog + `usePersistentState` lint conflicts |
| 00 | 2026-03-12 | `npx tsc --noEmit` | Baseline | Fail | 1 | `typescript` compiler not installed |
| 03 | 2026-03-12 | `npm run test:rules` | Firestore rules changes | Pass | 0 | Post-hardening rules tests pass |
| 05 | 2026-03-12 | `npm run test` | Functions/rules regression | Pass | 0 | No unit regressions after refactor |
| 06 | 2026-03-12 | `npm run test:rules` | Security suite expansion | Pass | 0 | 13/13 rules tests including new adversarial cases |
| 06 | 2026-03-12 | `npm run test` | Regression suite | Pass | 0 | 44/44 files, 279/279 tests |
| 06 | 2026-03-12 | `npm run test -- tests/unit/functions/guards.test.js` | Functions guard unit tests | Pass | 0 | 4/4 tests for new guard module |
| 07 | 2026-03-12 | `npm run test:rules` | Full pre-rollout gate | Pass | 0 | 13/13 rules tests |
| 07 | 2026-03-12 | `npm run test` | Full pre-rollout gate | Pass | 0 | 45/45 files, 283/283 tests |
| 07 | 2026-03-12 | `npm run lint` | Quality gate | Fail | many | Remaining failures are repo-wide backlog outside this hardening scope |
| 07 | 2026-03-12 | `npx tsc --noEmit` | Type gate | Fail | 1 | Blocked because `typescript` package is not installed |
| 07 | 2026-03-12 | `npm run test:rules` | Audit re-run | Pass | 0 | 13/13 rules tests |
| 07 | 2026-03-12 | `npm run test -- tests/unit/functions/guards.test.js` | Audit re-run targeted function guards | Pass | 0 | 1/1 files, 4/4 tests |
| 07 | 2026-03-12 | `npm run test` | Audit re-run full regression gate | Pass | 0 | 45/45 files, 283/283 tests |
| 07 | 2026-03-12 | `npm run lint` | Audit re-run quality gate | Fail | 267 (253 errors, 14 warnings) | Existing repo-wide backlog; not introduced by this plan scope |
| 07 | 2026-03-12 | `npx tsc --noEmit` | Audit re-run type gate | Fail | 1 | `tsc` unavailable: TypeScript package not installed |
| 06 | 2026-03-12 | `npm run test -- tests/unit/functions/preview-handler.test.js` | Privileged callable boundary tests | Pass | 0 | 1/1 file, 6/6 tests |
| 06 | 2026-03-12 | `npm run test:rules` | Storage + Firestore rules suite after storage test implementation | Fail | 3 | Storage suite has 3 failing allow-path tests while Firestore suite remains passing |