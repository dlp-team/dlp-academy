---
# .github/skills/create-architecture/SKILL.md
name: create-architecture
description: Create and execute bullet-proof architecture-level plans for large-scale, mission-critical work. Use when the scope demands exhaustive analysis, multi-branch execution, comprehensive test coverage, threat modeling, and centralization audits. This is the "final boss" of planning — 5–30x more thorough than a regular plan.
---

# Create Architecture Skill

## Objective
Create the most comprehensive, exhaustive, and battle-tested planning artifact possible — an **Architecture**. Architectures are reserved for work that demands absolute precision, full test coverage, deep threat analysis, and multi-branch execution discipline.

## When to Use Architecture vs Plan

### Use **Architecture** when:
- The work spans 5+ files across multiple modules/features
- Multiple interconnected systems are affected (auth + firestore + UI + permissions)
- The risk of regressions is high and requires exhaustive test coverage
- The work benefits from multi-branch isolation (base branch + sub-branches)
- Security, data integrity, or permission boundaries are being modified
- The feature is core/critical to the application's functioning
- The user explicitly requests an architecture
- A plan would be insufficient to guarantee zero regressions

### Use **Plan** when:
- The work is 1–5 files, well-scoped
- Risk is manageable with standard lossless protocol
- Single feature branch is sufficient
- Standard test coverage is adequate

### Escalation Rule
If during plan creation you realize the scope exceeds plan-level complexity, **stop and recommend an architecture** to the user via `vscode/askQuestions`. Do not attempt to force plan-level tooling onto architecture-level work.

---

## 🎯 QUALITY-FIRST EXECUTION (ABSOLUTE, NON-NEGOTIABLE)

**ARCHITECTURES DEMAND THE HIGHEST POSSIBLE QUALITY. PRECISION AND ACCURACY ABOVE ALL.**

### Core Philosophy
- **Quality over quantity** — Write precise, clean, minimal code. Not a lot of code.
- **Every case considered** — Every possible situation, edge case, error state, and user flow must be analyzed and handled.
- **Every phase tested** — Both vitest unit tests AND Playwright e2e tests where applicable. No phase is complete without passing tests.
- **Centralization is mandatory** — Identify duplicated logic and consolidate it. Reduce code, improve control.
- **Threats assessed and resolved** — Security vulnerabilities, permission gaps, data integrity risks must be identified and addressed proactively.
- **Documentation is exhaustive** — Every decision, every trade-off, every risk is logged.

---

## 📁 Required Architecture Structure

Every architecture must produce the following artifact tree inside `copilot/architectures/<state>/<architecture-name>/`:

```
<architecture-name>/
├── README.md                   # Problem statement, scope, constraints, status, branch strategy
├── strategy-roadmap.md         # Master sequencing, phase status, dependencies, source of truth
├── threat-analysis.md          # Security, data integrity, runtime failure, permission analysis
├── centralization-audit.md     # Code deduplication audit, shared logic extraction opportunities
├── test-strategy.md            # Complete test plan: vitest unit + Playwright e2e per phase
├── branch-strategy.md          # Branch tree diagram: base branch + sub-branches per module
├── rollback-playbook.md        # Phase-by-phase rollback procedures and data recovery steps
├── phases/                     # One file per phase with objectives, outcomes, validation, tests
│   ├── phase-01-<name>.md
│   ├── phase-02-<name>.md
│   └── ...
├── working/                    # Temporary scratch notes, migration helpers, research
├── reviewing/                  # Deep verification artifacts
│   ├── optimization-review.md  # Centralization, file splitting, readability, efficiency
│   ├── risk-analysis-review.md # Security, permissions, data integrity, edge conditions
│   └── test-coverage-review.md # Test gap audit, coverage metrics, missing scenarios
├── subplans/                   # Optional sub-plans for isolated modules within a phase
│   └── README.md
├── sources/                    # Original user specifications and reference documents
├── user-updates.md             # User-editable intake file for mid-execution changes
└── branch-log.md               # Architecture-level branch tracking and merge history
```

---

## 🔀 Branch Strategy (MANDATORY)

