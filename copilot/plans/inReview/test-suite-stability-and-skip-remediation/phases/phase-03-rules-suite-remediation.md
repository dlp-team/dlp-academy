<!-- copilot/plans/inReview/test-suite-stability-and-skip-remediation/phases/phase-03-rules-suite-remediation.md -->
# Phase 03 - Rules Suite Remediation

## Status
- COMPLETED

## Objective
Stabilize Firestore/Storage rules tests while preserving security intent and least-privilege behavior.

## Execution Steps
1. Reproduce failing rules tests under emulator.
2. Classify each failure as:
   - test expectation drift,
   - fixture data mismatch,
   - genuine rules defect.
3. Apply surgical fixes and keep denial-path assertions explicit.
4. Re-run rules suite end-to-end.

## Deliverables
- Green `npm run test:rules` result.
- Updated tests/rules fixtures and minimal rules patches when needed.
- Security-impact notes in lossless report.

## Risks and Controls
- Risk: Over-permissive rule changes to force green tests.
- Control: Add/retain negative authorization assertions and verify deny paths.

## Exit Criteria
- Rules suite passes with security behavior preserved.
