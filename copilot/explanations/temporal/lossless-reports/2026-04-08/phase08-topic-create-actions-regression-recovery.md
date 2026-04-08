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

## Touched Files
- [src/pages/Topic/hooks/useTopicLogic.ts](../../../../../src/pages/Topic/hooks/useTopicLogic.ts)
- [src/pages/Topic/components/TopicTabs.tsx](../../../../../src/pages/Topic/components/TopicTabs.tsx)
- [src/pages/Topic/Topic.tsx](../../../../../src/pages/Topic/Topic.tsx)
- [tests/unit/pages/topic/TopicTabs.createActions.test.jsx](../../../../../tests/unit/pages/topic/TopicTabs.createActions.test.jsx)
- [tests/unit/hooks/useTopicLogic.test.js](../../../../../tests/unit/hooks/useTopicLogic.test.js)

## File-by-File Verification
1. `useTopicLogic.ts`
- Student gating now prefers explicit `user.role` when present before fallback role resolution.
- Prevents false student classification from suppressing edit/create permissions for teacher accounts.

2. `TopicTabs.tsx`
- Student tab layout decision now prefers explicit `user.role` when present.
- Prevents teacher create controls from disappearing due to fallback role ordering.

3. `Topic.tsx`
- Topic-level student/preview gating now prefers explicit `user.role` when present.
- Keeps tab normalization and assignment filtering aligned with account role and preview mode.

4. `TopicTabs.createActions.test.jsx`
- Added regression coverage verifying create controls stay visible when `user.role` is `teacher` even if fallback role resolver returns `student`.

5. `useTopicLogic.test.js`
- Added regression coverage verifying teacher permissions remain editable under the same mismatch scenario.

## Validation Summary
- `get_errors` on touched files: PASS
- `npm run test -- tests/unit/pages/topic/TopicTabs.createActions.test.jsx tests/unit/hooks/useTopicLogic.test.js`: PASS
- `npm run lint`: PASS
- `npx tsc --noEmit`: PASS

## Residual Risks
- Manual in-app verification is still recommended for dual-role sessions with explicit role switching UI to confirm expected UX for every role permutation.
