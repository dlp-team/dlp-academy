# Copilot Architectures

**Purpose:** This folder contains architecture-level plans — the most comprehensive, exhaustive, and battle-tested planning artifacts in the DLP Academy development process.

**Architectures vs Plans:** An architecture is 5–30x more complete than a regular plan. It demands deep analysis of every edge case, exhaustive test coverage (vitest + Playwright e2e), centralized code, full documentation, and threat analysis. Think of it as the "final boss" of plans.

---

## Structure

- `todo/` — Architectures drafted but not started.
- `active/` — Architectures currently being executed.
- `inReview/` — Implementation complete, undergoing deep verification.
- `finished/` — Fully verified, closed, and documented.
- `archived/` — Cancelled, superseded, or paused architectures retained for reference.

## Architecture Lifecycle

1. Create in `todo/`.
2. Move to `active/` when implementation starts (branch must be created first).
3. Keep all internal documents synchronized during execution.
4. Move to `inReview/` after all phases are implemented and validated.
5. Move to `finished/` only after deep review gates pass.
6. Move to `archived/` if cancelled or superseded.

## Architecture Directory Organization

Each architecture folder must include:

```
<architecture-name>/
├── README.md                   # Problem statement, scope, status, branch strategy
├── strategy-roadmap.md         # Master sequencing, phase status, source of truth
├── threat-analysis.md          # Security, data integrity, runtime failure analysis
├── centralization-audit.md     # Code deduplication and centralization opportunities
├── test-strategy.md            # Complete test plan (vitest unit + Playwright e2e)
├── branch-strategy.md          # Branch tree: base branch + sub-branches per module
├── rollback-playbook.md        # Rollback procedures for every phase
├── phases/                     # One file per phase with objectives, outcomes, tests
├── working/                    # Temporary scratch notes, migration notes
├── reviewing/                  # Verification artifacts, deep review checklists
│   ├── optimization-review.md  # Centralization, file splitting, readability
│   ├── risk-analysis-review.md # Security, permissions, data integrity, edge cases
│   └── test-coverage-review.md # Test gap audit, coverage verification
├── subplans/                   # Optional deeper sub-plans for scoped modules
│   └── README.md
├── sources/                    # Original user specs and reference documents
├── user-updates.md             # User-editable intake file for mid-execution changes
└── branch-log.md               # Architecture-level branch tracking
```

## Branch Rules (MANDATORY)

1. **Architectures MUST NOT execute on `main` or `development` branches.** A dedicated branch must always be created.
2. For large architectures, a **base branch** is created, and **sub-branches** are created for each module/phase.
3. Sub-branches merge into the base branch only after full validation.
4. The base branch merges into its parent branch only after all sub-branches are merged and the architecture is fully verified.
5. All branch operations must follow the Autopilot Execution Checklist and git-workflow-rules.
6. Branch strategy must be documented in `branch-strategy.md`.

## Single Location Rule

Architectures must ONLY exist in ONE lifecycle folder at a time. When transitioning, delete from the previous folder immediately after copying to the new one.

## Quality Standards

- **Quality over quantity** — Precision and accuracy in code, not volume.
- **Every phase must have tests** — Both vitest unit tests and Playwright e2e tests where applicable.
- **Centralization is mandatory** — Identify and consolidate duplicated logic.
- **Threat analysis is mandatory** — Security, permissions, data integrity, runtime failures.
- **Rollback strategy per phase** — Every phase must have a documented rollback path.
- **Zero tolerance for lazy completion** — Tests must actually run and pass, not be assumed.
