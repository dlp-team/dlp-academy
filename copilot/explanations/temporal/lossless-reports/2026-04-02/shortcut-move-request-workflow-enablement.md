<!-- copilot/explanations/temporal/lossless-reports/2026-04-02/shortcut-move-request-workflow-enablement.md -->
# Lossless Report - Shortcut Move Request Workflow Enablement

## Requested Scope
Implement end-to-end shortcut move request workflow:
- callable request creation,
- owner approve/reject resolution,
- Home/notifications UI wiring,
- least-privilege Firestore rules,
- deterministic unit/rules coverage,
- documentation synchronization.

## Preserved Behaviors (Explicit)
- Existing shortcut drag/drop paths outside shared target folders remain unchanged.
- Existing Home share/unshare mismatch confirmation flows remain active.
- Existing notifications read/list behavior remains intact for non-move-request notification types.
- Existing role-based dashboard and active-role shell synchronization in Header remains unchanged.
- Existing Firestore rules for non-target collections are unchanged except additive `shortcutMoveRequests` block.

## Touched Files
### Backend
- `functions/index.js`

### Frontend
- `src/services/shortcutMoveRequestService.ts`
- `src/pages/Home/hooks/useHomePageHandlers.ts`
- `src/pages/Home/Home.tsx`
- `src/hooks/useNotifications.tsx`
- `src/components/ui/NotificationsPanel.tsx`
- `src/components/layout/Header.tsx`

### Security Rules
- `firestore.rules`

### Tests
- `tests/rules/firestore.rules.test.js`
- `tests/unit/services/shortcutMoveRequestService.test.js`
- `tests/unit/components/NotificationsPanel.test.jsx`
- `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`

### Plan / Docs
- `copilot/plans/active/shortcut-move-request-workflow-enablement/README.md`
- `copilot/plans/active/shortcut-move-request-workflow-enablement/strategy-roadmap.md`
- `copilot/plans/active/shortcut-move-request-workflow-enablement/phases/phase-01-request-creation-foundation.md`
- `copilot/plans/active/shortcut-move-request-workflow-enablement/phases/phase-02-owner-review-and-resolution.md`
- `copilot/plans/active/shortcut-move-request-workflow-enablement/phases/phase-03-rules-and-test-hardening.md`
- `copilot/plans/active/shortcut-move-request-workflow-enablement/phases/phase-04-final-validation-and-closure.md`
- `copilot/plans/active/shortcut-move-request-workflow-enablement/reviewing/verification-checklist.md`
- `copilot/plans/active/shortcut-move-request-workflow-enablement/working/execution-log.md`
- `copilot/explanations/codebase/functions/index.md`
- `copilot/explanations/codebase/src/pages/Home/hooks/useHomePageHandlers.md`
- `copilot/explanations/codebase/src/hooks/useNotifications.md`
- `copilot/explanations/codebase/src/components/layout/Header.md`
- `copilot/explanations/codebase/src/pages/Home/Home.md`
- `copilot/explanations/codebase/firestore.rules.md`
- `copilot/explanations/codebase/tests/rules/firestore.rules.test.md`
- `copilot/explanations/codebase/tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.md`
- `copilot/explanations/codebase/src/services/shortcutMoveRequestService.md` (new)
- `copilot/explanations/codebase/src/components/ui/NotificationsPanel.md` (new)
- `copilot/explanations/codebase/tests/unit/components/NotificationsPanel.test.md` (new)
- `copilot/explanations/codebase/tests/unit/services/shortcutMoveRequestService.test.md` (new)

## Per-File Verification Notes
- `functions/index.js`: added callable guards, duplicate prevention, owner/requester notifications, folder cycle prevention, share propagation, and chunked batch commit helper.
- `src/pages/Home/hooks/useHomePageHandlers.ts`: replaced placeholder shortcut-move-request TODO logs with callable submission and explicit Home feedback handling.
- `src/hooks/useNotifications.tsx`: added resolution action API and resolving state for owner action buttons.
- `src/components/ui/NotificationsPanel.tsx`: added pending request approve/reject controls and non-subject safe click behavior.
- `src/components/layout/Header.tsx`: connected panel actions to hook API and added toast outcomes for resolve success/failure.
- `firestore.rules`: added read-scoped `shortcutMoveRequests` block and deny-all direct client writes.
- `tests/rules/firestore.rules.test.js`: added allow/deny coverage for requester/owner/admin boundaries and write deny paths.
- New unit tests validate callable payload contract + notification action dispatch + Home confirmation callable path.

## Validation Summary
- `get_errors` on all touched source/rules/test files: clean.
- `npm run test:unit -- tests/unit/services/shortcutMoveRequestService.test.js`: passed.
- `npm run test:unit -- tests/unit/components/NotificationsPanel.test.jsx tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js tests/unit/services/shortcutMoveRequestService.test.js`: passed.
- `npm run test`: passed (`110` files, `509` tests).
- `npm run test:rules`: passed (`65` tests under emulator run).
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with existing non-blocking warnings in unrelated files (`src/pages/Content/Exam.jsx`, `src/pages/Content/StudyGuide.jsx`).
