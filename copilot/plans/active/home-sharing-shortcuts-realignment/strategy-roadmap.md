# Home Sharing + Shortcuts Realignment — Strategy Roadmap

## Mission

Re-establish shortcut-first non-owner experience in Home so shared resources appear as recipient-owned shortcut cards (not direct source cards), with deterministic share-time shortcut creation for subjects and folders.

## Constraints

- Preserve source ownership model (`ownerId` remains unchanged on source documents).
- Keep single-parent hierarchy pointers (`parentId` for folders, `folderId` for subjects).
- Respect `institutionId` isolation in queries and rule-compatible write patterns.
- Maintain idempotent operations (safe re-run, no duplicate shortcuts).

## Canonical Behavior Targets

### Manual tab visibility
- Owner user sees owned source cards + owned shortcuts.
- Non-owner user sees:
  - owned source cards (if any), and
  - shortcuts where `shortcut.ownerId == currentUser.uid`.
- Non-owner user does **not** see source cards they do not own unless represented by a shortcut card.

### Share flow behavior
- Sharing a `subject` creates/ensures recipient shortcut to target subject.
- Sharing a `folder` creates/ensures recipient shortcut to target folder.
- Existing matching shortcut (`ownerId + targetId + targetType + parentId`) is reused/updated, not duplicated.

### Shortcut independence
- Shortcut card movement updates shortcut `parentId`, not source `parentId/folderId`.
- Shortcut deletion removes shortcut only, not source resource.

### Shared-folder shortcut internals (decision required)
When user A shares a folder with user B and B receives a folder shortcut, we must decide how inner content is exposed:

- **Option A — Recursive materialized shortcuts**
  - Create shortcuts for every descendant folder/subject under the shared root.
  - Pros: explicit cards per item, independent per-item placement.
  - Cons: high write amplification, heavy dedupe/cleanup/orphan complexity.

- **Option B — Single root shortcut with live projection**
  - Create one shortcut to the shared folder root; render descendants dynamically from source hierarchy in that shortcut context.
  - Pros: minimal writes, simpler dedupe, lower drift risk.
  - Cons: per-descendant independent shortcut moves require extra abstraction.

- **Initial recommendation for implementation start:** Option B (single root shortcut + live projection), then evolve to selective materialization only if a concrete UX need requires it.

## Phase Status

- Phase 00 — Baseline regression mapping: **TODO**
- Phase 01 — Shared-folder shortcut contents strategy decision (A vs B): **TODO**
- Phase 02 — Manual tab visibility contract enforcement: **TODO**
- Phase 03 — Share pipeline shortcut guarantees (subject/folder): **TODO**
- Phase 04 — Dedupe + idempotency hardening: **TODO**
- Phase 05 — Cross-view parity (grid/list/tree/manual): **TODO**
- Phase 06 — Verification + review checklist: **TODO**

## Phase Dependency Note

- Phase 02 and Phase 03 implementation details are blocked until Phase 01 decision is finalized.

## Risks and Mitigations

1. **Shortcut duplicate explosion**
- Mitigation: deterministic uniqueness key + pre-create query + cleanup pass.

2. **Mixed source + shortcut rendering for non-owner**
- Mitigation: central resolver in Home hooks; view components consume normalized output only.

3. **Permission/rules mismatch on shortcut dedupe query**
- Mitigation: align query paths with rule allowances validated in finished Phase 07 outcomes.

4. **DnD accidentally mutating source docs from shortcut moves**
- Mitigation: branch logic by item kind (`shortcut` vs `source`) before write dispatch.

## Deliverables

- Updated Home hooks for manual tab filtering and normalized content resolution.
- Updated share handlers for guaranteed shortcut creation (subject + folder).
- Updated dedupe guards and tests/checklist evidence in `reviewing/`.
