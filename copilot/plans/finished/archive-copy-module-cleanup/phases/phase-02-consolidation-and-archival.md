# Phase 02 - Consolidation and Archival

## Objective
Execute the physical removal or relocation of identified technical debt files.

## Action Items
- [ ] Delete files marked as `[Delete]` in Phase 01.
- [ ] Create `src/_deprecated` (if necessary) and move `[Archive]` files.
- [ ] Strip any dead exported types or references that might have been linking to them conditionally.

## Success Criteria
- Source directory is free of `*copy.tsx` and legacy `src/archive/` files.
