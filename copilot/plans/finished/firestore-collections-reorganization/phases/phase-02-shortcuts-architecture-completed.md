# Phase 02 — Shortcuts Architecture Foundation
Status: IN_PROGRESS

## Why this phase exists
Shared multi-tenant organization cannot safely mutate source item `parentId` for every user. We need per-user placement using shortcut pointers while preserving owner structure.

## Architecture acknowledged
- Source entities (`subjects`, `folders`) remain single-parent, single-owner.
- Sharing model shifts to `editorUids` / `viewerUids` arrays.
- New root collection `shortcuts` stores user-local placement of shared targets.

## Gemini task integrated into this phase

### Shortcut schema
- `id`
- `ownerId`
- `parentId`
- `targetId`
- `targetType: 'subject' | 'folder'`
- `createdAt`

### Planned execution tracks
1. **Permission model track**
   - Introduce `canEdit` policy in Home/Topic surfaces.
   - Keep lecture mode clean/read-only.

2. **DnD interception track**
   - Detect shared-item drop into personal folders.
   - Create `shortcuts` doc instead of mutating source `parentId`.

3. **Data resolution track**
   - Query direct items + shortcuts for folder view.
   - Resolve shortcut targets and return normalized merged data.
   - Provide UI metadata (`isShortcut`, `shortcutId`, `targetType`) while keeping UI components mostly unaware.

## Progress done so far
- Roadmap and phase sequencing aligned with shortcut-first architecture.
- Existing hierarchy layer stabilized to reduce moving-target risk before shortcut integration.
- Implementable next backlog defined.

## Definition of done for this phase
- `shortcuts` collection integrated in hooks.
- Shared-item custom placement works without source parent mutation.
- UI renders merged folder contents seamlessly with shortcut metadata.
- No regression on existing owner flows.

## Risks and mitigations
- **Risk:** Duplicate item rendering from direct + shortcut paths.
  - **Mitigation:** deterministic dedupe by `{targetType}:{targetId}` per view context.
- **Risk:** Permission drift during mixed legacy/new sharing fields.
  - **Mitigation:** adapter layer and temporary fallback checks during transition.
