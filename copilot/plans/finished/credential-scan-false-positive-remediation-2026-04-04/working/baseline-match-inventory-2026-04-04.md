<!-- copilot/plans/active/credential-scan-false-positive-remediation-2026-04-04/working/baseline-match-inventory-2026-04-04.md -->
# Baseline Match Inventory (2026-04-04)

## Snapshot
- Literal token search produced high counts for broad markers in policy/docs.
- A large portion of matches come from instruction/checklist text rather than real secrets.

## Observations
- Broad keyword scans create noisy outcomes in docs-heavy branches.
- Existing checks should move to high-confidence signatures to improve actionable signal.
- Local ignored files can contain sensitive content and should remain outside tracked diff scans.

## Planned Remediation Direction
- Introduce one canonical script for diff scanning:
  - staged diff mode
  - explicit git-range mode
- Use signature-based detection (real key/private-key formats) instead of generic keyword lists.
- Update operational docs to reference canonical script.
