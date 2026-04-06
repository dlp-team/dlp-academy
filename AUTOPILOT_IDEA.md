This is a conversation I had with gemini:
I want to do a super copilot from github to my repo. I have more skills like: ---

# .github/skills/askquestions-leverage/SKILL.md

name: askquestions-leverage

description: Enforce the mandatory vscode/askQuestions leverage step before task closure. Use in every completion flow where user confirmation or next-step intent must be captured.

---



# AskQuestions Leverage Skill



## Objective

Guarantee a final leverage prompt runs before closing work.



## Standard

1. Ask one concise final question with `vscode/askQuestions`.

2. Keep prompt under 200 characters when possible.

3. If tool fails, document failure and request user direction.

4. Do not close task until this step is completed or explicitly blocked.





or

---

# .github/skills/create-plan/SKILL.md

name: create-plan

description: Create and execute protocol-compliant plans for multi-step work, migrations, risky refactors, and cross-module tasks. Use when asked to create a plan, roadmap, phases, or lifecycle transitions.

---



# Create Plan Skill



## Objective

Create complete plan artifacts and immediately start execution when requested with **QUALITY-FIRST** discipline.



## 🎯 QUALITY-FIRST EXECUTION (NON-NEGOTIABLE)



**THIS SKILL PRIORITIZES CORRECTNESS AND THOROUGHNESS OVER SPEED.**



### For Every Phase Completion:



**1. Pre-Completion Double-Check (MANDATORY):**

- [ ] All phase objectives fully completed?

- [ ] Code follows DLP Academy patterns and conventions?

- [ ] All new code has corresponding tests?

- [ ] `npm run test` passes locally (actual run, not assumption)?

- [ ] `npm run lint` passes (0 errors related to changes)?

- [ ] `npx tsc --noEmit` checks passed?

- [ ] Adjacent functionality verified for regressions?

- [ ] Edge cases, empty states, error states tested?

- [ ] Lossless report documented (before/after, files touched)?



**2. Prevent Lazy Completion (ZERO TOLERANCE):**

- ❌ Do NOT mark a phase complete if tests haven't been run

- ❌ Do NOT mark complete because "I think it works"

- ❌ Do NOT skip validation steps to move faster

- ❌ Do NOT leave console.log or debug code

- ✅ ALWAYS run actual test commands before marking complete

- ✅ ALWAYS manually verify UI/functionality changes  

- ✅ ALWAYS check error/loading/empty states exist and work

- ✅ ALWAYS document exactly what you validated



**3. Git Commit & Push Frequency (REQUIRED):**

- Commit after every major component/hook/feature addition (not just at phase end)

- Commit after running validation steps

- Format: `<type>(<scope>): <subject>` per git-workflow-rules.md

- **Target: 3-5 commits per phase** (reflects incremental, validated progress)

- Push to feature branch: `git push origin <branch-name>`

- Never commit to `main` branch

- **Cadence gate**: Do NOT begin a new major work block until the previous validated block is both committed and pushed

- **No batching rule**: Never batch multiple validated major blocks into one delayed commit/push



**4. RED FLAGS - Stop Immediately If You Think This:**

- "Let me quickly move to the next phase..."

- "Tests probably pass, moving on"

- "Validation seems straightforward, I'll skip it"

- "This should work, I'm confident enough"

- **ACTION:** Stop, run tests, fix issues, document findings, then continue



## Required structure

- `copilot/plans/<state>/<plan-name>/README.md`

- `copilot/plans/<state>/<plan-name>/strategy-roadmap.md`

- `copilot/plans/<state>/<plan-name>/phases/*.md`

- `copilot/plans/<state>/<plan-name>/reviewing/*.md`

- `copilot/plans/<state>/<plan-name>/working/*.md`

- `copilot/plans/<state>/<plan-name>/subplans/README.md`

- `copilot/plans/<state>/<plan-name>/user-updates.md`



## User Update Channel (MANDATORY)

Every plan package must include `user-updates.md` as the user-editable intake file.



Minimum template:

- `## How to Use`

- `## Pending User Updates`

- `## Processed Updates`



Execution rule:

1. Before starting any implementation block for an active plan, read `user-updates.md`.

2. If new pending items exist, sync them into `README.md`, `strategy-roadmap.md`, and impacted phase files before coding.

