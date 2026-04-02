<!-- copilot/plans/active/shortcut-move-request-workflow-enablement/working/execution-log.md -->
# Execution Log

## 2026-04-02
- Plan package created from `copilot/todo/shortcut-move-request-workflow.md` backlog item.
- Plan lifecycle transitioned `todo` -> `active`.
- Started Phase 01 implementation (callable-backed request creation foundation).
- Implemented backend callables in `functions/index.js`:
	- `createShortcutMoveRequest`,
	- `resolveShortcutMoveRequest`.
- Added frontend callable service `src/services/shortcutMoveRequestService.ts`.
- Wired Home request submission flow in `src/pages/Home/hooks/useHomePageHandlers.ts` and feedback propagation from `src/pages/Home/Home.tsx`.
- Added owner approve/reject notification actions across:
	- `src/hooks/useNotifications.tsx`,
	- `src/components/ui/NotificationsPanel.tsx`,
	- `src/components/layout/Header.tsx`.
- Added least-privilege `shortcutMoveRequests` Firestore rule block.
- Added/updated tests:
	- `tests/rules/firestore.rules.test.js`,
	- `tests/unit/services/shortcutMoveRequestService.test.js`,
	- `tests/unit/components/NotificationsPanel.test.jsx`,
	- `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`.

### Validation Commands
- `npm run test:unit -- tests/unit/services/shortcutMoveRequestService.test.js` (passed)
- `npm run test:rules` (passed)
- `npm run test:unit -- tests/unit/components/NotificationsPanel.test.jsx tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js tests/unit/services/shortcutMoveRequestService.test.js` (passed)
- `npm run test` (passed, 110 files / 509 tests)
- `npx tsc --noEmit` (passed)
- `npm run lint` (passed with warnings only)
- `get_errors` on all touched source/rules/tests (clean)

