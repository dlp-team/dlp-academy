# Phase 06: Data Migration (Planned)

## Goal

Backfill legacy data to match shortcut-first architecture and new permission assumptions.

## Planned Work

- Identify legacy shared entities missing shortcut records.
- Translate legacy `sharedWith` object arrays into `editorUids` / `viewerUids`.
- Normalize hierarchy fields (legacy folder references to canonical `parentId` behavior where needed).
- Backfill `institutionId` for subjects/folders/shortcuts.
- Backfill shortcut visual fields where absent.
- Detect and optionally collapse duplicate shortcuts per `(ownerId, targetType, targetId)`.
- Validate orphan shortcut handling and recovery behavior.

## Execution Strategy

- Implement as one-time admin script (Node.js) or controlled admin UI trigger.
- Run dry-run mode first and emit a migration report (counts, changed docs, skipped docs, errors).
- Run idempotently so repeated executions do not corrupt data.

## Output

A one-time migration strategy and verification checklist before stricter rules are enforced.