3. Immediately after syncing those updates, move the handled entries from `Pending` to `Processed` with a dated log that lists the files where each update was integrated.

4. Do not start feature implementation for that block until steps 1-3 are complete.



## Mandatory Final Optimization Phase (NEW)

Every multi-phase plan must end with a dedicated final phase focused on deep optimization of all touched files.



Minimum required checklist for that final phase:

- Centralize/unify repeated or highly similar logic to reduce maintenance overhead.

- Split oversized files and improve module organization when file size/complexity justifies it.

- Improve readability (naming, structure, comments only where needed) without behavior drift.

- Apply efficiency improvements where safe and measurable.

- Run `npm run lint` and resolve all errors related to touched scope.

- Re-validate impacted tests after optimization changes.



Closure rule:

- A plan is not considered complete until this optimization phase is executed, validated, documented, and included in final review evidence.



## InReview Two-Step Gate (MANDATORY)

When a plan reaches `inReview`, it must execute these two required review subphases in order:



1. **Optimization and Consolidation Review**

   - Complete the final optimization checklist (centralization, file splitting, readability, efficiency, lint/tests).

2. **Deep Risk Analysis Review**

   - Perform exhaustive risk analysis of implemented scope covering at least:

     - security and permission boundaries,

     - data integrity and rollback safety,

     - runtime failure modes and degraded dependencies,

     - unintended real-world behavior under edge conditions.



### Out-of-Scope Risk Logging (MANDATORY)

- If risks are identified but are out of current plan scope, log them in:

  - `copilot/plans/out-of-scope-risk-log.md`

- Each logged item must include:

  - date,

  - related plan/phase,

  - affected files/surfaces,

  - risk description,

  - recommended follow-up action.



Closure gate:

- A plan cannot move from `inReview` to `finished` until both inReview subphases are documented and any out-of-scope risks are captured in the risk log.



## Lifecycle

1. Create in `todo/`.

2. Move to `active/` when implementation starts.

3. Keep roadmap, phase statuses, and `user-updates.md` synchronized.

4. Move to `inReview/` after implementation + validation.

5. Move to `finished/` after reviewer closure.



### ⚠️ CRITICAL: Single Location Rule (NO DUPLICATES)

**Plans must ONLY exist in ONE lifecycle folder at a time.** When transitioning between lifecycle states:



- ✅ Copy plan folder to new lifecycle location

- ✅ Update status markers (README.md, strategy-roadmap.md) to reflect new state

- ✅ Commit and push changes

- ✅ DELETE the plan folder from the previous lifecycle location

- ❌ NEVER keep the same plan in multiple lifecycle folders simultaneously



Example transition workflow:

```

1. Plan is in active/my-plan-name/

2. Implementation complete → copy to inReview/my-plan-name/

3. Update inReview copy status to "inReview"

4. Commit: "docs(plan): transition my-plan-name to inReview"

5. Delete active/my-plan-name/

6. Commit: "docs(plan): remove my-plan-name from active after inReview transition"

7. Push

```



Violation consequences:

- Duplicate plans cause confusion about current state

- Multiple "authoritative" copies lead to sync divergence

- Review/closure gates become ambiguous

- Do not proceed with other work when duplicates exist—remediate first



## Dual-Source Intake Rule (ORIGINAL_PLAN + GEMINI_PLAN)

When both source files exist for the same request (`copilot/plans/ORIGINAL_PLAN.md` and `copilot/plans/GEMINI_PLAN.md`), apply this flow without exception:



1. **Authority precedence**:

  - `ORIGINAL_PLAN.md` is the primary source of truth.

  - `GEMINI_PLAN.md` is secondary and can only improve structure/readability.

  - Never drop, weaken, or replace requirements present in the original user-authored file.



2. **Plan creation behavior**:

  - Create the new plan package first.

  - Move both source files into that new plan folder.

  - Rename both files to task-specific names to avoid future ambiguity, using this pattern:

    - `source-original-user-spec-<plan-topic>.md`

    - `source-gemini-structured-reference-<plan-topic>.md`



