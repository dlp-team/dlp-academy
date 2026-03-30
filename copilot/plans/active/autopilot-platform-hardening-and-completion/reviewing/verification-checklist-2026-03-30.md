<!-- copilot/plans/active/autopilot-platform-hardening-and-completion/reviewing/verification-checklist-2026-03-30.md -->
# Verification Checklist (2026-03-30)

## Phase Completion Integrity
- [ ] `strategy-roadmap.md` reflects real status for all phases.
- [ ] Every IN_PROGRESS/COMPLETED phase has a matching file in `phases/`.
- [ ] `README.md` current phase and lifecycle status are accurate.

## Quality Gates
- [ ] `npm run lint` passed for latest implementation slice.
- [ ] `npm run test` passed for latest implementation slice.
- [ ] Additional targeted tests for touched high-risk workflows passed.
- [ ] No unresolved diagnostics in touched files (`get_errors` clean).

## Lossless and Documentation Gates
- [ ] Lossless report updated for each completed implementation slice.
- [ ] Relevant explanation files updated with current behavior.
- [ ] Preserved behaviors and non-goals documented explicitly.

## Security and Access Gates
- [ ] Role boundaries remain least-privilege for touched flows.
- [ ] Firestore rule changes (if any) have matching allow/deny test coverage.
- [ ] No privilege widening introduced to pass tests.

## Release Readiness
- [ ] Residual risks are documented with mitigation and owner.
- [ ] Rollback strategy is validated for latest change bundle.
- [ ] Plan is ready to move from `active/` to `inReview/`.

## Review Log Trigger
If any required item fails, create `review-log-YYYY-MM-DD.md` in this folder with:
1. failed check,
2. reproduction steps,
3. root cause,
4. fix applied,
5. re-test result.
