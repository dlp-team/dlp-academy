<!-- copilot/plans/todo/archive-copy-module-cleanup/README.md -->
# Archive and Copy Module Cleanup Plan

## Problem Statement
The workspace still contains duplicate and archived runtime-like modules (for example `*copy.tsx` and `src/archive/*.jsx`) that can drift from canonical implementations and create maintenance risk.

## Scope
- Inventory duplicate/archive files in active source paths.
- Classify each file as keep, archive, or remove.
- Preserve canonical runtime modules and avoid behavior changes.
- Add traceable migration notes for each cleanup action.

## Non-Goals
- Functional redesign of stable features.
- Broad refactors outside duplicate/archive cleanup.
- Deployment actions.

## Current Status
- Lifecycle: `finished`
- Current phase: `Completed`
- Last updated: `2026-04-01`

## Artifacts
- `strategy-roadmap.md`
- `phases/phase-01-inventory-and-ownership.md`
- `phases/phase-02-consolidation-and-archival.md`
- `phases/phase-03-validation-and-prune.md`
- `reviewing/release-checklist.md`

## Exit Criteria
- No runtime-relevant duplicate source modules remain in active paths.
- Archive-only files are clearly isolated and documented.
- Lint, test, and build gates remain green after cleanup.

## 🚦 Next Session Handoff
**To the next agent picking this up:**
1. **Initialize the Plan**: Create `strategy-roadmap.md` and the `phases/` directory if they don't exist yet.
2. **Execute Phase 01**: Scan `src/archive/` (e.g., `BinView0.tsx`, `*copy.tsx`, `topicsimulation.tsx`) and any other duplicate files.
3. **Draft Archival Strategy**: Propose to the user which files can be safely deleted versus which need to remain in a `_deprecated` folder.
4. **Clean up Test Backlog**: Check `tests/missing-tests-net-new.md` to begin writing the missing unit/e2e tests for newly migrated `.tsx` files once the cleanup is done.
