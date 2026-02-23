# DLP Academy Refactor Strategy Roadmap

## Mission

Evolve Home/Folder/Subject architecture into a robust hierarchical model, then extend to a Google Drive-style Shortcut model for multi-tenant organization without mutating source ownership structure.

## Guiding Principles

- Single source of truth per entity (`ownerId`, `parentId`).
- No multi-parent writes on source entities.
- Move/share operations must be deterministic and safe to re-run.
- UI should remain feature-complete and responsive.
- Data hooks absorb complexity; views receive normalized data.
- Multi-tenant boundaries (`institutionId`) are mandatory for production isolation.

## Canonical Schema Direction

### Core entities (subjects/folders)

- `ownerId: string`
- `parentId: string | null`
- `editorUids: string[]`
- `viewerUids: string[]`
- `institutionId: string`

### shortcuts collection

- `id: string`
- `ownerId: string` (shortcut owner / recipient)
- `parentId: string | null`
- `targetId: string`
- `targetType: 'subject' | 'folder'`
- `institutionId: string`
- `createdAt: timestamp`

## Current Phase Status

- Phase 00 — Baseline & dependency audit: **COMPLETED**
- Phase 01 — Hierarchical Home stabilization: **COMPLETED**
- Phase 02 — Shortcuts architecture foundation + fixes: **COMPLETED**
- Phase 03 — Permission-driven Lecture/Edit mode rollout: **COMPLETED**
- Phase 04 — Shortcut-aware DnD & content resolution: **COMPLETED**
- Phase 05 — Multi-tenant scope: **IN_PROGRESS**
- Phase 06 — Data migration: **PLANNED**
- Phase 07 — Firestore security rules rewrite: **PLANNED**

## Critical Production Safeguards

1. Firestore Security Rules rewrite (mandatory)
- Rules must support `editorUids`, `viewerUids`, and `shortcuts` behaviors.
- Share flow must allow: source update + shortcut existence check + shortcut create.

2. One-time data migration (mandatory)
- Convert legacy `sharedWith` object arrays and old hierarchy fields into new schema.
- Backfill `institutionId` and shortcut visual fields where missing.

3. Orphaned shortcut handling (mandatory)
- If shortcut target is deleted/unshared, UI must render a ghost card and allow removing shortcut.

4. Institution boundary enforcement (mandatory)
- Queries and rules must enforce `institutionId` tenant isolation.

## Immediate Next Actions

1. Execute Phase 05 tenant constraints and query contract implementation.
2. Define/execute Phase 06 migration script + verification report.
3. Complete Phase 07 least-privilege rules and validation matrix.
4. Run end-to-end regression for share, reshare, unshare, move, orphan, and cross-tenant isolation states.