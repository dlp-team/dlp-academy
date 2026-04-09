<!-- copilot/plans/active/autopilot-plan-execution-2026-04-09/phases/phase-04-shortcuts-copy-cut-paste-undo-ownership.md -->
# Phase 04 - Shortcuts Copy/Cut/Paste Undo Ownership

## Status
- PLANNED

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
