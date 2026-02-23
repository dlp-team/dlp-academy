# Pre-Production Resume Checklist

Use this checklist when resuming the Backend Critical Additions plan before production.

## 1) Re-sync Context

- [ ] Read `README.md` and `strategy-roadmap.md`
- [ ] Confirm current release target date and hardening window
- [ ] Confirm plan folder is in `copilot/plans/active/`

## 2) Validate Technical Baseline

- [ ] Review latest `firestore.rules` changes since postponement
- [ ] Review latest `firestore.indexes.json` changes since postponement
- [ ] Review latest migration presets in `scripts/migrations/`
- [ ] Re-check migration runner behavior in `scripts/run-migration.cjs`

## 3) Restart Phase 02

- [ ] Update rules matrix in `working/rules-validation-matrix.md` with current flows
- [ ] Add checklist-based validation run in `reviewing/`
- [ ] Execute positive + negative permission checks
- [ ] Capture failures in a review log if any check fails

## 4) Move Through Remaining Phases

- [ ] Execute Phase 03 tasks (operability + rollback readiness)
- [ ] Execute Phase 04 tasks (review gate + closure evidence)
- [ ] Move plan to `inReview/` only when required checks are complete

## 5) Finish Criteria

- [ ] Required review checklist items are all PASS
- [ ] Any failures have documented fixes + re-test evidence
- [ ] Roadmap and phase files are updated to COMPLETED
- [ ] Plan can be moved to `copilot/plans/finished/`
