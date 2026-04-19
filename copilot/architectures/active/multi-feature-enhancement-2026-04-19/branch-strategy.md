<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/branch-strategy.md -->
# Branch Strategy — Multi-Feature Enhancement Architecture

---

## Branch Tree

```
development (parent)
└── arch/multi-feature-enhancement-2026-04-19 (base branch)
    ├── arch/multi-feature-enhancement-2026-04-19/phase-01-cursor-audit
    ├── arch/multi-feature-enhancement-2026-04-19/phase-02-theme-toggle
    ├── arch/multi-feature-enhancement-2026-04-19/phase-03-unsaved-changes
    ├── arch/multi-feature-enhancement-2026-04-19/phase-04-subject-uniqueness
    ├── arch/multi-feature-enhancement-2026-04-19/phase-05-subject-cascading
    ├── arch/multi-feature-enhancement-2026-04-19/phase-06-conduct-default
    ├── arch/multi-feature-enhancement-2026-04-19/phase-07-badges-schema
    ├── arch/multi-feature-enhancement-2026-04-19/phase-08-badges-auto
    ├── arch/multi-feature-enhancement-2026-04-19/phase-09-badges-manual-subject
    └── (phase-10 executes directly on base branch — final optimization)
```

---

## Branch Lifecycle

### Base Branch
- **Name**: `arch/multi-feature-enhancement-2026-04-19`
- **Parent**: `development`
- **Owner**: `hector`
- **Purpose**: Architecture package, coordination, final merge target for all sub-branches
- **Merge target**: `development` (after all phases complete and reviewed)

### Sub-Branch Rules

1. **Creation**: Each phase creates its sub-branch from the **base branch** (not from development)
2. **Naming**: `arch/multi-feature-enhancement-2026-04-19/phase-NN-<short-name>`
3. **Registration**: Each sub-branch registered in `BRANCHES_STATUS.md` on `development` before implementation
4. **Merge back**: Sub-branch merges into base branch after phase validation
5. **Cleanup**: Sub-branch marked `pending-delete` after merge into base
6. **Sequential dependency**: Phases with dependencies (04→03, 05→03+04, 08→07, 09→07+08) must wait for predecessor sub-branches to merge into base before starting

### Phase 10 Exception
Phase 10 (Final Optimization) executes directly on the base branch since it's a cross-cutting review of all work.

---

## Merge Sequence

```
Phase 01 → merge into base ✓
Phase 02 → merge into base ✓ (parallel with 01)
Phase 03 → merge into base ✓ (parallel with 01, 02)
Phase 04 → merge into base ✓ (after Phase 03 merged)
Phase 05 → merge into base ✓ (after Phase 03, 04 merged)
Phase 06 → merge into base ✓ (parallel with 01-05)
Phase 07 → merge into base ✓ (after Phase 06 merged)
Phase 08 → merge into base ✓ (after Phase 07 merged)
Phase 09 → merge into base ✓ (after Phase 07, 08 merged)
Phase 10 → on base branch (no sub-branch needed)
base → merge into development (final)
```

### Parallelization Opportunities
- Phases 01, 02, 03, 06 can run in parallel (no cross-dependencies)
- Phases 04, 05 are sequential (04 first, then 05)
- Phases 07, 08, 09 are sequential (badge chain)
- Phase 10 runs last

---

## Branch Registration Template

When creating each sub-branch, add to `BRANCHES_STATUS.md`:

```markdown
| arch/.../phase-NN-<name> | hector | feature | active | — | Phase NN: <description> | copilot/architectures/active/multi-feature-enhancement-2026-04-19/ | <key files> | YYYY-MM-DD | Sub-branch of arch/multi-feature-enhancement-2026-04-19 |
```

---

## Conflict Prevention Strategy

- Base branch stays current: pull from `development` before each phase merge
- Sub-branches pull from base branch before starting work
- If conflicts arise during merge, resolve on the sub-branch (not base)
- Run full test suite after conflict resolution before completing merge
