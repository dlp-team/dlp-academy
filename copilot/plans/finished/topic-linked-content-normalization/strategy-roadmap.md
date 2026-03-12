<!-- copilot/plans/todo/topic-linked-content-normalization/strategy-roadmap.md -->
# Topic-Linked Content Normalization - Strategy Roadmap

## Mission

Make all topic-related entities relational and deterministic by enforcing `topicId` as the canonical linkage key across reads, writes, rules, migrations, and validation.

## Guiding Principles

- Single source of truth per entity collection.
- Parent docs do not carry duplicated child arrays.
- Backward compatibility is temporary and explicit.
- Rules and indexes must evolve with query contracts.
- Every phase includes measurable verification criteria.

## Phase Status

- Phase 00 - System audit and canonical contract definition: **COMPLETED**
- Phase 01 - App contract normalization (`topicId` reads/writes): **COMPLETED**
- Phase 02 - Data migration and backfill (legacy to canonical): **IN_PROGRESS**
- Phase 03 - Firestore rules and index hardening: **PLANNED**
- Phase 04 - Compatibility removal and duplicate cleanup: **PLANNED**
- Phase 05 - Review gate and release closure: **PLANNED**

## Immediate Next Actions

1. Approve canonical contract from `working/audit-topic-linked-content-2026-03-08.md`.
2. Start Phase 01 with a lossless patch list (files, fields, and query contracts).
3. Define migration runbook (dry-run, live-run, post-run integrity checks) before code rollout.