3. **Traceability requirements**:

  - Update plan `README.md` with explicit source-priority notes.

  - Ensure top-level duplicates (`copilot/plans/ORIGINAL_PLAN.md`, `copilot/plans/GEMINI_PLAN.md`) are not left behind.

  - If destination filenames already exist, append a date slug while preserving the naming pattern.



## Quality gates

- Include explicit scope and out-of-scope.

- Include rollback strategy and validation commands.

- Include residual risks and follow-ups before closure.



or

---

# .github/skills/docs-sync/SKILL.md

name: docs-sync

description: Synchronize plan, explanation, and lossless documentation after implementation and validation. Use at closure phase before commit/push.

---



# Docs Sync Skill



## Objective

Prevent drift between implementation and operational documentation.



## Checklist

1. Update plan lifecycle state and next-action text.

2. Sync phase statuses and review checklist state.

3. Create or update temporal lossless report.

4. Update codebase explanation docs for touched files.

5. Verify no stale path comments or stale lifecycle references remain.





or

---

# .github/skills/explain-code/SKILL.md

name: explain-code

description: Update or create codebase and temporal explanation files after implementation changes. Use when documenting architecture, behavior changes, and changelog entries.

---



# Explain Code Skill



## Objective

Keep explanation docs synchronized with real code changes.



## Targets

- Permanent mirror docs: `copilot/explanations/codebase/`

- Session/task docs: `copilot/explanations/temporal/`



## Workflow

1. Identify touched source/test files.

2. Update matching codebase explanation docs.

3. Append dated changelog entries; do not overwrite historical notes.

4. Add temporal notes when task-specific before/after context is useful.

5. Ensure wording reflects actual merged behavior.





or



---

# .github/skills/find-missing-tests/SKILL.md

name: find-missing-tests

description: Audit the repository and generate a deduplicated list of missing tests across unit, integration, rules, and e2e layers. Use for explicit test-gap analysis requests.

disable-model-invocation: true

---



# Find Missing Tests Skill



## Objective

Produce a concrete, deduplicated backlog of missing tests.



## Process

1. Enumerate user-facing and critical backend/security flows.

2. Map existing coverage in `tests/unit`, `tests/e2e`, `tests/rules`, and related test folders.

3. Compare with known backlog references (for example `tests/missing-tests-net-new.md`).

4. Exclude duplicates and already-covered paths.

5. Output missing tests with:

   - feature area,

   - scenario,

   - priority,

   - recommended test type.





or

---

# .github/skills/git-workflow/SKILL.md

name: git-workflow

description: Execute safe branch, commit, and push workflows for this repository. Use when implementing changes that must be versioned and pushed with strict branch safety.

---



# Git Workflow Skill



## Objective

Keep git history clean, safe, and protocol-compliant. **Commits are logs of validated progress.**



## Rules

1. Never commit or push to `main`.

2. Use feature branches for scoped work.

3. Commit after logical work units using conventional format: `type(scope): subject`.

4. **Push frequently to maintain audit trail of progress** (target: 3-5 commits per phase for larger tasks).

5. Do not force-push.

6. **Each commit represents validated work** - tests run, linting passed, adjacent functionality verified BEFORE committing.

7. **Hard cadence gate**: no new major work block starts until prior validated block is committed and pushed.

8. **Required transition**: implement -> validate -> commit -> push -> next block.



## Commit Frequency Philosophy



- **One commit per feature/component** (not one commit per phase)

- **Example for a "Payment Processing" phase**:

  - `feat(payment): Add payment form component` + validation

  - `feat(payment): Add payment service integration` + validation  

  - `test(payment): Add payment error handling tests` + pass

  - `refactor(payment): Extract payment utils to shared module` + validation

  - = 4 commits, full audit trail of progress



## 🔐 Security Scan BEFORE EVERY Commit (MANDATORY)



🚨 **CRITICAL**: NEVER hardcode ANY API key - even old, test, or example keys.

GitGuardian detects ALL API keys (AIza...), regardless of status or age.

**SOLUTION**: Use environment variables ONLY - `import.meta.env.VITE_FIREBASE_API_KEY`



**Alert**: Credentials leaked on April 2, 2026. This CANNOT happen again.



Before `git commit`:

1. **Scan for secrets in staged changes**:

   ```bash

   npm run security:scan:staged

   ```

   - MUST pass with no findings

   - If matches found: `git reset` and DO NOT COMMIT



