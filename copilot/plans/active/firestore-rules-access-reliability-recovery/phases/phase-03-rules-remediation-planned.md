# Phase 03 - Surgical Rule Remediation (PLANNED)

## Objective
Apply minimal, lossless edits to `firestore.rules` to resolve false denies without introducing false allows.

## Tasks
1. Edit rules in small logical batches (by action family).
2. After each batch:
   - run rule-focused validation,
   - run targeted e2e subset for impacted behaviors.
3. Maintain a change log of predicate-level rationale.

## Change Constraints
- No broad allow clauses.
- Keep institution and role boundaries explicit.
- Preserve existing protections not tied to failure matrix.

## Completion Criteria
- All Phase 01 failures resolved in targeted validation.
- No new unauthorized paths introduced in negative tests.