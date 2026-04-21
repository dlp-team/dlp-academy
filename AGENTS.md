<!-- AGENTS.md -->
# Autonomous Execution Guidelines (AGENTS.md)

---

## 🚨 BLOCKING PROTOCOL: vscode/askQuestions Leverage Step (100% MANDATORY)

**EVERY PREMIUM REQUEST MUST END WITH THIS. NO EXCEPTIONS. ACROSS ALL SESSIONS.**

### Non-Negotiable Rule
- After ANY task completion, execute `vscode/askQuestions` BEFORE ending
- This applies to 100% of requests, 100% of the time, across all sessions
- If you skip this, you have violated protocol
- Session boundaries do NOT exempt you - this rule carries across new conversations

### Why Session Carry-Over Matters
**Problem:** You completed a task in Session #1. In Session #2, you think "I already did the leverage-step before."

**Reality:** Each new session, you have a blank memory. You must enforce this protocol AGAIN.

**Solution:** EVERY session, FIRST thing: Re-read this section + [copilot/protocols/vscode-askQuestions-leverage-step.md](copilot/protocols/vscode-askQuestions-leverage-step.md)

Then apply leverage-step to that session's requests as if it's your first time.

### Before Closing ANY Session
Execute:
```
"[Summarize what was completed in this session]

Is everything complete, or is there additional work needed?"
```

Wait for user confirmation before closing.

### Reference
📖 [copilot/protocols/vscode-askQuestions-leverage-step.md](copilot/protocols/vscode-askQuestions-leverage-step.md)

---

## CRITICAL: CREDENTIAL SECURITY BEFORE ANY GIT OPERATION

🚨 **ABSOLUTE RULE**: NEVER hardcode ANY API key - even old, test, or example keys.
- GitGuardian detects EVEN OLD, INACTIVE, or EXAMPLE API keys
- Even keys in comments or docs will be flagged
- **SOLUTION**: Use environment variables ONLY

**INCIDENT**: April 2, 2026 - Firebase API key leaked via build artifact.  
**ACTION**: Before EVERY `git add`, `git commit`, or `git push`:
1. Run `npm run security:scan:staged` and verify PASS (no findings)
2. Verify `.env` is ignored: `git check-ignore -v .env`
3. If ANY credentials found → **ABORT** and notify user immediately
4. NEVER commit: `.env*`, `*serviceAccount*.json`, `*credentials*.json`, `phase*-lint*.json`

## USER ACTION NOTES CHANNEL (MANDATORY)

When implementation requires any manual user task, Copilot MUST log it in:

- `[copilot/ACTIVE-GOVERNANCE/user-action-notes.md](copilot/ACTIVE-GOVERNANCE/user-action-notes.md)`

Required fields per entry:
1. Date and related task/plan.
2. Exact action the user must perform.
3. Reason/impact if skipped.
4. Status (`OPEN` until user confirms completion).

Never include real secrets in this file. Use safe placeholders for `.env` guidance.

---

## FILE REFERENCE NAVIGATION (MANDATORY)

For all operational docs/logs/plans/explanations, reference files using clickable Markdown links so Ctrl+Click opens the target directly.

- File path: `[path/to/file.ext](path/to/file.ext)`
- Specific line: `[path/to/file.ext](path/to/file.ext#L10)`
- Use workspace-relative paths and `/` separators.
- Applies to updates in `copilot/plans/**`, `copilot/explanations/**`, and related logs.

---

##�🚫 BANNED ACTIONS & TERMINAL RESTRICTIONS (CRITICAL)
When operating in Bypass Approvals or Autopilot mode, you have terminal access. You must exercise extreme caution and strictly adhere to these limitations:

1. **NO EXTERNAL TOOL CALLS**: You are strictly forbidden from making external API calls, webhook triggers, or using any external tools outside of the local VS Code environment. 
2. **COMMAND AUTHORIZATION MANDATORY**: All shell commands MUST comply with the authorization system:
   - Check `copilot/ACTIVE-GOVERNANCE/ALLOWED_COMMANDS.md` — execute these immediately
   - Check `copilot/ACTIVE-GOVERNANCE/FORBIDDEN_COMMANDS.md` — NEVER execute these
   - Unknown commands → Log in `copilot/ACTIVE-GOVERNANCE/PENDING_COMMANDS.md` and ask user