2. **Verify `.env` protection**: `git check-ignore -v .env` (must be ignored)



3. **Check build artifacts**: No `*-lint-*.json`, `*serviceAccount*.json` files



Before `git push`:

1. Final scan: `npm run security:scan:branch`

   - MUST pass with no findings



## Verification before EVERY push

- `git status` - Confirm clean working directory or staged changes are intentional

- `git branch --show-current` - MUST NOT return "main"

- Tests/validation relevant to scope MUST be complete BEFORE commit

- Linting must pass BEFORE commit

- No `console.log` or debug code in commit

- 🔐 **NO CREDENTIALS** (API keys, private keys, passwords, tokens)

- 🔐 **`.env` files MUST be ignored** by git



## Commit Message Format (MANDATORY)



```

<type>(<scope>): <subject>



Types: feat, fix, docs, style, refactor, perf, test, chore

Scope: Concise feature/area name (payment, auth, subject-perms, etc.)

Subject: Imperative, no period, max 50 chars



Examples:

- feat(payment): Add payment processing form

- test(subject-perms): Add permission validation tests

- fix(home-bin): Resolve ordering issue in delete recovery

- refactor(dashboard): Extract stats calculation to utils

```





or



---

# .github/skills/lossless-change/SKILL.md

name: lossless-change

description: Apply surgical, regression-safe modifications while preserving all non-requested behavior. Use when implementing fixes or features with strict no-regression requirements.

---



# Lossless Change Skill



## Objective

Deliver requested changes without hidden removals, behavior drift, or scope creep.



## Workflow

1. Restate exact requested scope and preserved behaviors.

2. Change only required files and symbols.

3. Preserve existing handlers, props, states, and fallback paths unless explicitly requested.

4. Run verification on touched and adjacent behavior.

5. Produce a lossless report in `copilot/explanations/temporal/lossless-reports/YYYY-MM-DD/`.



## Mandatory checks

- `get_errors` on touched files.

- Re-run impacted tests.

- Confirm no unrelated behavior regressions.





or



---

# .github/skills/test-stabilization/SKILL.md

name: test-stabilization

description: Stabilize failing or flaky test suites across unit, rules, and e2e with deterministic fixes, skip classification, and final green validation.

---



# Test Stabilization Skill



## Objective

Drive suites to deterministic green state while preserving product behavior.



## Execution order

1. Baseline commands:

   - `npm run test`

   - `npm run test:rules`

   - `npm run test:e2e`

2. Classify issues by failure type and skip rationale.

3. Fix deterministic issues first (selectors/state/timing/fixtures).

4. Keep only intentional env-gated skips with documented rationale.

5. Re-run targeted specs, then full suites.



## Closure standard

- Unit and rules suites: zero failures.

- E2E: zero failures, skips documented and justified.

- Update plan artifacts and lossless report.





I want to a highly optimized copilot that will be used to work on my personal project. I am doing this with another person, but this person does not know how to use git very well, that is why I want to automate things for him. Help me make copilot the most efficient as possible.



I was thinking to create a document or something to store like common patterns or components that must be used to centralize the code and be easier to maintain, for example: DLP Academy based

Overlays like the create subject/course/class overlays or modify overlays or the three dots edit overlays have to be based on a unified component





I have to still think more about this, I will use copilot, but using that copilot will make a more efficient coding. Analyse all this, but do not reply yet, I have one more thing to tell you, only reply saying that you understood the assignment and all the code (or if you havent)

Gemini said
I understand the assignment and have thoroughly analyzed all the provided code, skills, and configuration files. I see your vision for a highly optimized, automated Copilot that enforces strict quality gates, simplifies Git workflows for your collaborator, and centralizes reusable components (like the DLP Academy overlays).

I am ready. Please go ahead and share the last thing you need to tell me!

You said
Ok, so I had also thought about this: Git Branches

There will be a main branch, which is the master branch, the most important and the production one that will be used for deploying.

There will also be a development branch, which is the “fake” master branch, it is basically the same but with the new features that are being implemented, it is like a safeguard or a double authentication before the main branch(like gitflow). The development branch should have a BRANCHES_STATUS.md or similar file that will store each branch on the repo (except the main) and will have a quick summary of what each branch is doing, what is being implemented or so, to give a general reference.

