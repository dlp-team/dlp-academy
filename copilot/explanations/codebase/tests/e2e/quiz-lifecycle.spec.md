// copilot/explanations/codebase/tests/e2e/quiz-lifecycle.spec.md

## Changelog
### 2026-04-01: Role-aware quiz start stabilization
- Added student-mode toggle step when available before quiz-start assertions.
- Added fallback navigation to deterministic quiz route when topic-level CTA is unavailable due role/assignment gating.
- Preserved completion and return-to-topic coverage while removing role-dependent flakiness.

## Overview
This suite validates end-to-end quiz lifecycle behavior for a deterministic seeded subject/topic/quiz context, including quiz completion persistence and retry flow.

## Notes
- Depends on seeded E2E credentials and optional admin context for result assertions.
- Uses resilient route handling to support teacher/student surface differences without weakening completion validation.