3. **NO DEPLOYMENTS**: You must NEVER run deployment commands (enforced in FORBIDDEN_COMMANDS.md) 
   - **ABSOLUTELY BANNED**: `firebase deploy --only firestore:rules` (or any variation). Multiple developers may be modifying Firestore schemas simultaneously; deploying from an agent will cause disastrous overwrites.
   - **BANNED**: `firebase deploy`, `npm run deploy`, or any command that pushes code to production or staging.
4. **NO DESTRUCTIVE COMMANDS**: Do not run `rm -rf` on root directories, do not drop databases, and do not reset git branches hard (`git reset --hard`) without explicit user permission.
5. **NO MAIN BRANCH PUSHES** (AUTOPILOT CRITICAL, enforced in FORBIDDEN_COMMANDS.md): 
   - **ABSOLUTELY BANNED**: Pushing to `main` branch in any case
   - **ABSOLUTELY BANNED**: Committing directly to `main` branch
   - **REQUIRED**: Always verify current branch before any push (`git branch --show-current`)
   - **REQUIRED**: If on `main`, create new feature branch immediately (see `copilot/ACTIVE-GOVERNANCE/git-workflow-rules.md`)
6. **NO FORCE PUSHES**: Banned: `git push -f`, `git push --force` (protection for collaborative work, enforced in FORBIDDEN_COMMANDS.md)
7. **NO RISKY PACKAGE INSTALLS IN AUTOPILOT**: You MUST NOT install new libraries/packages (not already in `package.json`) without explicit user permission. In autopilot mode, you CANNOT use `vscode/askQuestions` for this (because autopilot auto-replies). Instead, log the request in `copilot/ACTIVE-GOVERNANCE/PENDING_COMMANDS.md` and **WAIT** for user approval. If the package is already listed in `package.json` (installed in the repo but not locally), you MAY run `npm install` without asking.
8. **NO RISKY COMMANDS VIA AUTO-REPLY**: In autopilot mode, `vscode/askQuestions` is auto-replied by the agent. Therefore, you MUST NOT use `vscode/askQuestions` to authorize risky operations (package installs, destructive commands, permission changes). Use `PENDING_COMMANDS.md` for these and wait for human decision.


## 🔄 Autopilot Execution Loop
**CRITICAL: [`copilot/ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md`](copilot/ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md) is MANDATORY for all autopilot work. Follow it 100% of the time. All 24 steps, in order, no exceptions.**

When operating in Autopilot mode, follow this exact loop until the task is complete:

1. **Pre-Execution Clarification**: Before any code or documentation changes, ensure the task is fully understood. If there is any ambiguity, missing detail, or uncertainty about requirements, use `vscode/askQuestions` to clarify with the user before proceeding. Do not proceed until the scope, constraints, and expected outcomes are clear.
2. **Setup & Authorization** (REQUIRED): 
   - Read `copilot/README.md` (Master navigation hub)
   - Read `copilot/ACTIVE-GOVERNANCE/git-workflow-rules.md` (Git discipline rules)
   - If prompt/chat references `AUTOPILOT_PLAN.md` or says "autopilot plan", immediately execute checklist Step 0.5 intake detection against `AUTOPILOT_PLAN.md` and `copilot/plans/AUTOPILOT_PLAN.md`
   - Resolve local `COPILOT_PC_ID` before any file edits
   - If `COPILOT_PC_ID` is missing/empty: STOP immediately
   - Check current branch: `git branch --show-current`
   - Verify branch owner in `copilot/BRANCHES_STATUS.md` matches `COPILOT_PC_ID`
   - Verify branch owner in `BRANCH_LOG.md` matches `COPILOT_PC_ID` (if log exists)
   - If ownership mismatch exists: STOP immediately (no edits, no commits)
   - If on `main`: Create new feature branch (`git checkout -b feature/<task-name>`)
   - If on feature branch: Continue on existing branch
   - When creating a new branch, immediately update `copilot/BRANCHES_STATUS.md` on `development` with the branch and summary, then commit and push
   - Do NOT start implementation until branch registration is visible on `development`
   - If current branch parent is `development` and a new plan is requested: create a child branch from current branch, execute the new plan on child branch, and record `parent-branch` in child `BRANCH_LOG.md`
   - **Command execution MUST follow the authorization framework:**
     - Check `copilot/ACTIVE-GOVERNANCE/ALLOWED_COMMANDS.md` before executing any command
     - Check `copilot/ACTIVE-GOVERNANCE/FORBIDDEN_COMMANDS.md` to ensure command is not banned
     - If command is unknown, log in `copilot/ACTIVE-GOVERNANCE/PENDING_COMMANDS.md` and ask user via `vscode/askQuestions`