Every branch will have a file named BRANCH_STATUS.md or similar, when no copilot or user is working on a branch, this file must have a specific section called Status that must be empty or with None. Else, copilot will write this file as the first thing of all, being the most important first step after knowing which branch to work with. It will modify the file by writing Current branch {name of the branch} is being worked by {id for the computer or some identifier from the computer that will let the other computers with copilot know that they should not touch that branch}. Copilot can only work on the branches where it has its pc id or where no one is working.

When copilot wants to work on a branch, it must first look at the BRANCH_STATUS.md file, if empty, override with the mentioned text. After overriding it, it must make a brief summary of what the work is being done, the status, and some referencing files of the work, like a plan, lossless reports, explanations from the codebase or so, to help other users/copilot to know what is being done in the most efficient way. iIf it is not empty, it will look up this summary and analyse the work to see if the work that is being done is related to the work that this copilot was assigned to, if it is related, it must take that into account and must decide whether to make a new branch from this current one, or make it from any other branch.

When a prompt is sent to Copilot, it will first  need to assess the tasks that were assigned, then pull the repo and make an analysis on what does imply to implement them, where, what files, how. After this, it will go to the BRANCHES_STATUS.md and will analyse what branch fits best for implementing the new tasks/plans(if not clear), after that, it will go to that branch(if any was considered to be optimal for the implementation), it will git pull from that branch, read the BRANCH_STATUS.md of that branch and will read if it is being worked by other copilot or user. If empty, immediately write to it and push to github so it is occupied by that computer. If not, make the mentioned path to then decide what to do.

Once the branch has been selected, the work will be started on that branch.

After finishing the work, consider the option to merge the branch if no further work is going to be made. When merged, consider to delete the previously worked branch to clean the repo or leave it for some designated amount of time.

Only merge with another branch if and only if the other branch is not being worked (or worked by the same id) and if the merged one has been worked by copilot. In an external case, check that both branches are not being worked and proceed with the merge(previous analysis has to be performed(pull requests)).

Add the option to keep on a branch until specified. Change something on the BRANCH_STATUS.md to fix a copilot agent to that branch or add a new Untouchable or something to forbid the modification of a branch, or add a new test to indicate that is a test idea that may not be carried out and should not be considered as a feature, it is more like an experimental thing(different types of status).

Add the current status to each branch on the BRANCHES_STATUS.md.

Create a BRANCH_LOG.md to briefly store the changes being made or just do it on BRANCH_STATUS.md to centralize? Or maybe storing the previous changes on the branch log, but maybe only use it on long-branches like the development?

Before merging between two branches, in addition to what has been mentioned, it would be great if copilot itself could do a pull request or something to see how the merge would be and know whether to do it or if changing something before. Or can it just merge, and then resolve the conflicts if any or log all of them inside a file on another branch or somewhere, then abort the merge and resolve the merge separately. Also, when copilot is going to merge two branches, it must first set the status so they are not accessed by another copilot agent.

The BRANCH_STATUS.md could have a section like External Comments or similar that can only be changed by external copilot/users that are not currently working on them, because they may have some information about an error or a new feature or something they are going to do that has a lot to do with that branch. It would be used for those things, so the user/copilot that is currently working on that branch can see it and maybe change something on its plan or tasks to adjust to the new information if necessary.

Pull requests?

Git Commits

Git commits should be made professionally: 

Commits must not be large patches of different changes, use git add  to select what to add on each commit so they are together.

Different types of commits should be created with a brief description for every different situation. Copilot then should select the one that fits best with the commit to be done.

After selecting that, the commit message should have a subject part, which is a concise summary of what happened, and a body, which is a more detailed explanation that resolves these questions: What is now different than before? What’s the reason for the change? Is there anything to watch out for / anything particularly remarkable?

How to maintain the sync?

How are the copilot-instructions and so going to be synced and the same so copilot does not get confused based on each one?





knowing all of this, what is the best approach to do? Let's first plan this

Gemini said
This is a highly ambitious and well-thought-out system. Your goal of creating a safeguard to prevent conflicts between you and a beginner collaborator—while automating the heavy lifting—is excellent. Your approach to atomic, semantic commits is also spot on.

