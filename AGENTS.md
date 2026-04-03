<!-- AGENTS.md -->
# Autonomous Execution Guidelines (AGENTS.md)

## CRITICAL: CREDENTIAL SECURITY BEFORE ANY GIT OPERATION

🚨 **ABSOLUTE RULE**: NEVER hardcode ANY API key - even old, test, or example keys.
- GitGuardian detects EVEN OLD, INACTIVE, or EXAMPLE API keys
- Even keys in comments or docs will be flagged
- **SOLUTION**: Use environment variables ONLY

**INCIDENT**: April 2, 2026 - Firebase API key leaked via build artifact.  
**ACTION**: Before EVERY `git add`, `git commit`, or `git push`:
1. Run `git diff --cached | grep -iE "AIza|private_key|password|secret|token"` and verify ZERO matches
2. Verify `.env` is ignored: `git check-ignore -v .env`
3. If ANY credentials found → **ABORT** and notify user immediately
4. NEVER commit: `.env*`, `*serviceAccount*.json`, `*credentials*.json`, `phase*-lint*.json`

---

##�🚫 BANNED ACTIONS & TERMINAL RESTRICTIONS (CRITICAL)
When operating in Bypass Approvals or Autopilot mode, you have terminal access. You must exercise extreme caution and strictly adhere to these limitations:

1. **NO EXTERNAL TOOL CALLS**: You are strictly forbidden from making external API calls, webhook triggers, or using any external tools outside of the local VS Code environment. 
2. **COMMAND AUTHORIZATION MANDATORY**: All shell commands MUST comply with the authorization system:
   - Check `copilot/autopilot/ALLOWED_COMMANDS.md` — execute these immediately
   - Check `copilot/autopilot/FORBIDDEN_COMMANDS.md` — NEVER execute these
   - Unknown commands → Log in `copilot/autopilot/PENDING_COMMANDS.md` and ask user
3. **NO DEPLOYMENTS**: You must NEVER run deployment commands (enforced in FORBIDDEN_COMMANDS.md) 
   - **ABSOLUTELY BANNED**: `firebase deploy --only firestore:rules` (or any variation). Multiple developers may be modifying Firestore schemas simultaneously; deploying from an agent will cause disastrous overwrites.
   - **BANNED**: `firebase deploy`, `npm run deploy`, or any command that pushes code to production or staging.
4. **NO DESTRUCTIVE COMMANDS**: Do not run `rm -rf` on root directories, do not drop databases, and do not reset git branches hard (`git reset --hard`) without explicit user permission.
5. **NO MAIN BRANCH PUSHES** (AUTOPILOT CRITICAL, enforced in FORBIDDEN_COMMANDS.md): 
   - **ABSOLUTELY BANNED**: Pushing to `main` branch in any case
   - **ABSOLUTELY BANNED**: Committing directly to `main` branch
   - **REQUIRED**: Always verify current branch before any push (`git branch --show-current`)
   - **REQUIRED**: If on `main`, create new feature branch immediately (see `copilot/autopilot/git-workflow-rules.md`)
6. **NO FORCE PUSHES**: Banned: `git push -f`, `git push --force` (protection for collaborative work, enforced in FORBIDDEN_COMMANDS.md)


## 🔄 Autopilot Execution Loop
When operating in Autopilot mode, follow this exact loop until the task is complete:

1. **Pre-Execution Clarification**: Before any code or documentation changes, ensure the task is fully understood. If there is any ambiguity, missing detail, or uncertainty about requirements, use `vscode/askQuestions` to clarify with the user before proceeding. Do not proceed until the scope, constraints, and expected outcomes are clear.
2. **Setup & Authorization** (REQUIRED): 
   - Read `copilot/autopilot/README.md` (Command authorization overview)
   - Read `copilot/autopilot/git-workflow-rules.md` (Git discipline rules)
   - Check current branch: `git branch --show-current`
   - If on `main`: Create new feature branch (`git checkout -b feature/<task-name>`)
   - If on feature branch: Continue on existing branch
   - **Command execution MUST follow the authorization framework:**
     - Check `copilot/autopilot/ALLOWED_COMMANDS.md` before executing any command
     - Check `copilot/autopilot/FORBIDDEN_COMMANDS.md` to ensure command is not banned
     - If command is unknown, log in `copilot/autopilot/PENDING_COMMANDS.md` and ask user via `vscode/askQuestions`
