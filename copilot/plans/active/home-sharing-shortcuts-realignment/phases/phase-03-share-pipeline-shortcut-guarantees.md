# Phase 02 — Share Pipeline Shortcut Guarantees

## Goal
Guarantee shortcut creation for recipient whenever a subject/folder is shared.

## Scope
- Subject share: enforce `ensureShortcutForRecipient(subject)`.
- Folder share: enforce `ensureShortcutForRecipient(folder)`.
- Use idempotent pre-check query + create/update behavior.

## Constraints
- No source ownership mutation.
- Respect institution boundaries.
- Rule-compatible read/write sequence.

## Exit Criteria
- Every successful share emits exactly one recipient shortcut per target scope.