However, I need to be straightforward with you about how Git operates: using Markdown files (like BRANCH_STATUS.md or BRANCHES_STATUS.md) as a "lock" or state-tracking mechanism is a well-known Git anti-pattern. Because Git is a distributed system, relying on file modifications to claim a branch will result in a nightmare of merge conflicts, race conditions, and a Git history polluted with hundreds of "Lock branch" and "Unlock branch" commits. Your collaborator will likely get stuck constantly trying to resolve conflicts just on the status files.

Instead, we can achieve your exact vision using Git-native mechanisms combined with the Copilot skills you’ve already established. Here is a proposed plan to build this optimized workflow.

Phase 1: Branch Namespacing (The Git-Native "Lock")
Instead of writing to a file to claim a branch, we use strict branch naming conventions. This acts as an immediate, conflict-free identifier for Copilot and users.

The Structure: <type>/<owner_id>/<brief-description>

Types: feature, fix, chore, experiment (replacing your "Untouchable/Test" status).

Owner ID: pc1, pc2, or initials.

How Copilot Reads It: When Copilot evaluates the repo, it runs git branch -a. If it sees feature/pc2/login-overlay, it automatically knows: "This is owned by pc2. I cannot touch this unless explicitly overridden." If it needs to work on related features, it branches off development using its own ID.

Phase 2: Centralized Tracking (Replacing BRANCHES_STATUS.md)
To keep track of what is happening across the repo without causing merge conflicts, we leverage the directory structure you already created in your create-plan skill.

Global Status: Instead of one file tracking all branches, the copilot/plans/active/ directory serves this purpose. Every active branch has a corresponding folder here detailing the scope, roadmap, and current phase.

Branch Logs: Instead of a BRANCH_LOG.md, we use your existing copilot/explanations/temporal/lossless-reports/ folder. Every time Copilot finishes a work block, it drops a dated lossless report there. This provides a perfect audit trail without colliding with other branches.

External Comments: We put an external-notes.md file inside the specific plan's folder (e.g., copilot/plans/active/login-overlay/external-notes.md). Other agents/users can safely append notes here without causing base-level conflicts.

Phase 3: The Safe Merge Engine (Pull Requests)
You correctly identified that Copilot shouldn't just blindly merge branches.

Dry-Run Merges: Before merging, Copilot will fetch the target branch and run git merge --no-commit --no-ff <target-branch>. This allows it to detect conflicts.

Conflict Handling: If conflicts exist, it aborts the merge (git merge --abort), logs the conflicting files, and prompts the user for direction.

Pull Requests (PRs): The absolute best practice is to have Copilot push the branch and create a Pull Request against development via the GitHub CLI (gh pr create). This gives you a visual diff, a place for automated test runs (from your test-stabilization skill), and a safe button for your collaborator to click.

Phase 4: Enforcing the Commit Rules
Your commit logic is flawless and should be strictly enforced via the .github/skills/git-workflow/SKILL.md you provided earlier.

Atomic Additions: Copilot must use git add <specific-files> rather than git add ..

Semantic Formats: Enforce the type(scope): subject format.

The Body: Ensure the commit body answers your three questions: What is different? Why the change? Any watch-outs?

Phase 5: Maintaining Sync across .github/
To prevent Copilot from getting confused by different instructions on different branches, we enforce a strict Upstream Sync Rule:

Isolation: Changes to .github/ (instructions, skills, workflows) should ideally happen in their own dedicated branches (e.g., chore/global/update-skills) and be merged into development immediately.

Pre-flight Sync: Before Copilot begins any new feature work, its very first command must be git pull origin development to ensure it has the latest .github/ instructions.

No Local Overrides: If Copilot detects a discrepancy between the .github/ folder on its feature branch and development, it must rebase or merge development into the feature branch before writing code.

Would you like me to draft a specialized .github/skills/multi-agent-workflow/SKILL.md that operationalizes this branch-namespacing and PR strategy, or should we focus first on designing the centralized component document (like your DLP Academy overlays) that you mentioned earlier?

You said
I like what you say, but, isn't the branches_status.md or branches_log.md useful? Because copilot then does not have to go to each specific branch to see if that branch has somehting to do with the task assigned, it can just look it up on the branches_status and from there know better what to do right? And inside each branch, having a BRANCH_LOG.md would be useful because there is where the new changes will be stored, because if there is a plan that is on the finished folder, the new copilot that gets there will not know that plan was from that new branch, because there are a lot of plans, that is why storing the names of the directories on the branch-log to indicate the log files that have been used for that branch to change it.