### Rule 1: Never Execute on main or development
Architectures **MUST NOT** execute on `main` or `development` branches. This is absolute and has no exceptions unless the user explicitly overrides it.

### Rule 2: Base Branch + Sub-Branches
For large architectures:
1. **Create a base branch** from the parent branch (e.g., `arch/<architecture-name>` from `development`)
2. **Create sub-branches** for each major module/phase (e.g., `arch/<architecture-name>/phase-01-auth`, `arch/<architecture-name>/phase-02-firestore`)
3. Each sub-branch is developed, tested, and validated independently
4. Sub-branches merge into the base branch only after full validation (tests pass, lint clean, get_errors clean)
5. After ALL sub-branches are merged and the architecture is fully verified, the base branch merges into its parent

### Rule 3: Follow Autopilot Checklist
All branch operations MUST follow:
- [AUTOPILOT_EXECUTION_CHECKLIST.md](../../../copilot/ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md) — Steps 1–3 for branch setup
- [git-workflow-rules.md](../../../copilot/ACTIVE-GOVERNANCE/git-workflow-rules.md) — Commit format, push discipline
- [BRANCHES_STATUS.md](../../../copilot/ACTIVE-GOVERNANCE/BRANCHES_STATUS.md) — Register all branches immediately

### Rule 4: Branch Strategy Documentation
Document the full branch tree in `branch-strategy.md`:
```
development (parent)
└── arch/<architecture-name> (base branch)
    ├── arch/<architecture-name>/phase-01-<module>
    ├── arch/<architecture-name>/phase-02-<module>
    ├── arch/<architecture-name>/phase-03-<module>
    └── arch/<architecture-name>/phase-04-final-optimization
```

### Rule 5: Branch Registration
Every branch (base + sub-branches) must be:
- Registered in `copilot/BRANCHES_STATUS.md` on `development` immediately upon creation
- Tracked in the architecture's `branch-log.md`
- Owned by the current `COPILOT_PC_ID`

---

## 📋 Architecture Execution Workflow

### Phase 0: Pre-Architecture Setup

#### 0.1 — Scope Assessment
- [ ] Read ALL relevant codebase documentation in `copilot/explanations/codebase/`
- [ ] Search for ALL similar patterns in the codebase
- [ ] Identify ALL files that will be touched
- [ ] Identify ALL adjacent functionality that could be affected
- [ ] Map ALL dependencies between affected modules
- [ ] Document the complete impact radius

#### 0.2 — Branch Setup
- [ ] Verify `COPILOT_PC_ID` is resolved (STOP if missing)
- [ ] Verify NOT on `main` or `development`
- [ ] Create base branch: `git checkout -b arch/<architecture-name>`
- [ ] Register base branch in `BRANCHES_STATUS.md` on `development`
- [ ] Commit and push branch registration before any implementation
- [ ] Create `BRANCH_LOG.md` on the base branch with parent reference

#### 0.3 — Architecture Package Creation
- [ ] Create the full architecture directory structure (see Required Structure above)
- [ ] Write `README.md` with problem statement, scope, constraints, out-of-scope
- [ ] Write `strategy-roadmap.md` with all phases, dependencies, sequencing
- [ ] Write `threat-analysis.md` with initial threat modeling
- [ ] Write `centralization-audit.md` identifying deduplication opportunities
- [ ] Write `test-strategy.md` with complete test plan per phase
- [ ] Write `branch-strategy.md` with branch tree diagram
- [ ] Write `rollback-playbook.md` with per-phase rollback procedures
- [ ] Write `user-updates.md` with intake template
- [ ] Write phase files in `phases/` with objectives, acceptance criteria, test requirements
- [ ] Commit: `docs(architecture): create <architecture-name> package`
- [ ] Push to base branch

### Phase N: Implementation (Per Phase)

For EACH phase in the architecture:

#### N.1 — Sub-Branch Setup (if multi-branch)
- [ ] Create sub-branch: `git checkout -b arch/<architecture-name>/phase-NN-<module>`
- [ ] Register sub-branch in `BRANCHES_STATUS.md` on `development`
- [ ] Commit and push registration before implementation

