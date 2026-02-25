# Home Sharing + Shortcuts Realignment Plan

## Purpose

Restore and lock the intended Home behavior after conflicting changes:

1. In `manual` tab, non-owners must only see their own items **or shortcuts they own**.
2. Sharing a folder or subject must create a shortcut for each recipient.
3. Recipient shortcut cards must behave independently in Home (position/parent/move/delete shortcut), without mutating source ownership.

## Context

This plan aligns with the completed reorganization roadmap in `copilot/plans/finished/firestore-collections-reorganization/strategy-roadmap.md`, specifically:
- recipient-facing shortcut model,
- single-source relationships via `parentId` and `folderId`,
- deterministic share + dedupe behavior,
- institution isolation and security rules compatibility.

## Scope

### In scope
- Home data resolution and filtering for manual tab visibility.
- Share flow for `subject` and `folder` to ensure recipient shortcut creation.
- Decision and implementation for shared-folder shortcut internals:
	- recursive child shortcuts materialization, or
	- live projection from a single folder shortcut root.
- Shortcut deduplication and idempotency during repeated share calls.
- Folder/list/tree/manual views consistency for owner-vs-shortcut visibility.
- Regression checks for drag/drop and delete interactions with shortcuts.

### Out of scope
- New UI paradigms, redesigns, or non-sharing feature additions.
- Rewriting finished migration scripts unless required by blocker.

## Success Criteria

- Manual tab never shows non-owned source cards directly to non-owner users.
- Recipient always gets shortcut cards on share (subject and folder).
- Re-sharing does not create duplicate shortcuts.
- Owner cards remain source of truth; recipient shortcut edits do not mutate ownership.
- Drag/drop and delete preserve shortcut semantics.

## Status

- Lifecycle state: `ACTIVE`
- Source of truth sequencing: `strategy-roadmap.md` in this folder
- Phase docs: `phases/`
- Validation artifacts: `reviewing/`
