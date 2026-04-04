<!-- copilot/plans/active/credential-scan-false-positive-remediation-2026-04-04/phases/phase-01-baseline-audit-and-rule-definition.md -->
# Phase 01 - Baseline Audit and Rule Definition (COMPLETED)

## Objective
Establish a deterministic baseline for false-positive sources and define high-confidence detection rules.

## Planned Changes
- Capture current false-positive source categories.
- Define minimal set of high-confidence credential signatures.
- Define acceptance criteria for improved signal quality.

## Progress Notes
- Created baseline inventory in working notes.
- Confirmed broad keyword markers in docs/instructions are the dominant noise source.
- Finalized high-confidence detector categories for API keys, private key blocks, private key JSON fields, and long secret assignments.

## Exit Criteria
- High-confidence rule set is documented and ready for utility implementation.
