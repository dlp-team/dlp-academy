# Strategy Roadmap: Archive and Copy Module Cleanup

## High-Level Objective
Safely inventory, classify, and prune/archive leftover duplicate and legacy modules (`*copy.tsx`, `src/archive/*`, etc.) to reduce technical debt and prevent drift, without impacting the production build.

## Phase Breakdown

### Phase 01 - Inventory and Ownership Mapping
- Deep scan of `src/` to identify all files with `copy`, `archive`, or `simulation` in their path/name.
- Categorize each file: 
  - **Delete**: Unused exact copies or legacy scratch files.
  - **Archive**: Moved to a dedicated, ignored `_deprecated` folder (if historical reference is strictly needed).
  - **Keep**: False positives (if any).

### Phase 02 - Consolidation and Archival
- Remove "Delete" candidates from the file system.
- Move "Archive" candidates to the designated graveyard.
- Clean up any stray imports or dead links pointing to these files.

### Phase 03 - Validation and Prune
- Run `npm run lint`, `npx tsc --noEmit`.
- Run `npm run build` to ensure production bundle integrity.
- Run `npm run test` to verify no test files were inadvertently broken.

## Rollback Plan
- All file deletions will be handled within a single git commit.
- If the build fails sequentially, `git reset --hard HEAD` and re-evaluate dependencies.
