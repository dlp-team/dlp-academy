// copilot/autopilot/ALLOWED_COMMANDS.md

# Allowed Commands for Copilot Autopilot Mode

## Intent
Allow only low-to-medium risk commands that are reversible, auditable, and scoped to the workspace.

## Allowed Commands

### Read-Only Context Commands
- `git status`
- `git branch`
- `git branch --show-current`
- `git log --oneline`
- `git log --oneline <file>`
- `git diff`
- `git diff --staged`
- `git show <commit>:<file>`
- `rg <pattern>`
- `rg --files`
- `grep <pattern> <file>`
- `grep -r <pattern> <dir>`
- `find <dir> -name <pattern>`
- `cat <file>`
- `gh pr view --json statusCheckRollup,state,number`

### QA and Validation Commands
- `npm run lint`
- `npm run test`
- `npm run test -- <file>`
- `npm run test:rules`
- `npm run test:firestore`
- `npm run test:e2e`
- `npx vitest`
- `npx tsc --noEmit`
- `npm run build`
- `npx playwright test`
- `npx playwright test <file>`
- `firebase emulators:exec --only firestore "npm run test:rules"`
- `npm run security:scan:staged`
- `npm run security:scan:branch`
- `git check-ignore -v .env`

### Controlled Git Mutation (Feature Branches Only)
- `git checkout <branch>`
- `git checkout -b feature/<task-name>`
- `git fetch origin`
- `git pull origin <branch>`
- `git add <file>`
- `git commit -m "<msg>"`
- `git push origin <branch>`
- `gh pr create --base development --title "<title>" --body "<body>"`
- `gh pr merge --squash --delete-branch`

### Controlled File Mutation (Workspace Scope Only)
- `mkdir <dir>`
- `rmdir <dir>`
- `mv <src> <dest>`
- `cp <src> <dest>`
- `rm <file>`

### Controlled Node and NPM Commands
- `npm install`
- `npm install <package>`
- `node <script.js>`
- `node scripts/run-migration.cjs`
- `node scripts/backfill-institution-id.cjs`
- `node scripts/migrate-*.cjs`
- `node scripts/migrations/*.cjs`

## Mandatory Safety Conditions
1. Never run branch-mutation commands on `main`.
2. Use scoped staging (`git add <file>`), not broad staging.
3. Unknown commands must be added to `PENDING_COMMANDS.md` before execution.
4. Destructive revert and rewrite commands are not allowed here.

## Notes
- This allowlist is interpreted with [COMMAND_APPROVAL_MATRIX.md](COMMAND_APPROVAL_MATRIX.md).
- If command intent is ambiguous, route to pending review first.