3. **Context & Plan**: Read `copilot-instructions.md` and relevant files in `copilot/explanations/`.
4. **Execute**: Make surgical code changes (following the Lossless Change Protocol).
5. **Commit & Push** (PERIODIC) - WITH CREDENTIAL SECURITY SCAN:
   - **MANDATORY**: Before `git commit`, scan for credentials: `npm run security:scan:staged` (MUST pass)
   - **MANDATORY**: Verify `.env` is ignored: `git check-ignore -v .env` (must show it's ignored)
   - After each logical work unit, commit with proper message format
   - **CADENCE GATE (NON-NEGOTIABLE)**: Do NOT start a second major work block until the prior validated block has both commit and push completed
   - **BLOCK TRANSITION RULE**: feature block -> validate -> commit -> push -> only then next feature block
   - Use format: `<type>(<scope>): <subject>` (see git-workflow-rules.md)
   - **MANDATORY**: Before `git push`, scan entire branch: `npm run security:scan:branch` (MUST pass)
   - If ANY secrets found → STOP and ask user before proceeding
   - Push to feature branch: `git push origin <branch-name>`
6. **Test Generation**: If you created a new component, utility, or feature, you MUST create a corresponding test file.
7. **Validate & Test**: Run local validation (`npm run test`) via the `terminal` tool. **(Local execution only. See BANNED ACTIONS).**
8. **Analyze**: If tests fail, automatically read the errors, devise a fix, and repeat steps 4-7. Do NOT halt to ask the user to fix test failures.
9. **Document**: Generate the required lossless report in `copilot/explanations/temporal/lossless-reports/`.
   - If manual user follow-up exists, append/update `OPEN` items in `[copilot/ACTIVE-GOVERNANCE/user-action-notes.md](copilot/ACTIVE-GOVERNANCE/user-action-notes.md)`.
10. **Self-Response Loop** (REQUIRED): After completing each major work block, execute vscode/askQuestions:
    - Question: "Continue with next phase or proceed to final verification?"
    - Response: **Autopilot must answer itself** and continue autonomously
    - **Repeat this loop until 100% of task is complete**
11. **Branch Lifecycle Management** (REQUIRED DURING MERGE): When merging a feature branch into its parent branch:
    - See: [`copilot/ACTIVE-GOVERNANCE/BRANCH_RETENTION_POLICY.md`](copilot/ACTIVE-GOVERNANCE/BRANCH_RETENTION_POLICY.md)
    - After merge: Mark branch as `pending-delete` in BRANCHES_STATUS.md with today's date
    - Merged branches are scheduled for auto-deletion after 7-day grace period
    - If retention needed for audit/compliance, set Status to `retained` with documented reason
    - Check for expired branches (> 7 days pending-delete) and delete them from both GitHub and local
11.5 **Human Merge Approval Gate** (REQUIRED):
   - Read `BRANCH_LOG.md` and verify both `Autopilot Status` and `Merge Status`
   - If `Autopilot Status` is `true`, merge is forbidden until `Merge Status` is explicitly `approved` by a real human
   - Merge target MUST match `parent-branch` declared in `BRANCH_LOG.md`
   - Do NOT use `vscode/askQuestions` to ask whether to merge in autopilot mode
   - If status is `pending-human-approval` or `denied`, stop before merge and wait for human branch-log update
12. **Final Verification**: When all work is done, run final verification via vscode/askQuestions with full checklist
13. **Terminate**: Only call the `task_complete` tool when ALL above steps are 100% finished, all tests pass, and final verification confirms completion.

### Premium Anti-Waste Enforcement (MANDATORY)
1. **No micro-delivery responses**: If the user requested a complete plan or full implementation, do not stop after tiny edits.
2. **Substantial completion threshold**: A turn is incomplete if it only changes wording/format while core requested artifacts remain missing.
3. **Plan completeness rule**: Plan requests require full package creation in one request (README, strategy roadmap, detailed phases, validation checklist, test strategy, rollout/rollback gates).
4. **Continue until done**: If any requested artifact is still missing, keep executing without asking “continue?” unless blocked by true ambiguity.

5. **vscode/askQuestions Leverage Step Enforcement (CRITICAL, NO EXCEPTIONS)**: The agent MUST ALWAYS execute the `vscode/askQuestions` leverage step before completing any premium request. See canonical protocol: [copilot/protocols/vscode-askQuestions-leverage-step.md](copilot/protocols/vscode-askQuestions-leverage-step.md). If the tool fails, document the failure and request user direction before ending the session. No exceptions.


## 🛠️ Environment & Validation Commands
Use these commands in the terminal to validate your work autonomously:
- **Test Suite (MANDATORY)**: `npm run test` (or specific test command like `npm run test -- <filename>`). All tests must pass.
- **Linting/Syntax Check**: `npm run lint` (Must pass with 0 errors related to your changes).
- **Type Checking**: `npx tsc --noEmit`
- **Build Verification**: `npm run build` (Run if modifying configs or core layouts).

## 🛑 Autopilot Guardrails & Abort Conditions
1. **Infinite Loops**: If you try to fix the same test failure 3 times without success, STOP. Document the failure state and ask the user for direction.
2. **Destructive Firebase Changes**: STOP and ask if modifying `firestore.rules` revokes access.
3. **Missing Dependencies**: Propose via `vscode/askQuestions` first.
4. **Git Branch Protection** (AUTOPILOT ONLY):
   - **STOP IMMEDIATELY** if current branch is `main` before making any commits
   - **STOP IMMEDIATELY** if `COPILOT_PC_ID` is missing/empty
   - **STOP IMMEDIATELY** if branch owner does not match `COPILOT_PC_ID`
   - **CREATE NEW FEATURE BRANCH** and migrate work if needed (see git-workflow-rules.md)
   - **PLAN ISOLATION RULE**: if branch parent is `development` and a new plan is requested, create child branch from current branch and execute there
   - **VERIFY BRANCH** before every push: `git branch --show-current` must NOT return "main"
5. **Push Failures**: If push fails, diagnose cause (conflicts, permissions) via `git status`. Ask user for direction if unresolvable.
6. **Git History Corruption**: Do NOT use `git reset --hard`, `git rebase -i`, or destructive Git operations without explicit user permission.

## ✅ Definition of Done (DoD)
Before calling `task_complete`, you must internally verify:
- [ ] **All tests are passing (`npm run test` returns cleanly).**
- [ ] **New functionality has corresponding test coverage.**
- [ ] No `console.log` statements were left behind.
- [ ] All new text elements are in Spanish.
- [ ] No emojis were used in the UI (icons only).
- [ ] TypeScript-first respected: no new JS/JSX duplicates when TS/TSX equivalent exists.
- [ ] File paths are commented at the top of all touched files.
- [ ] **Component Registry Checked/Updated:** If a new reusable UI element was created, it was added to [copilot/REFERENCE/COMPONENT_REGISTRY.md](copilot/REFERENCE/COMPONENT_REGISTRY.md). If an existing one was modified, the registry props were updated.
- [ ] **UI Patterns Consulted:** For any Tailwind class patterns (overlays, scrollbars, cards, buttons, forms, states, tabs), [copilot/REFERENCE/UI_PATTERNS_INDEX.md](copilot/REFERENCE/UI_PATTERNS_INDEX.md) was consulted before writing custom HTML/Tailwind.
- [ ] Manual user-required actions are captured in `[copilot/ACTIVE-GOVERNANCE/user-action-notes.md](copilot/ACTIVE-GOVERNANCE/user-action-notes.md)` or explicitly marked none.
- [ ] **ILHP Architecture Updated:** If the implementation touched any feature covered by `copilot/institution-health-protocol/architectures/`, the corresponding architecture document was updated with an append-only changelog entry.
- [ ] Commit/push cadence gate respected across all major work blocks (no skipped Git logging checkpoints).
   - [ ] Ask the user using vscode/askQuestions if it should end the request or there is anything left (MANDATORY, NO EXCEPTIONS). This leverage step is a hard-coded protocol and must be executed before completing any premium request. If the tool fails, document the failure and request user direction before ending the session.