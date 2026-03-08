<!-- copilot/plans/todo/topic-linked-content-normalization/README.md -->
# Topic-Linked Content Normalization Plan

## Problem Statement

Topic content is currently in a mixed state:

- Some entities already load from root collections with `topicId` (`documents`, `resumen`, `quizzes`).
- Exams are still queried with `topicid` (lowercase), which breaks consistency and can hide data in Topic view.
- Legacy embedded arrays (`topic.pdfs`, `topic.quizzes`) still influence side logic and increase duplication risk.

This plan standardizes all topic-linked content to the same relational model used in Home/Folder/Subject: child docs reference parent with `topicId` and are queried by relation.

## Scope

- Canonical schema for topic-linked content (`documents`, `resumen`, `quizzes`, `exams`, and related result records).
- App read/write normalization to `topicId` and `subjectId`.
- Data migration/backfill for legacy fields (`topicid`, `topic_id`, embedded arrays).
- Firestore rules and indexes alignment for normalized queries.
- Verification and rollback-ready rollout strategy.

## Non-Goals

- Visual redesign of Topic/Quiz/Exam screens.
- Replacing current route structure (`/home/subject/:subjectId/topic/:topicId/...`).
- Large unrelated refactors outside topic-linked data contracts.

## Current Status Summary

- Plan state: **TODO**
- Current phase: **Phase 00 - System audit and canonical contract definition (PLANNED)**
- Audit artifact: `working/audit-topic-linked-content-2026-03-08.md`

## Key Decisions

1. Use relation-based ownership model: children point to parents (`topicId`, `subjectId`), parents do not embed child arrays.
2. Canonical field names are camelCase only (`topicId`, `subjectId`, `ownerId`, `institutionId`).
3. During rollout, dual-read/dual-write compatibility is temporary and timeboxed.
4. Exams must follow the same contract as quizzes/documents (no special casing by lowercase keys).

## Assumptions

- Existing root collections are the long-term source of truth.
- Legacy documents may still exist with `topicid` or `topic_id`.
- Security rules can be tightened after migration and compatibility window.

## Plan Artifacts

- `strategy-roadmap.md`: sequencing and phase status source of truth.
- `phases/`: detailed phase execution files.
- `working/`: audit, diagnostics, and migration notes.
- `reviewing/`: verification checklists and review logs.
