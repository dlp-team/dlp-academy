
// copilot/autopilot/ALLOWED_COMMANDS.md

# Allowed Commands for Copilot Autopilot Mode

This file lists all shell commands that Copilot is allowed to execute in Autopilot mode, with descriptions and any relevant notes.

## Allowed Commands

### Test & Validation Commands
- `npm run test` (Runs all tests)
- `npm run test -- <filename>` (Runs specific test file)
- `npm run test -- --coverage` (Generates test coverage report)
- `npm run test:firestore` (Runs Firestore rules tests) [ALIAS for test:rules]
- `npm run test:rules` (Runs Firestore security rules tests)
- `npm run test:e2e` (Runs end-to-end tests)
- `npx tsc --noEmit` (TypeScript type checking without emitting files)
- `npm run lint` (Runs ESLint on the codebase)
- `npm run lint firestore.rules` (Lint Firestore rules for syntax)
- `npm run build` (Builds the project for production)
- `npm run dev` (Starts development server for manual testing)
- `npx playwright test` (Runs Playwright tests)
- `npx playwright test <file>` (Runs specific Playwright test file)
- `npx playwright test tests/e2e/<test-name>` (Runs specific E2E test)
- `npx vitest` (Runs Vitest tests)
- `firebase emulators:exec --only firestore "npm run test:rules"` (Runs rules tests with Firebase emulator)

### Git/GitHub Commands
- `git status` (Check current branch and uncommitted changes)
- `git branch` (List or create branches)
- `git branch --show-current` (Show currently active branch)
- `git checkout <branch>` (Switch branches)
- `git checkout -b <branch>` (Create and switch to new branch)
- `git checkout -b feature/<task-name>` (Create feature branch for task)
- `git checkout -- <file>` (Discard changes to specific file)
- `git checkout -- src/` (Discard all changes to src directory)
- `git checkout HEAD -- <file>` (Restore specific file from HEAD)
- `git add .` or `git add <file>` (Stage files for commit)
- `git commit -m "<msg>"` (Commit staged changes with message)
- `git push origin <branch>` (Push to remote branch, NOT main)
- `git merge <branch>` (Merge branches, with caution, not on main)
- `git rebase <branch>` (Rebase, with caution, not on main)
- `git log --oneline` (View commit history)
- `git log --oneline <file>` or `git log --oneline <file1> <file2>` (View history for specific files)
- `git diff`, `git diff --staged` (View file changes)
- `git show <commit>:<file>` (Show file content from prior commit)

### File Operations
- `mv <src> <dest>` (Move or rename files/folders)
- `cp <src> <dest>` (Copy files/folders)
- `rm <file>` (Remove files)
- `mkdir <dir>` (Create directories)
- `rmdir <dir>` (Remove empty directories)

### NPM/Node Commands
- `npm install` (Install all dependencies from package.json)
- `npm install <package>` (Install specific package)
- `node <script.js>` (Run Node.js scripts)
- `node scripts/run-migration.cjs` (Run database migrations)
- `node scripts/backfill-institution-id.cjs` (Backfill institution IDs)
- `node scripts/migrate-*.cjs` (Run any migration script)
- `node scripts/migrations/*.cjs` (Run migration in migrations folder)

### Search/Utility Commands
- `grep <pattern> <file>` (Search for text patterns in files)
- `grep -r <pattern> <dir>` (Recursive file search)
- `find <dir> -name <pattern>` (Find files by name/pattern)
- `cat <file>` (Display file contents)
- `echo <text>` (Print text to output)

## Notes
- All commands must avoid affecting the `main` branch directly.
- No changing git branch unless specified on the prompt.
- No deployment or production-altering commands allowed.
- All commands must be logged for audit.
- Migrations can ONLY be done with the test mode, but not affecting firestore unless specified.
- Any command not on this list or the forbidden list must be logged in PENDING_COMMANDS.md for review.