Also, I would like that is copilot the one that also does the merges and the pull requests and everything related to that because my fellow has absolutely 0 idea about it, so that is why I said that if it does abort on the merge, it tries to log what were the problems and solve them(copilot) itself.

Gemini said
You make a very valid, pragmatic point. From an AI's perspective, reading a single BRANCHES_STATUS.md file to understand the whole repository is much faster and cheaper (in terms of token context) than running terminal commands to checkout and read a dozen different branches.

And your point about mapping the finished/ plans to specific branches using a BRANCH_LOG.md makes perfect sense to prevent Copilot from losing the context of what was done where.

Since your main goal is to make this completely zero-touch for your collaborator (meaning Copilot handles all the Git complexity, including resolving conflicts), we can absolutely implement your vision. We just need to structure these files carefully so they don't cause the very merge conflicts we are trying to avoid.

Here is how we adapt your ideas into a bulletproof workflow:

1. The Global View: BRANCHES_STATUS.md (The Git-Safe Way)
We will keep a centralized file so Copilot has a "directory" of all work, but we will make it strict so it doesn't break Git.

Where it lives: copilot/BRANCHES_STATUS.md (kept in the development branch).

How it works: When Copilot starts a new task, it creates the branch, then updates this file with the Branch Name, Owner ID, and Plan Path.

The Golden Rule to Prevent Conflicts: Copilot is only allowed to append to this file or modify its own rows. It cannot delete rows made by your collaborator's Copilot until a merge happens.

Why this helps: When you assign a task, Copilot reads this one file, instantly knows what branches exist, who is working on them, and where to find the detailed plans.

2. The Branch Memory: BRANCH_LOG.md
You are completely right that a branch needs its own memory.

Where it lives: Right at the root of the feature branch, or in copilot/branch-logs/BRANCH_LOG.md.

The Purpose: It acts as an index. When Copilot finishes a plan and moves it to the finished/ folder, it writes a link to that plan inside the BRANCH_LOG.md.

The Benefit: If another Copilot agent jumps onto this branch later, it just reads the BRANCH_LOG.md and instantly knows: "Ah, this branch already completed the login-overlay plan and the database-migration plan."

3. Fully Autonomous Merges and PRs (Zero-Touch for your Collaborator)
Since your collaborator has zero Git knowledge, Copilot must act as the Senior DevOps Engineer. We will instruct Copilot to handle the entire lifecycle, including the messy parts.

Here is the exact automated sequence Copilot will follow when work is done:

Pre-Merge Sync: Copilot runs git fetch origin and git pull origin development into its current branch.

Autonomous Conflict Resolution (The Magic Step):

If a merge conflict happens, Copilot will not stop and ask the user.

Instead, it will run git diff --name-only --diff-filter=U to find the conflicted files.

It will open those files, read the <<<<<<< HEAD and >>>>>>> markers, analyze the code, and rewrite the file to resolve the conflict logically.

It will then git add and git commit the resolved files itself.

The Pull Request: Once conflicts are resolved locally, Copilot will use the GitHub CLI (gh pr create) to generate a professional Pull Request detailing the changes, the plans completed (referencing BRANCH_LOG.md), and the status.

Automated Merge: If the PR checks pass (linting, tests), Copilot can execute gh pr merge --squash --delete-branch to safely merge the code into development and clean up the old branch automatically.

Summary of the Plan
By doing this, your collaborator only ever has to say: "Hey Copilot, build the new class overlay component." Copilot will:

Check BRANCHES_STATUS.md.

Create the branch and update the status.

Write the plan and log it in BRANCH_LOG.md.

Write the code and commit it safely.

Pull development, autonomously fix any merge conflicts, and push a PR.

Merge it and clean up.

If you agree with this flow, the next step is to codify this into a new skill file (e.g., .github/skills/multi-agent-workflow/SKILL.md) that explicitly teaches Copilot these exact rules so it never asks your collaborator to manually fix a Git issue.

Shall I draft this multi-agent-workflow skill for you to review?