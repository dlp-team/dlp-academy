<!-- copilot/templates/BRANCH_LOG.md -->
# {{BRANCH_NAME}} – Branch Log

**For multi-agent coordination and work progress tracking**

---

## Metadata

- **Current Branch:** {{BRANCH_NAME}}
- **Created:** {{DATE_CREATED}}
- **Owner:** {{OWNER_ID}} (e.g., `pc<id>`)
- **Parent Branch:** {{PARENT_BRANCH}} (main | development | feature/...)
- **Derived From Branch:** {{DERIVED_FROM_BRANCH or "none"}}
- **Owner Validation:** `COPILOT_PC_ID` must equal `Owner` before any file edit
- **Permission Gate:** pass | fail (if fail, STOP and do not edit)
- **Status:** active | paused | blocked | ready-for-merge | testing
- **Autopilot Active:** true | false
- **Related Plan:** {{PLAN_FILE or "None"}} (e.g., `copilot/plans/active/my-plan/README.md`)
- **Last Updated:** {{DATE_UPDATED}}

---

## Autopilot Status

- **Autopilot Active:** true | false
- **Trigger Source:** AUTOPILOT_PLAN.md | manual | other
- **Current Checklist Step:** {{STEP_NUMBER}}

---

## Branch Identity

- **Current Branch:** {{BRANCH_NAME}}
- **Parent Branch:** {{PARENT_BRANCH}} (MANDATORY for every branch; merge target must match this value)
- **Derived From Branch:** {{DERIVED_FROM_BRANCH or "none"}}
- **Derived Branch Rule:** If this branch was created from another branch, parent branch must be explicitly recorded and preserved.
- **Lineage Policy:** Preserve all related plans from current or ancestor branch lineage. Do not delete prior lineage plan entries when adding a new plan.

---

## Related Plans (Lineage Registry)

Track all plans associated with this branch lineage.

| Plan Path | Lifecycle | Origin Branch | Relationship | Notes |
|---|---|---|---|---|
| {{copilot/plans/active/example-plan/}} | active | {{BRANCH_NAME}} | current-branch | {{current executing plan}} |
| {{copilot/plans/finished/previous-plan/}} | finished | {{BRANCH_NAME}} | current-branch | {{predecessor plan preserved for traceability}} |
| {{copilot/plans/active/ancestor-plan/}} | active | {{PARENT_BRANCH}} | ancestor-branch | {{if inherited from parent branch}} |

---

## Merge Status

- **Merge Permission:** pending-human-approval | approved | denied
- **Merge Target Branch:** {{PARENT_BRANCH}} (MUST match Branch Identity parent branch)
- **Approved By (Human):** {{NAME_OR_ID}}
- **Approval Date:** {{YYYY-MM-DD}}
- **Approval Evidence:** {{PR comment / note / link}}
- **Policy:** If Autopilot Active is true, do not use vscode/askQuestions to request merge authorization.

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
- [ ] Merge permission approved by real human in Merge Status
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
