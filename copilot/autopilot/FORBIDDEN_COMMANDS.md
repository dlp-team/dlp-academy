// copilot/autopilot/FORBIDDEN_COMMANDS.md

# Forbidden Commands for Copilot Autopilot Mode

This file lists all shell commands that Copilot is strictly forbidden from executing in Autopilot mode, with descriptions and reasons.

## Forbidden Commands

- `firebase deploy --only firestore:rules` (Deploys Firestore rules, risk of overwriting and lockout)
- `firebase deploy --only firestore:indexes` (Deploys Firestore indexes, risk of overwriting)
- `firebase deploy` (General deploy, risk of production changes)
- `npm run deploy` (General deploy, risk of production changes)
- `git push origin main` (Direct push to main branch)
- `git commit --amend` (Risk of rewriting history without proper review)
- `git push -f` or `git push --force` (Force push, risk of data loss)
- `git reset --hard` (Destructive history rewrite, risk of data loss)
- `git rebase -i` (Interactive rebase without explicit user permission)
- `rm -rf /` or any destructive root/system command
- Any command that modifies system-level files or directories
- Any npm/node commands that interact with system-level resources

## Notes
- Any command not explicitly allowed or forbidden must be logged in PENDING_COMMANDS.md for review.
- **Special Case: `git reset --hard`** - Listed as forbidden by default, but if Copilot needs to reset feature branch state during rollback scenarios, user must explicitly approve in PENDING_COMMANDS.md
- **Special Case: Migration scripts** - Allowed by pattern `node scripts/migrate*.cjs`, but each script should be understood before first execution
