<!-- copilot/explanations/temporal/lossless-reports/2026-04-08/phase08-topic-create-actions-regression-recovery.md -->
# Lossless Report - Phase 08 Topic Create Actions Regression Recovery

## Requested Scope
- Recover missing Topic create actions (study guide, exam, quiz) using `main` behavior as baseline.
- Keep existing permission model and read-only preview behavior intact.

## Preserved Behaviors
- `permissions.canEdit` remains the mandatory gate for rendering create controls.
- Student view remains read-only.
- Preview-as-student flow in Topic remains read-only and unchanged.
- Existing handlers for study guide/exam/quiz creation remain unchanged in behavior.

## Reopened Runtime Root Cause (2026-04-08)
- User validation reported create controls still missing after initial patch.
- Deep comparison against `origin/main` + runtime gating trace identified two gaps:
	- Mixed-role contexts could still collapse into student-mode gating.
	- Legacy topic docs without full permission metadata failed `canEdit(topic, user.uid)` checks despite subject-level ownership/edit rights.

## Touched Files
- [src/pages/Topic/hooks/useTopicLogic.ts](../../../../../src/pages/Topic/hooks/useTopicLogic.ts)
- [src/pages/Topic/components/TopicTabs.tsx](../../../../../src/pages/Topic/components/TopicTabs.tsx)
- [src/pages/Topic/Topic.tsx](../../../../../src/pages/Topic/Topic.tsx)
- [tests/unit/pages/topic/TopicTabs.createActions.test.jsx](../../../../../tests/unit/pages/topic/TopicTabs.createActions.test.jsx)
- [tests/unit/hooks/useTopicLogic.test.js](../../../../../tests/unit/hooks/useTopicLogic.test.js)

## File-by-File Verification
1. `useTopicLogic.ts`
- Student gating now requires both normalized profile role and active role to resolve to `student` before forcing read-only branch.
- Topic permission checks now evaluate an enriched permission target that inherits missing `ownerId`/share metadata from subject context.

2. `TopicTabs.tsx`
- Student tab layout now uses the same dual-role resolution (`profile role` + `active role`) used by Topic logic.
- Prevents mixed-role sessions from hiding create controls when teacher context is active.

3. `Topic.tsx`
- Topic-level student/preview gating now aligns with dual-role resolution to avoid false student locking.
- Keeps tab normalization and assignment filtering aligned with active teacher context and preview mode.

4. `TopicTabs.createActions.test.jsx`
- Added regression coverage for both mixed-role mismatch directions to keep create controls visible when either role context remains teacher.

5. `useTopicLogic.test.js`
- Added regression coverage verifying topic permission inheritance from subject owner metadata when topic owner fields are missing.

## Validation Summary
- `get_errors` on touched files: PASS
- `npm run test -- tests/unit/pages/topic/TopicTabs.createActions.test.jsx tests/unit/hooks/useTopicLogic.test.js`: PASS
- `npm run lint`: PASS
- `npx tsc --noEmit`: PASS

## Residual Risks
- Manual in-app verification is still recommended for dual-role sessions with explicit role switching UI to confirm expected UX for every role permutation.
