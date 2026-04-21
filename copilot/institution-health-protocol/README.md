# Institution Lifecycle Health Protocol (ILHP)

> **Version:** 1.0.0 | **Created:** 2026-04-21 | **Owner:** DLP Academy Engineering

---

## What Is This?

The **Institution Lifecycle Health Protocol (ILHP)** is a structured, reproducible, deeply documented system for performing exhaustive end-to-end integrity audits of the DLP Academy platform — simulating the complete lifecycle of a real institution from provisioning to full operational use.

Each execution is called a **Lifecycle Integrity Audit (LIA)**.

A LIA validates every critical path in the system: authentication, role resolution, permission boundaries, institution admin workflows, teacher onboarding, student onboarding, subject creation, class assignment, content management, and multi-tenant data isolation.

This is not a quick smoke test. It is a **precision instrument** designed to:
- Catch regressions before they reach production
- Establish a living baseline of what works at a given point in time
- Track security risks across audit runs
- Provide a reproducible execution path that any engineer can follow
- Generate trend data across multiple runs for comparison
- Simulate the real experience of each role (institutionadmin, teacher, student) from their perspective
- Simulate adversarial access attempts (hacker perspective) to validate security boundaries
- Identify feature gaps — what the platform is missing that real users need

---

## LIA Core Philosophy

**A LIA is a read-only audit by default.** Its job is to observe, analyze, and log — not to fix.

### What a LIA Does

- ✅ Observes and tests every feature across all roles
- ✅ Logs what works, what fails, and what is missing
- ✅ Identifies security risks and access control weaknesses
- ✅ Performs adversarial testing (hacker perspective)
- ✅ Audits UX and feature gaps from each user's perspective
- ✅ **Proposes plans and architectures to resolve every finding** — logged in `findings.md` as recommended actions with links to new plan proposals

### What a LIA Does NOT Do

- ❌ Make code changes
- ❌ Modify Firestore data (beyond test data created for the audit itself)
- ❌ Trigger deployments
- ❌ Edit production configuration

### Implementation Mode (Opt-In Only)

A LIA executor may choose to activate **Implementation Mode** — but only if explicitly requested by the team for that specific LIA run. In that case, the executor follows the standard plan/architecture creation flow from `copilot/plans/` or `copilot/architectures/` for each improvement identified. This is **never the default**.

After a LIA completes, the `findings.md` document will contain a **Proposed Actions** section with:
- Links to proposed plan folders (for small improvements)
- Links to proposed architecture folders (for large or security-critical changes)
- Priority classification: CRITICAL / HIGH / MEDIUM / LOW
- Estimated scope for each

These proposals are input for the team to review and decide whether to act on.



A LIA executor must adopt **four distinct mindsets** during execution:

### 1. The Institution Admin
Walk the full institution admin journey with fresh eyes. Ask: *Is the dashboard intuitive? Are settings properly explained? Is user management clear? Are there missing features an admin would expect?*

### 2. The Teacher
Experience the content creation flow end-to-end. Ask: *Is subject creation frictionless? Can I organize topics as I'd expect? Is the quiz builder complete? Is there anything missing that would make my teaching workflow harder?*

### 3. The Student
Navigate as a student would on their first day. Ask: *Is enrollment clear? Is the content accessible? Is the quiz experience smooth? Is there anything confusing or missing from a student's perspective?*

### 4. The Attacker (Adversarial Perspective)
Actively attempt to break access boundaries using direct Firestore writes, manipulated requests, and privilege escalation attempts. Ask: *Can I access data I shouldn't? Can I promote my own role? Can I read another institution's subjects? Can I impersonate another user's quiz result?*

All observations from these four perspectives — not just pass/fail on steps — must be logged in `findings.md` and the global logs.

---

## Architecture Update Mandate

**MANDATORY:** When any implementation or code change is made to a feature covered by an ILHP architecture document, the corresponding architecture document in `architectures/` MUST be updated to reflect the change. This keeps the architecture living and accurate, which is essential for future LIA runs.

What requires an architecture update:
- New Firestore collections or fields added to existing ones
- Changes to role logic or permission checks
- New authentication flows or login methods
- New features in any covered domain (auth, provisioning, subjects, classes, content)
- Security patches that change how Firestore rules work
- Refactors that change file paths, hook names, or utility functions referenced in the architectures

Architecture documents use append-only changelog sections at the bottom. Do NOT overwrite prior sections.



```
copilot/institution-health-protocol/
│
├── README.md                        ← This file — master navigation
├── MASTER_CHECKLIST.md              ← Complete ordered step list (all phases)
├── ARCHITECTURE_INDEX.md            ← Index and navigation for all architecture docs
├── TEST_INSTITUTION_SPEC.md         ← Standardized test institution data definition
│
├── architectures/                   ← Deep code-level analysis documents (permanent)
│   ├── 01-auth-signup-login.md
│   ├── 02-institution-provisioning.md
│   ├── 03-teacher-management.md
│   ├── 04-student-management.md
│   ├── 05-subject-creation.md
│   ├── 06-class-teacher-assignment.md
│   ├── 07-content-management.md
│   └── 08-permission-boundaries.md
│
├── active/                          ← Currently running LIA instance
│   └── lia-YYYY-MM-DD/
│       ├── README.md                ← Instance overview + environment snapshot
│       ├── step-checklist.md        ← Live execution copy with real-time status marks
│       ├── findings.md              ← In-progress discoveries and observations
│       ├── environment-snapshot.md  ← Branch, build, emulator state at audit start
│       └── logs/
│           ├── security-findings.md ← Security issues found during this run
│           ├── working-parts.md     ← Confirmed working features
│           └── failures.md         ← Blocking and non-blocking failures
│
├── finished/                        ← Archived completed LIA instances
│   └── (Move active LIA here when complete)
│
├── logs/                            ← Global cross-run registry (NEVER cleared)
│   ├── security-risks-registry.md   ← All security findings across all runs
│   ├── working-features-baseline.md ← Cumulative baseline of working features
│   ├── known-issues.md              ← Ongoing unresolved issues across runs
│   └── regression-history.md        ← Timeline: feature state changes across runs
│
└── templates/                       ← Master templates for new LIA instances
    ├── lia-instance-template/       ← Copy this to spawn a new active instance
    └── architecture-doc-template.md ← Base template for new architecture documents
```

