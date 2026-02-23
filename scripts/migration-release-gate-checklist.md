# Migration Release Gate Checklist

Use this checklist before marking backend migration changes complete.

## A. Migration Readiness

- [ ] Target preset exists and is reviewed
- [ ] `where` filters and `limit` are intentionally scoped
- [ ] Dry run executed and output reviewed
- [ ] Expected updated/scanned ratio is reasonable

## B. Execution Controls

- [ ] Real run command captured
- [ ] Service account source documented
- [ ] Batch limit choice documented
- [ ] Incident owner assigned for rollback decisions

## C. Data Verification

- [ ] Spot-check updated documents in Firestore
- [ ] Canonical fields are populated as expected
- [ ] Legacy fields removed only where intended
- [ ] No unrelated collections changed

## D. Security and Access Validation

- [ ] Firestore rules still allow intended read/write paths
- [ ] Negative permission tests fail as expected
- [ ] Queries needed by share/move/edit flows succeed

## E. Operability and Closure

- [ ] Rollback strategy selected and documented
- [ ] Review checklist completed in plan reviewing folder
- [ ] Failed checks (if any) logged with fixes
- [ ] Plan phase status updated with outcome evidence

## Sign-off

- Reviewer:
- Date:
- Result: PASS / FAIL
