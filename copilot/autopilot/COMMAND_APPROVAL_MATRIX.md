// copilot/autopilot/COMMAND_APPROVAL_MATRIX.md

# Command Approval Matrix (Trust-by-Default-Deny)

## Purpose
Classify commands into deterministic risk tiers so autonomous execution remains safe, auditable, and fast.

## Approval Policy Matrix
| Category | Examples | Risk Tier | Default Policy | Review Requirement |
|---|---|---|---|---|
| Read-only context | `git status`, `git log`, `rg`, `cat` | Low | Auto-allow | None |
| QA and analysis | `npm run lint`, `npm run test`, `npx tsc --noEmit` | Low-Medium | Auto-allow | None |
| Local file mutation | `mv`, `cp`, `mkdir`, scoped `rm <file>` | Medium | Allow with scope discipline | Must stay in workspace |
| Git state mutation | `git commit`, `git push origin <feature-branch>` | Medium-High | Allow with safety gates | Branch + scan + validation required |
| History rewrite/destructive | `git reset --hard`, `git push -f`, `git checkout -- <file>` | Critical | Forbidden | Explicit user override only |
| External state / deploy | `firebase deploy`, infra apply commands | Critical | Forbidden | Never in autopilot |
| Unknown or ambiguous | Any uncategorized command | Unknown | Pending queue | User decision required |

## Mandatory Safety Gates
1. Never execute commands that target `main` branch mutations.
2. Unknown commands must be logged in `PENDING_COMMANDS.md` before execution.
3. Security scans are mandatory before commit and push blocks.
4. Destructive or deployment commands remain forbidden.

## Conflict Resolution Escalation
When merge conflicts occur:
1. Attempt semantic-intent resolution with local validation.
2. If behavior intent is ambiguous, escalate with a concise conflict report.
3. Do not use destructive shortcuts to force clean state.

## Audit Trail Expectations
Each major command block should be traceable via:
- command category,
- validation outcome,
- associated plan phase,
- rollback path.