---

## How to Run a Lifecycle Integrity Audit

> **MANDATORY:** Every LIA MUST run on a dedicated Git branch unless explicitly specified otherwise by the team. Create the branch before filling in the environment snapshot. Branch naming: `lia/YYYY-MM-DD` (or `lia/YYYY-MM-DD-<short-context>` if a specific scope is being tested).

### Step 1: Create a Dedicated LIA Branch

```
git checkout development
git pull origin development
git checkout -b lia/YYYY-MM-DD
```

Do NOT run a LIA on `main`, `development`, or any feature/hotfix branch. The LIA creates test data, temporary notes, and log entries that must be reviewed and cherry-picked before merging into the main codebase.

### Step 2: Start a New LIA Instance

Copy the template folder to `active/`:
```
cp -r copilot/institution-health-protocol/templates/lia-instance-template/ \
      copilot/institution-health-protocol/active/lia-YYYY-MM-DD/
```

### Step 3: Complete the Environment Snapshot

Open `active/lia-YYYY-MM-DD/environment-snapshot.md` and fill in:
- Current git branch and commit hash
- Firebase target (emulator / staging / production)
- Date and executor name
- Build status

### Step 4: Run Pre-Flight Checks (Phase 0)

Before touching any UI or Firestore, complete all pre-flight validations in Phase 0 of the `step-checklist.md`. These are blocking — do not proceed if any fail.

### Step 5: Execute Each Phase in Order

Follow the `step-checklist.md` sequentially. Each step has:
- A status indicator (`⬜ / 🔄 / ✅ / ❌ / ⚠️`)
- Classification (`[AUTO]` / `[MANUAL]` / `[HYBRID]`)
- Severity (`[CRITICAL]` / `[HIGH]` / `[MEDIUM]` / `[LOW]`)

**Critical failures stop the audit.** Document the failure in `logs/failures.md` and escalate.

### Step 6: Log Findings Continuously

During execution, log to:
- `logs/security-findings.md` — any access control anomaly, data leak possibility, or security concern
- `logs/working-parts.md` — every confirmed-working feature
- `logs/failures.md` — any failure with its context

### Step 7: Update Global Logs

After completing the LIA, propagate findings to the global `logs/` directory:
- Append security findings to `logs/security-risks-registry.md`
- Update `logs/working-features-baseline.md` with this run's results
- Note any regressions in `logs/regression-history.md`

### Step 8: Archive the LIA

Move the completed `active/lia-YYYY-MM-DD/` folder to `finished/`:
```
mv copilot/institution-health-protocol/active/lia-YYYY-MM-DD/ \
   copilot/institution-health-protocol/finished/
```

---

## Step Status Model

| Symbol | Meaning |
|--------|---------|
| `⬜` | Not started |
| `🔄` | In progress |
| `✅` | Passed — works as intended |
| `❌` | **FAILED (BLOCKING)** — stops audit until resolved |
| `⚠️` | Passed with issues — non-blocking, must be logged |
| `⏭️` | Skipped — with documented reason |

---

## Step Classification Tags

| Tag | Meaning |
|-----|---------|
| `[AUTO]` | Covered by automated test (Playwright e2e or Vitest unit) |
| `[MANUAL]` | Requires human UI interaction |
| `[HYBRID]` | Human triggers the action, validation checked via Firestore/logs |
| `[CRITICAL]` | App is unusable if this fails — blocks all dependent phases |
| `[HIGH]` | Major feature broken — blocks dependent steps |
| `[MEDIUM]` | Degraded experience — non-blocking |
| `[LOW]` | Minor visual/UX issue — non-blocking |

---

## Architecture Documents

Architecture documents are **permanent, deep code-level analyses** of each domain in the platform. They do not change unless the underlying code changes. They define:

1. The exact files and functions involved
2. The critical execution paths through the code
3. Known failure modes with precise conditions
4. Manual check sequences (UI steps)
5. Automated test coverage and coverage gaps
6. Validation criteria (how to know it passed)
7. Security boundary analysis
8. Dependencies on other architectures
9. Rollback and recovery procedures

See [ARCHITECTURE_INDEX.md](ARCHITECTURE_INDEX.md) for the complete index.

---

## Standardized Test Institution

Every LIA runs against the same standardized fictional institution. See [TEST_INSTITUTION_SPEC.md](TEST_INSTITUTION_SPEC.md) for the exact definition.

This ensures full comparability across all audit runs.

---

## Global Logs: The Living Health Register

The `logs/` directory at the root of this protocol accumulates data across ALL LIA runs. It is never cleared or reset. Over time, it becomes the definitive record of:

- Every security risk ever found
- Every feature confirmed working (with date)
- Every regression (feature that stopped working)
- All known issues and their status

This transforms the ILHP into a **longitudinal health tracking system** for the platform.
