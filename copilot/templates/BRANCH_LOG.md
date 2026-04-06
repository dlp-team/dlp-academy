# {{BRANCH_NAME}} – Branch Log

**For multi-agent coordination and work progress tracking**

---

## Metadata

- **Created:** {{DATE_CREATED}}
- **Owner:** {{OWNER_ID}} (e.g., `pc<id>`)
- **Parent Branch:** {{PARENT_BRANCH}} (main | development | feature/...)
- **Status:** active | paused | blocked | ready-for-merge | testing
- **Related Plan:** {{PLAN_FILE or "None"}} (e.g., `copilot/plans/active/my-plan/README.md`)
- **Last Updated:** {{DATE_UPDATED}}

---

## Purpose & Scope

{{Brief description: What is this branch meant to accomplish?}}

**Out of Scope:**
{{List anything intentionally excluded}}

---

## Work Phases

- **Phase 1:** {{Name}} – {{Brief description}}
- **Phase 2:** {{Name}} – {{Brief description}}
- **Phase 3:** {{Name}} – {{Brief description}}

---

## Multi-Agent Handoff Log

Use this table if work is being handed between multiple agents or sessions.

| Date | Time | From (Agent/ID) | To (Agent/ID) | Work Summary | Status | Blockers |
|---|---|---|---|---|---|---|
| YYYY-MM-DD | HH:MM | pc<id> | pc<id> | {{Brief description}} | active | {{None or blocker name}} |
| | | | | | | |

---

## Key Commits

Track important commits on this branch.

```
[commit_hash]: type(scope): message
[commit_hash]: type(scope): message
[commit_hash]: type(scope): message
```

---

## Testing & Validation

Mark completion as work progresses.

- [ ] All unit tests passing (`npm run test`)
- [ ] Linting clean (`npm run lint`)
- [ ] Type checking clean (`npx tsc --noEmit`)
- [ ] Documentation updated (explanations, user-action-notes)
- [ ] No regressions in adjacent features
- [ ] Security scans passing (`npm run security:scan:branch`)
- [ ] Code review checklist complete
- [ ] Manual testing on dev environment completed

---

## Blockers & Dependencies

Keep a running list of anything blocking progress.

| Blocker | Description | ETA | Owner | Status |
|---|---|---|---|---|
| {{Name}} | {{Description, root cause}} | {{Date or "TBD"}} | {{Owner}} | active |
| | | | | |

**Dependencies:**
- Dependency 1: {{Description}} (Required by: {{phase/feature}})
- Dependency 2: {{Description}} (Required by: {{phase/feature}})

---

## Technical Notes

Document implementation decisions, gotchas, or important context.

- **Note 1:** {{Description}}
- **Note 2:** {{Description}}
- **Note 3:** {{Description}}

---

## Handoff Checklist (Before Closure)

If handing off to another agent/session:

- [ ] All uncommitted work committed and pushed
- [ ] This BRANCH_LOG.md updated with current status
- [ ] Blockers section populated (any open items)
- [ ] Next agent's tasks clearly listed (in "Next Actions" section below)
- [ ] No ambiguity about what's done vs. in-progress

---

## Next Actions

For the next agent/session:

1. {{Action 1}}
2. {{Action 2}}
3. {{Action 3}}

---

## Closure Checklist (Before Merge)

When ready for merge:

- [ ] All phases completed and documented
- [ ] All tests passing
- [ ] All documentation updated
- [ ] All commits pushed
- [ ] All blockers resolved
- [ ] Code review approved
- [ ] BRANCHES_STATUS.md updated with status: "ready-for-merge"
- [ ] Lossless reports created in `copilot/explanations/temporal/lossless-reports/`

---

## Merge Details

Completed after branch is merged.

- **Merge Date:** {{DATE}}
- **Merged By:** {{ID}}
- **Merge Commit:** {{commit_hash}}
- **PR/Review Link:** {{Link if applicable}}
- **Deployment Status:** {{Not deployed | Staged | Production}}

---
