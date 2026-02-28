# Home Sharing + Shortcuts Realignment — Strategy Roadmap

### Decision Track
1. Manual tab visibility contract (done)
2. Share pipeline shortcut guarantees (done)
3. Dedupe and idempotency (done)
4. Orphan shortcut behavior (done)
5. Cross-view parity (in progress)
6. Verification and handoff
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

### Shared-folder shortcut internals (decision locked)
When user A shares a folder with user B and B receives a folder shortcut, inner content strategy is:

- **Option A — Recursive materialized shortcuts**
  - Create shortcuts for every descendant folder/subject under the shared root.
  - Pros: explicit cards per item, independent per-item placement.
  - Cons: high write amplification, heavy dedupe/cleanup/orphan complexity.

- **Option B — Single root shortcut with live projection**
  - Create one shortcut to the shared folder root; render descendants dynamically from source hierarchy in that shortcut context.
  - Pros: minimal writes, simpler dedupe, lower drift risk.
  - Cons: per-descendant independent shortcut moves require extra abstraction.

- **Selected approach:** Option B (single root shortcut + live projection), with future selective materialization only if a concrete UX requirement appears.

## Phase Status

- Phase 00 — Baseline regression mapping: **COMPLETED**
- Phase 01 — Shared-folder shortcut contents strategy decision (A vs B): **COMPLETED**
- Phase 02 — Manual tab visibility contract enforcement: **IN_PROGRESS**
- Phase 03 — Share pipeline shortcut guarantees (subject/folder): **IN_PROGRESS**
- Phase 04 — Dedupe + idempotency hardening: **TODO**
- Phase 05 — Cross-view parity (grid/list/tree/manual): **TODO**
- Phase 06 — Verification + review checklist: **TODO**

## Phase Dependency Note

- Phase 01 decision is finalized (Option B), so Phase 03 and Phase 04 can proceed without architectural ambiguity.

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
