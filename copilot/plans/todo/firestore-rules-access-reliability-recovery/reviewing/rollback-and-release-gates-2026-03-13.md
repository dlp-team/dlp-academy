# Rollback and Release Gates

## Rollback Preconditions
- Preserve pre-change `firestore.rules` snapshot before first remediation patch.
- Group rule edits by behavior domain for selective rollback.

## Rollback Triggers
- New false-allow path discovered.
- Critical e2e authorization regression in unaffected flow.
- Inability to explain deny/allow outcomes with deterministic predicates.

## Rollback Steps
1. Revert latest rules batch.
2. Re-run targeted authorization tests.
3. Re-run impacted e2e specs.
4. Re-open gap analysis and re-scope predicate edits.

## Release Gates
- Targeted auth tests green.
- Targeted e2e specs green for reported failures.
- Full e2e suite green.
- Security sign-off: no broadening without role/ownership/institution checks.
