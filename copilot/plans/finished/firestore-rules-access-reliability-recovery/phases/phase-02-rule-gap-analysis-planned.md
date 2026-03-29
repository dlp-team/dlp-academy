# Phase 02 - Rule Intent Mapping and Gap Analysis (PLANNED)

## Objective
Identify exactly where rule predicates diverge from intended product permissions.

## Tasks
1. Build an intent table for key actions:
   - subject/folder read,
   - subject/folder move (drag/drop),
   - subject/folder delete,
   - share/unshare/ownership transfer side effects.
2. Evaluate current rules against matrix failures from Phase 01.
3. Classify gaps as:
   - false deny (legitimate action blocked),
   - false allow (unauthorized action allowed),
   - ambiguous (requires policy decision).

## Outputs
- `working/rule-intent-matrix.md`
- `working/gap-analysis.md`

## Completion Criteria
- Each failing operation is linked to at least one concrete predicate mismatch.
- High-risk false-allow candidates are flagged before remediation starts.