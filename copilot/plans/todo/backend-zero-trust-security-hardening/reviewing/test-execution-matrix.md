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