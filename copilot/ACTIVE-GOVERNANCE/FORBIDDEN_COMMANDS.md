// copilot/autopilot/FORBIDDEN_COMMANDS.md

# Forbidden Commands for Copilot Autopilot Mode

## Forbidden Commands

### Deployment and External State Mutation
- `firebase deploy`
- `firebase deploy --only firestore:rules`
- `firebase deploy --only firestore:indexes`
- `npm run deploy`
- Any infrastructure apply command against shared environments

### Main Branch and History Rewrite
- `git push origin main`
- `git commit --amend`
- `git push -f`
- `git push --force`
- `git reset --hard`
- `git rebase -i`

### Unsafe Revert and Cleanup Commands
- `git checkout -- <file>`
- `git checkout .`
- `git restore --source=<rev> -- <path>`
- `git clean -fd`
- `git clean -fdx`

### High-Risk File System Commands
- `rm -rf /`
- `rm -rf *` (or equivalent wildcard destructive deletes)
- Any command that modifies system-level directories

### Other Banned Patterns
- `git add .` (broad staging)
- Any command with unknown production impact executed without pending review

## Notes
- Unknown commands are not implicitly allowed; they must be reviewed via `PENDING_COMMANDS.md`.
- If emergency override is required, user must explicitly approve and decision must be logged.
