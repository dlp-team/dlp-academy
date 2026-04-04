<!-- copilot/plans/active/credential-scan-false-positive-remediation-2026-04-04/strategy-roadmap.md -->
# Strategy Roadmap

## Phase Sequence and Status
1. COMPLETED - Baseline scan-signal audit and detection-rule definition.
2. COMPLETED - High-confidence scan utility implementation and protocol wiring.
3. COMPLETED - Validation pass and docs migration consistency sweep.
4. COMPLETED - Final optimization and deep risk review.

## Immediate Next Actions
- Complete optimization/consolidation pass for remediation docs and utility references.
- Complete deep risk review for potential false-negative signature gaps.
- Prepare lifecycle transition to `inReview` after review-subphase checklist completion.

## Validation Gates
- Per change block: get_errors clean.
- Implementation gates: npm run lint, npx tsc --noEmit, npm run test.
- Security gates: utility staged scan and branch-range scan output verified.

## Rollback Strategy
- Keep docs and utility updates in isolated commits.
- If scan utility over-blocks, revert utility wiring first and preserve baseline docs references for quick restore.
