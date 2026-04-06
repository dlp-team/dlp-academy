# vscode/askQuestions Leverage Step Protocol

**Date Established:** April 6, 2026  
**Status:** MANDATORY FOR ALL PREMIUM REQUESTS  
**Enforcement Level:** CRITICAL (NO EXCEPTIONS)

---

## CRITICAL ENFORCEMENT RULE

This step is **MANDATORY for ALL premium requests**. 

- This step **supersedes all other completion logic**
- **NO EXCEPTIONS** allowed—ever
- Applies globally to all Copilot modes (Ask, Plan, Agent)
- Non-compliance = incomplete task delivery

**Original Enforcement Date:** March 12, 2026

---

## WHEN TO EXECUTE

Execute `vscode/askQuestions` **after and only after:**

1. ✅ ALL requested work is 100% complete
2. ✅ ALL validation steps have passed (tests, lint, type-check)
3. ✅ ALL documentation has been updated (explanations, lossless reports)
4. ✅ ALL Git commits have been made and pushed (if applicable)
5. ✅ Definition of Done checklist verified complete

**DO NOT execute before this juncture.** The leverage step is the final gate before yielding to user.

---

## QUESTION FORMAT & CONTENT

**Keep concise:** <200 characters, clear language

**Structure:**
```
Header: Brief status confirmation or decision needed
Options: 2-3 clear, mutually exclusive, option or next step

Example 1 (Completion):
"All phases complete, tests passing, docs synced. Ready to close?"
- [ ] Yes, close task
- [ ] Hold, I have follow-ups
- [ ] Ask me something else first

Example 2 (Feature work):
"Feature implemented and all tests passing. Proceed with docs sync and closure?"
- [ ] Yes, proceed and close
- [ ] Need to review code first
- [ ] Continue with next feature

Example 3 (Plan work):
"All phases executed and verified. Ready to finalize plan and move to finished?"
- [ ] Yes, finalize
- [ ] Hold, need more review
- [ ] Continue refining
```

---

## FAILURE HANDLING

If `vscode/askQuestions` tool fails (input too long, unavailable, etc.):

1. **Document immediately:**
   - Timestamp
   - Tool error message
   - What question was attempted

2. **Request explicit user direction via message:**
   ```
   vscode/askQuestions tool unavailable at closure.
   
   Status: [summarize task completion]
   
   Please confirm: Should I proceed with task closure or hold pending your input?
   ```

3. **DO NOT proceed to task_complete without explicit user approval**

4. **Log failure in session memory** for transparency

---

## EXCEPTIONS

**None.** This is absolute.

There are no scenarios where this step is optional or can be skipped, regardless of:
- Task complexity (simple → NO exception)
- Time pressure (urgent → NO exception)
- Previous user acknowledgment (assumed prior approval → NO exception)
- Task type (answer, code, plan, document → NO exception)

---

## INTEGRATION WITH OTHER PROTOCOLS

### vs. Code-Explanation Protocol
- **Code Explanation:** Execute automatically WITHIN the response (generate docs immediately after code changes)
- **Leverage Step:** Execute AFTER all explanations are complete (final user confirmation gate)

**Sequence:** Code → Explanation (automatic) → Validation → Leverage Step → Yield

### vs. Lossless-Change Protocol
- **Lossless Protocol:** Review data before completion; document preservation of behaviors
- **Leverage Step:** Final user confirmation that lossless review is acceptable and task is truly done

**Sequence:** Implement → Lossless Review → Validation → Leverage Step

### vs. Git-Workflow Protocol
- **Git Workflow:** Features → Validate → Commit → Push → vscode/askQuestions (self-response loop)
- **Leverage Step:** Final gate before task_complete

---

## QUICK REFERENCE

| Scenario | Question | Expected Options |
|---|---|---|
| Feature complete, tests pass | "Feature complete and tests passing. Close task?" | Yes, close / Hold for review / Continue |
| Plan phases done, docs synced | "All phases complete and docs synchronized. Finalize plan?" | Yes, finalize / Need more time / More phases |
| Bug fix validated | "Bug fixed and regression testing complete. Close?" | Yes, close / Need to verify more / Found new issue |
| Documentation update done | "Docs updated and spell-checked. Done?" | Yes, done / Need revisions / Continue editing |
| Any other work complete | "All requested work complete and validated. Proceed to closure?" | Yes / No / Ask me first |

---

## METRICS & OBSERVABILITY

Track compliance:
- Count: Tasks with leverage step executed ✅
- Count: Tasks skipped leverage step ❌
- Count: Tool failures and recovery outcomes

---

## RELATED DOCUMENTS

- [.github/copilot-instructions.md#vscode-askquestions-leverage](../../.github/copilot-instructions.md) – Premium request optimization standards
- [AGENTS.md#definition-of-done](../../AGENTS.md) – Autopilot DoD checklist
- [git-workflow-rules.md#self-response-loop](../autopilot/git-workflow-rules.md) – Self-response loop for autopilot
