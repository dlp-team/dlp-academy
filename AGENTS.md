# Autonomous Execution Guidelines (AGENTS.md)

## 🚫 BANNED ACTIONS & TERMINAL RESTRICTIONS (CRITICAL)
When operating in Bypass Approvals or Autopilot mode, you have terminal access. You must exercise extreme caution and strictly adhere to these limitations:

1. **NO EXTERNAL TOOL CALLS**: You are strictly forbidden from making external API calls, webhook triggers, or using any external tools outside of the local VS Code environment. 
2. **NO DEPLOYMENTS**: You must NEVER run deployment commands. 
   - **ABSOLUTELY BANNED**: `firebase deploy --only firestore:rules` (or any variation). Multiple developers may be modifying Firestore schemas simultaneously; deploying from an agent will cause disastrous overwrites.
   - **BANNED**: `firebase deploy`, `npm run deploy`, or any command that pushes code to production or staging.
3. **NO DESTRUCTIVE COMMANDS**: Do not run `rm -rf` on root directories, do not drop databases, and do not reset git branches hard (`git reset --hard`) without explicit user permission.


## 🔄 Autopilot Execution Loop
When operating in Autopilot mode, follow this exact loop until the task is complete:

1. **Pre-Execution Clarification**: Before any code or documentation changes, ensure the task is fully understood. If there is any ambiguity, missing detail, or uncertainty about requirements, use `vscode/askQuestions` to clarify with the user before proceeding. Do not proceed until the scope, constraints, and expected outcomes are clear.
2. **Context & Plan**: Read `copilot-instructions.md` and relevant files in `copilot/explanations/`.
3. **Execute**: Make surgical code changes (following the Lossless Change Protocol).
4. **Test Generation**: If you created a new component, utility, or feature, you MUST create a corresponding test file.
5. **Validate & Test**: Run local validation (`npm run test`) via the `terminal` tool. **(Local execution only. See BANNED ACTIONS).**
6. **Analyze**: If tests fail, automatically read the errors, devise a fix, and repeat steps 3-5. Do NOT halt to ask the user to fix test failures.
7. **Document**: Generate the required lossless report in `copilot/explanations/temporal/lossless-reports/`.
8. **Terminate**: Only call the `task_complete` tool when ALL above steps are 100% finished and passing.

### Premium Anti-Waste Enforcement (MANDATORY)
1. **No micro-delivery responses**: If the user requested a complete plan or full implementation, do not stop after tiny edits.
2. **Substantial completion threshold**: A turn is incomplete if it only changes wording/format while core requested artifacts remain missing.
3. **Plan completeness rule**: Plan requests require full package creation in one request (README, strategy roadmap, detailed phases, validation checklist, test strategy, rollout/rollback gates).
4. **Continue until done**: If any requested artifact is still missing, keep executing without asking “continue?” unless blocked by true ambiguity.

5. **vscode/askQuestions Leverage Step Enforcement (CRITICAL, NO EXCEPTIONS)**: The agent MUST ALWAYS execute the `vscode/askQuestions` leverage step before completing any premium request. This protocol supersedes all other completion logic and is enforced in every completion flow, for all agent modes and workflows. If the tool fails, the agent must document the failure and request user direction before ending the session. No exceptions.


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

## ✅ Definition of Done (DoD)
Before calling `task_complete`, you must internally verify:
- [ ] **All tests are passing (`npm run test` returns cleanly).**
- [ ] **New functionality has corresponding test coverage.**
- [ ] No `console.log` statements were left behind.
- [ ] All new text elements are in Spanish.
- [ ] No emojis were used in the UI (icons only).
- [ ] File paths are commented at the top of all touched files.
   - [ ] Ask the user using vscode/askQuestions if it should end the request or there is anything left (MANDATORY, NO EXCEPTIONS). This leverage step is a hard-coded protocol and must be executed before completing any premium request. If the tool fails, document the failure and request user direction before ending the session.