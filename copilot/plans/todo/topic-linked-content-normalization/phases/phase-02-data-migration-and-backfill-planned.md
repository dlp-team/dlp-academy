<!-- copilot/plans/todo/topic-linked-content-normalization/phases/phase-02-data-migration-and-backfill-planned.md -->
# Phase 02 - Data Migration and Backfill (PLANNED)

## Objective

Backfill and normalize stored data so all topic-linked records use canonical camelCase relations.

## Changes

- Migrate legacy keys (`topicid`, `topic_id`, `subject_id`) to camelCase.
- Backfill missing `topicId` and `subjectId` where derivable.
- Remove embedded duplicates from `topics` documents (`pdfs`, `quizzes`, and any analogous arrays).
- Produce migration reports (counts, failures, skipped docs).

## Risks

- Partial migration can silently hide content.
- Incorrect derivation of relation fields can orphan records.

## Completion Notes

- Dry-run and live-run logs stored in `working/`.
- Post-migration integrity checks pass for every affected collection.
