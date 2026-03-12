<!-- copilot/plans/todo/topic-linked-content-normalization/phases/phase-00-audit-and-contract-planned.md -->
# Phase 00 - Audit and Contract (PLANNED)

## Objective

Produce a precise baseline and define the canonical data contract for all topic-linked entities.

## Changes

- Inventory all read/write paths for `documents`, `resumen`, `quizzes`, `exams`, and results.
- Map current field variants (`topicId`, `topicid`, `topic_id`) and embedded arrays.
- Publish canonical schema and compatibility rules.

## Risks

- Hidden write paths may keep generating legacy field variants.
- Rules assumptions can diverge from app assumptions.

## Completion Notes

- Baseline audit completed in `working/audit-topic-linked-content-2026-03-08.md`.
- Canonical contract approved by product/engineering.
