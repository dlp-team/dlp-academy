# Phase 02 — Shared Home Abstractions (PLANNED)

## Objective
Extract and unify repeated Home behaviors into shared utilities/hooks with lossless semantics.

## Planned changes
- Introduce narrowly scoped shared helpers for repeated merge/share/unshare branches.
- Reduce duplicate condition trees while preserving permissions and mode parity.
- Keep public contracts stable unless explicitly approved.

## Risks
- Subtle behavior drift in edge-case permissions.
- Touching too many files in a single iteration.
