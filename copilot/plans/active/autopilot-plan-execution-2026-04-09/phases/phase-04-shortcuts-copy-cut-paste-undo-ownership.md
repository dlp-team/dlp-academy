<!-- copilot/plans/active/autopilot-plan-execution-2026-04-09/phases/phase-04-shortcuts-copy-cut-paste-undo-ownership.md -->
# Phase 04 - Shortcuts Copy/Cut/Paste Undo Ownership

## Status
- IN_PROGRESS

## Objective
Enforce shortcut behavior for copy/cut/paste with owner-safe metadata, nested-content duplication, and undo consistency.

## Scope
- Ensure copied elements are not unintentionally shared and keep creator ownership.
- Extend undo semantics to shortcut-driven copy/cut/paste workflows as requested.
- Duplicate nested contents (topics, quizzes, documents, exams, and related structures).
- Handle required dependency data (academic year/course and other required references) by deterministic carry-over or guarded user prompt path.

## Risks
- Deep-copy traversal may duplicate stale IDs or break relation pointers.
- Ownership rewrite could conflict with institution-level sharing policies.

## Validation
- Targeted tests around shortcut handlers and copy builder functions.
- Integration checks for nested resource duplication integrity.
- `get_errors`, `npm run lint`, `npx tsc --noEmit`.

## Exit Criteria
- Shortcut copy/cut/paste produces correct ownership and non-shared defaults.
- Ctrl+Z reverses shortcut side effects according to policy.
- Nested resources are copied consistently with valid references.

## Implementation Update (2026-04-09)
- Added copy-flow undo parity for keyboard shortcuts:
	- subject copy now registers `create-subject` undo action,
	- folder copy now registers `create-folder` undo action.
- Added deep subject copy utility for keyboard paste (`cloneSubjectTopicsAndResources`) to duplicate:
	- topic documents,
	- topic-linked resources from `documents`, `resumen`, `quizzes`, `exams`, and `examns`.
- Added dynamic Firestore loading in keyboard paste flow to avoid always-on runtime coupling while enabling deep-copy on demand.

## Validation Evidence (2026-04-09)
- `get_errors` on touched runtime and test files -> PASS.
- `npx vitest run tests/unit/hooks/useHomeKeyboardShortcuts.test.js tests/unit/hooks/useHomeBulkSelection.test.js tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js tests/unit/hooks/useHomePageHandlers.dndMatrix.test.js` -> PASS (63 tests).
- `npm run lint` -> PASS.
- `npx tsc --noEmit` -> PASS.