3. **Context & Plan**: Read `copilot-instructions.md` and relevant files in `copilot/explanations/`.
4. **Execute**: Make surgical code changes (following the Lossless Change Protocol).
5. **Commit & Push** (PERIODIC) - WITH CREDENTIAL SECURITY SCAN:
   - **MANDATORY**: Before `git commit`, scan for credentials: `git diff --cached | grep -iE "AIza|private_key|password|secret|token"` (MUST return zero matches)
   - **MANDATORY**: Verify `.env` is ignored: `git check-ignore -v .env` (must show it's ignored)
   - After each logical work unit, commit with proper message format
   - **CADENCE GATE (NON-NEGOTIABLE)**: Do NOT start a second major work block until the prior validated block has both commit and push completed
   - **BLOCK TRANSITION RULE**: feature block -> validate -> commit -> push -> only then next feature block
   - Use format: `<type>(<scope>): <subject>` (see git-workflow-rules.md)
   - **MANDATORY**: Before `git push`, scan entire branch: `git diff origin/main..HEAD | grep -iE "AIza|private_key"` (MUST return zero matches)
   - If ANY secrets found → STOP and ask user before proceeding
   - Push to feature branch: `git push origin <branch-name>`
6. **Test Generation**: If you created a new component, utility, or feature, you MUST create a corresponding test file.
7. **Validate & Test**: Run local validation (`npm run test`) via the `terminal` tool. **(Local execution only. See BANNED ACTIONS).**
8. **Analyze**: If tests fail, automatically read the errors, devise a fix, and repeat steps 4-7. Do NOT halt to ask the user to fix test failures.
9. **Document**: Generate the required lossless report in `copilot/explanations/temporal/lossless-reports/`.
10. **Self-Response Loop** (REQUIRED): After completing each major work block, execute vscode/askQuestions:
    - Question: "Continue with next phase or proceed to final verification?"
    - Response: **Autopilot must answer itself** and continue autonomously
    - **Repeat this loop until 100% of task is complete**
11. **Final Verification**: When all work is done, run final verification via vscode/askQuestions with full checklist
12. **Terminate**: Only call the `task_complete` tool when ALL above steps are 100% finished, all tests pass, and final verification confirms completion.

### Premium Anti-Waste Enforcement (MANDATORY)
1. **No micro-delivery responses**: If the user requested a complete plan or full implementation, do not stop after tiny edits.
2. **Substantial completion threshold**: A turn is incomplete if it only changes wording/format while core requested artifacts remain missing.
3. **Plan completeness rule**: Plan requests require full package creation in one request (README, strategy roadmap, detailed phases, validation checklist, test strategy, rollout/rollback gates).
4. **Continue until done**: If any requested artifact is still missing, keep executing without asking “continue?” unless blocked by true ambiguity.

5. **vscode/askQuestions Leverage Step Enforcement (CRITICAL, NO EXCEPTIONS)**: The agent MUST ALWAYS execute the `vscode/askQuestions` leverage step before completing any premium request, using a concise prompt (<200 characters). If the tool fails (e.g., input too long, tool unavailable), document the failure and request user direction before ending the session. No exceptions.


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
   - **CREATE NEW FEATURE BRANCH** and migrate work if needed (see git-workflow-rules.md)
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
- [ ] File paths are commented at the top of all touched files.
- [ ] Commit/push cadence gate respected across all major work blocks (no skipped Git logging checkpoints).
   - [ ] Ask the user using vscode/askQuestions if it should end the request or there is anything left (MANDATORY, NO EXCEPTIONS). This leverage step is a hard-coded protocol and must be executed before completing any premium request. If the tool fails, document the failure and request user direction before ending the session.