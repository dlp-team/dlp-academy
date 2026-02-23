# Verification Checklist Template

Use this checklist when backend-critical changes are implemented.

## Migration Safety

- [ ] Dry run executed and output reviewed
- [ ] Real run executed with expected updated/scanned counts
- [ ] Spot-check documents in Firestore confirm expected field-level updates
- [ ] No unintended field deletions/overwrites detected

## Rules and Access

- [ ] Firestore rules changes validated for intended roles
- [ ] Share/edit/read flows pass after migration changes
- [ ] Negative-path permission checks fail as expected

## Operational Readiness

- [ ] Rollback path documented for this change
- [ ] Release gate checklist completed
- [ ] Known risks and follow-ups captured

## Sign-off

- Reviewer:
- Date:
- Result: PASS / FAIL
