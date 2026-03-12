<!-- copilot/plans/todo/topic-linked-content-normalization/phases/phase-04-compatibility-removal-and-cleanup-planned.md -->
# Phase 04 - Compatibility Removal and Cleanup (PLANNED)

## Objective

Remove temporary dual-schema logic and finish duplicate cleanup after migration confidence window.

## Changes

- Remove fallback reads/writes for legacy fields.
- Remove stale embedded array dependencies from status or UI side logic.
- Archive migration scripts and publish final schema contract.

## Risks

- Premature fallback removal can regress legacy data paths not migrated.

## Completion Notes

- Codebase references to `topicid`, `topic_id`, and embedded topic content arrays reduced to zero (excluding archives/docs).