#### N.2 — Read user-updates.md
- [ ] Check for pending user updates before starting
- [ ] Sync any pending items into roadmap and phase files
- [ ] Move handled entries to Processed section

#### N.3 — Implementation
- [ ] Make surgical, minimal changes (quality over quantity)
- [ ] Centralize logic where identified in centralization audit
- [ ] Preserve ALL existing behavior not explicitly targeted
- [ ] Follow DLP Academy code patterns and conventions
- [ ] Use `vscode/askQuestions` for major decisions (don't stop)

#### N.4 — Test Creation (MANDATORY — EVERY PHASE)
- [ ] Create vitest unit tests for all new/modified logic
- [ ] Create Playwright e2e tests where applicable (UI flows, navigation, permissions)
- [ ] Tests must cover:
  - [ ] Happy path (primary use case)
  - [ ] Edge cases (empty data, null values, boundary conditions)
  - [ ] Error states (network failures, permission denied, invalid input)
  - [ ] Loading states
  - [ ] Permission boundaries (role-based access)
  - [ ] Multi-tenant isolation (institutionId scoping)

#### N.5 — Validation (MANDATORY — EVERY PHASE)
- [ ] Run `npm run test` — ALL tests must pass
- [ ] Run `npm run lint` — 0 errors related to changes
- [ ] Run `npx tsc --noEmit` — Type check passes
- [ ] Run `get_errors` on all touched files — clean
- [ ] Verify requested behavior works
- [ ] Verify adjacent behaviors still work
- [ ] Check empty/loading/error states
- [ ] Test all modes (grid/list/tree/shared if applicable)

#### N.6 — Phase Documentation
- [ ] Create lossless report in `copilot/explanations/temporal/lossless-reports/`
- [ ] Update relevant `codebase/` explanation files
- [ ] Update phase file with outcomes and validation evidence
- [ ] Update `strategy-roadmap.md` with phase status

#### N.7 — Commit & Push (CADENCE GATE)
- [ ] Run `npm run security:scan:staged` — MUST pass
- [ ] Commit with proper format: `<type>(<scope>): <subject>`
- [ ] Push to sub-branch (or base branch if single-branch)
- [ ] **Do NOT start next phase until this phase is committed and pushed**
- [ ] Target: 3–5 commits per phase (incremental, validated progress)

#### N.8 — Sub-Branch Merge (if multi-branch)
- [ ] All tests pass on sub-branch
- [ ] All lint/type checks clean
- [ ] Merge sub-branch into base branch
- [ ] Update `branch-log.md` with merge record
- [ ] Update `BRANCHES_STATUS.md` — mark sub-branch as `pending-delete`
- [ ] Continue to next phase

### Final Phase: Deep Optimization

Every architecture MUST end with a dedicated optimization phase:

- [ ] **Centralization audit execution** — Consolidate all identified duplicated logic
- [ ] **File splitting review** — Split any oversized files (>500 lines)
- [ ] **Readability pass** — Improve naming, structure, remove dead code
- [ ] **Efficiency improvements** — Apply safe, measurable optimizations
- [ ] **Lint cleanup** — `npm run lint` with 0 errors across all touched scope
- [ ] **Full test re-run** — `npm run test` confirming zero regressions
- [ ] **Console.log cleanup** — Remove ALL debug statements
- [ ] **Spanish text verification** — All visible UI text in proper Spanish
- [ ] **File path comments** — All new files have path comments at top

### InReview: Three-Step Deep Review Gate

When an architecture reaches `inReview/`, it MUST execute these three required review phases in order:

#### Review 1: Optimization and Consolidation
- [ ] Complete final optimization checklist (centralization, file splitting, readability, efficiency)
- [ ] Document findings in `reviewing/optimization-review.md`

#### Review 2: Deep Risk Analysis
- [ ] Exhaustive risk analysis covering:
  - [ ] Security and permission boundaries
  - [ ] Data integrity and rollback safety
  - [ ] Runtime failure modes and degraded dependencies
  - [ ] Unintended real-world behavior under edge conditions
  - [ ] Multi-tenant isolation correctness
  - [ ] Cross-browser/cross-device compatibility
- [ ] Document findings in `reviewing/risk-analysis-review.md`
- [ ] Log out-of-scope risks in `copilot/plans/out-of-scope-risk-log.md`

#### Review 3: Test Coverage Verification
- [ ] Audit test coverage against test strategy
- [ ] Identify and fill any test gaps
- [ ] Verify all critical paths have both unit and e2e coverage
- [ ] Document findings in `reviewing/test-coverage-review.md`

### Closure Gate
An architecture cannot move from `inReview` to `finished` until:
1. All three review phases are documented
2. All out-of-scope risks are captured
3. All tests pass (`npm run test`)
4. All lint checks pass (`npm run lint`)
5. Type checking passes (`npx tsc --noEmit`)
6. Base branch is fully merged (all sub-branches integrated)
7. Base branch is ready to merge into parent
8. Final verification via `vscode/askQuestions` is confirmed by user

---

## ⚠️ RED FLAGS — Stop Immediately

If during architecture execution you think any of these:
- "Let me quickly move to the next phase..." → **STOP, validate current phase fully**
- "Tests probably pass, moving on" → **STOP, actually run tests**
- "This edge case is unlikely" → **STOP, test it anyway**
- "Centralization can happen later" → **STOP, do it now per the audit**
- "I'll skip the e2e test for this" → **STOP, create it**
- "The threat analysis is overkill" → **STOP, this IS an architecture — thoroughness is the point**

---

## 🔒 Risky Command Safety (ARCHITECTURE-SPECIFIC)

During architecture execution:
- **Package installation**: If a package is listed in `package.json` (already in the repo), install without asking. If it's a NEW dependency not in the repo, **STOP and ask the user** via `vscode/askQuestions`. In autopilot mode, do NOT auto-reply to package installation questions — log in `PENDING_COMMANDS.md` and wait.
- **All other commands**: Follow the standard ALLOWED/FORBIDDEN/PENDING command authorization framework.

---

## 📝 User Update Channel (MANDATORY)

Same as create-plan: every architecture must include `user-updates.md`.

Execution rule:
1. Before starting any phase, read `user-updates.md`.
2. If new pending items exist, sync them into `README.md`, `strategy-roadmap.md`, and impacted phase files.
3. Move handled entries from `Pending` to `Processed` with dated log.
4. Do not start feature implementation for that phase until steps 1–3 are complete.

---

## 📐 Single Location Rule (NO DUPLICATES)

Same as plans: architectures must ONLY exist in ONE lifecycle folder at a time. When transitioning:
1. Copy to new lifecycle location
2. Update status markers
3. Commit and push
4. **DELETE from previous location immediately**
5. Commit and push cleanup

---

## 🔄 Dual-Source Intake Rule

Same as create-plan: if both `ORIGINAL_PLAN.md` and `GEMINI_PLAN.md` exist, apply the dual-source intake flow. `ORIGINAL_PLAN.md` is primary authority. Move both into `sources/` and rename per convention.

---

## ✅ Architecture Quality Checklist (Pre-Closure)

Before marking an architecture as `finished`:

- [ ] Every phase has passing vitest unit tests
- [ ] Every UI phase has passing Playwright e2e tests
- [ ] Centralization audit was executed (duplicated logic consolidated)
- [ ] Threat analysis was completed and all risks resolved or logged
- [ ] Rollback playbook is complete for every phase
- [ ] All three review gates passed (optimization, risk, test coverage)
- [ ] All branches merged into base branch
- [ ] Base branch ready to merge into parent
- [ ] No `console.log` debug statements remain
- [ ] All Spanish text verified for proper grammar
- [ ] File path comments on all new files
- [ ] `npm run test` — all pass
- [ ] `npm run lint` — 0 errors
- [ ] `npx tsc --noEmit` — clean
- [ ] `npm run security:scan:branch` — no credentials exposed
- [ ] Lossless reports created for all phases
- [ ] Codebase explanation files updated
- [ ] User confirmed completion via `vscode/askQuestions`
