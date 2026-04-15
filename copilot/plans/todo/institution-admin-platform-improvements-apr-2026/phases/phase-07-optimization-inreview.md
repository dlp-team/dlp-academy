# Phase 7 — Final Optimization + InReview

## Status: TODO

## Objectives

### 7A — Optimization and Consolidation
- Centralize any repeated logic introduced across phases 1-6
- Split any files that grew beyond ~500 lines
- Improve readability (naming, structure) without behavior drift
- Run `npm run lint` — resolve all errors from touched files
- Re-validate tests after optimization changes

### 7B — Deep Risk Analysis
Perform exhaustive risk analysis covering:
- [ ] **Security & permissions**: new features don't expose unintended data or bypass role checks
- [ ] **Data integrity**: no Firestore writes that could corrupt institution data
- [ ] **Auth changes** (Phase 4): email verification does not lock out legitimate users
- [ ] **Runtime failure modes**: what happens if Firebase email verification service is down?
- [ ] **Edge cases**: unverified existing users, admin without institution, empty states
- [ ] **Cross-role regressions**: verify teacher/student flows unaffected by admin changes

### 7C — Out-of-Scope Risk Logging
Document any discovered risks outside this plan's scope in:
[copilot/plans/out-of-scope-risk-log.md](../../out-of-scope-risk-log.md)

## Closure Gate
This plan cannot move to `finished` until:
- [ ] Optimization checklist completed
- [ ] Risk analysis documented
- [ ] Any out-of-scope risks logged
- [ ] Final `npm run test` clean pass
- [ ] Human merge authorization obtained per BRANCH_LOG

## Commits Required
1. Optimization commits per area
2. `docs(plan): Add inReview risk analysis and finalization`
