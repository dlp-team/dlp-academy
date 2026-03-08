<!-- copilot/plans/todo/topic-linked-content-normalization/phases/phase-01-app-contract-normalization-planned.md -->
# Phase 01 - App Contract Normalization (PLANNED)

## Objective

Normalize app-side reads and writes to use canonical relational fields (`topicId`, `subjectId`) for all topic-linked content.

## Changes

- Replace exam queries based on `topicid` with canonical query path.
- Ensure exam creation/update paths always write `topicId` and `subjectId`.
- Remove logic that depends on embedded `topic.pdfs` and `topic.quizzes` as data sources.
- Keep a temporary compatibility reader only where required by migration window.

## Risks

- Mixed legacy data can make UI appear empty if compatibility handling is removed too early.
- Incomplete write-path normalization can reintroduce drift.

## Completion Notes

- All app query/write paths for topic-linked entities validated as canonical.
- Topic page shows exams/quizzes/documents using the same relation model.
