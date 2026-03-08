<!-- copilot/plans/todo/topic-linked-content-normalization/phases/phase-03-rules-and-index-hardening-planned.md -->
# Phase 03 - Rules and Index Hardening (PLANNED)

## Objective

Align Firestore security and indexing with the canonical relational model.

## Changes

- Update `/exams` rules to enforce tenant and ownership constraints using topic relation checks.
- Keep temporary compatibility only as needed during migration.
- Add required indexes for canonical query paths (`topicId`, `subjectId`, ordering fields).

## Risks

- Overly strict rules can block legitimate app reads/writes.
- Missing indexes can degrade UX or break query execution in production.

## Completion Notes

- Rules deployed and smoke-tested with role matrix.
- Indexes deployed and query latency validated.
