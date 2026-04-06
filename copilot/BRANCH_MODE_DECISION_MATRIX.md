# Branch Mode Decision Matrix

**Quick reference: When to use LOCKED vs. SHARED branches**

---

## Decision Tree

```
Are you the only Copilot/person working
on this feature right now?
│
├─ YES → Use LOCKED mode
│   └─ Branch name: feature/pc1/feature-name
│   └─ Only you push changes
│   └─ Others coordinate via external comments
│   └─ Simplest approach (90% of features)
│
└─ NO → Do you want to work simultaneously?
    │
    ├─ YES (pair programming) → Use SHARED mode
    │   └─ Branch name: feature/pc1-pc2/feature-name
    │   └─ Create WORKING_SESSION.md
    │   └─ Only ONE actively codes at a time
    │   └─ Handoff via session log
    │
    └─ NO (sequential handoff) → Use SHARED mode with schedule
        └─ Branch name: feature/you-fellow/feature-name
        └─ You work day shift (14:00-20:00)
        └─ Fellow works night shift (20:00-02:00)
        └─ Both use WORKING_SESSION.md to track handoffs
```

---

## Quick Reference Table

| Scenario | Mode | Branch Name Example | When to Use | Coordination |
|----------|------|---|---|---|
| **You single-handedly building a feature** | LOCKED | `feature/you/login-modal` | Most features (90%) | External comments if needed |
| **You + Fellow pair programming together** | SHARED | `feature/you-fellow/login-modal` | Complex features, emergencies | WORKING_SESSION.md, real-time chat |
| **You day shift, Fellow night shift** | SHARED | `feature/you-fellow/db-migration` | 24/7 coverage on same feature | WORKING_SESSION.md handoff log |
| **You building feature A, Fellow building feature B** | LOCKED (both) | `feature/you/auth`, `feature/fellow/dashboard` | Parallel, independent work | BRANCHES_STATUS.md, external comments if overlap |
| **Hotfix: both available, need fast turnaround** | SHARED | `feature/you-fellow/critical-auth-fix` | Emergencies only | Minimal overhead; coordinate verbally + WORKING_SESSION.md |
| **Feature that needs review from both of you** | LOCKED (one coding) | `feature/you/feature-x` + PR review | Standard work + peer review | PR comments, BRANCH_STATUS.md external comments |

---

## Mode Selection Flowchart (Visual)

```
START: New feature assigned

    ↓
Is this feature for you ALONE to build?
    │
    ├─ YES: Use LOCKED
    │   └─ 1. Create feature/you/feature-name
    │   └─ 2. You code, commit, push
    │   └─ 3. Others can review via PR
    │   └─ 4. You merge when done
    │
    └─ NO: Does it need real-time collaboration?
        │
        ├─ YES: Use SHARED
        │   └─ 1. Create feature/you-fellow/feature-name
        │   └─ 2. Create WORKING_SESSION.md
        │   └─ 3. One codes at a time
        │   └─ 4. Handoff via session log
        │   └─ 5. Both merge when done
        │
        └─ NO: Nope, actually you're good
            └─ It's probably LOCKED for you with handoff
            └─ Fellow takes over later
            └─ Just use LOCKED; they'll read BRANCH_STATUS.md
```

---

## Decision Examples

### Example 1: Login Modal Feature
**Task:** "Build a new login modal component"  
**You:** Building alone  
**Decision:** LOCKED  
**Branch:** `feature/you/login-modal`  
**Setup:** Just BRANCH_STATUS.md (no WORKING_SESSION.md needed)

---

### Example 2: Emergency Auth Bug
**Task:** "Auth tokens don't refresh during logout; breaks user session"  
**You:** Available right now  
**Fellow:** Can help immediately  
**Decision:** SHARED (pair work to fix fast)  
**Branch:** `feature/you-fellow/auth-token-fix`  
**Setup:** 
- BRANCH_STATUS.md with sharing mode: shared
- WORKING_SESSION.md to track who's active
- Sit together, divide work, handoff as needed

---

### Example 3: Database Migration with Coverage
**Task:** "Migrate auth schema; needs 24/7 monitoring"  
**You:** Day shift (14:00-20:00 UTC)  
**Fellow:** Night shift (20:00-02:00 UTC)  
**Decision:** SHARED (sequential, scheduled handoffs)  
**Branch:** `feature/you-fellow/db-migration`  
**Setup:**
```markdown
## WORKING_SESSION.md

### Session 1: 2026-04-07 14:00 (You)
- Duration: 14:00-20:00 UTC (6 hours)
- Task: Schema creation, indexes, initial data load
- End notes: [describe what was done, what's next]

### Session 2: 2026-04-07 20:00 (Fellow)
- Duration: 20:00-02:00 UTC (6 hours)
- Task: Run migration scripts, verify data integrity
- End notes: [describe progress]

### Session 3: 2026-04-08 14:00 (You)
- Duration: 14:00-20:00 UTC (6 hours)
- Task: Final testing, rollback validation, prepare for production merge
```

---

### Example 4: Standard Feature Work (Solo)
**Task:** "Build dashboard with charts and analytics"  
**You:** Building alone  
**Fellow:** Or available but working on different features  
**Decision:** LOCKED (exclusive, no coordination overhead)  
**Branch:** `feature/you/dashboard-analytics`  
**Setup:** Just BRANCH_STATUS.md (simple)  
**Coordination:** Fellow can review PR; give feedback in PR comments

---

### Example 5: Related Work with Handoff
**Task 1:** "Fellow builds database schema for new users table"  
**Task 2 (yours, depends on Task 1):** "Build user management UI"  
**Decision:** 
- Fellow: `feature/fellow/user-schema` (LOCKED)
- You: `feature/you/user-ui` (branched off Fellow's, or off development when it merges)
**Setup:**
- Read Fellow's BRANCH_STATUS.md for progress
- Wait for Fellow's PR to merge
- Then branch your own feature off updated development
- No need for SHARED mode; just sequential dependence

---

## Most Common Patterns for 2 People

### Pattern 1: Independent Features (70% of the time)
```
You:             feature/you/feature-A
Fellow:          feature/fellow/feature-B

Status:          Both LOCKED
Coordination:    Minimal (BRANCHES_STATUS.md)
Merge:           Independent, no ordering
```

### Pattern 2: Pair Emergency Fix (5% of the time)
```
You + Fellow:    feature/you-fellow/critical-fix

Status:          SHARED
Coordination:    WORKING_SESSION.md
Merge:           Together when done
```

### Pattern 3: Shift Work on Same Feature (10% of the time)
```
Day (You):       feature/you-fellow/migration-day
Night (Fellow):  feature/you-fellow/migration-night

Status:          SHARED with schedule
Coordination:    WORKING_SESSION.md handoff log
Merge:           Together when both shifts done
```

### Pattern 4: Sequential Dependency (15% of the time)
```
Step 1 (Fellow):  feature/fellow/schema-update
Step 2 (You):     feature/you/api-layer (starts after Step 1 merges)

Status:           Both LOCKED (sequential, no overlap)
Coordination:     Fellow's BRANCH_STATUS.md + timeline
Merge:            Fellow first, then You
```

---

## Anti-Patterns to Avoid

❌ **DON'T:** Create SHARED branch if you're both coding simultaneously without WORKING_SESSION.md
→ **Risk:** Merge conflicts from parallel edits

❌ **DON'T:** Forget to handoff WORKING_SESSION.md when switching in shared mode
→ **Risk:** Next PC doesn't know what was done

❌ **DON'T:** Use LOCKED for a feature that needs real-time coordination
→ **Risk:** Slow feedback loops, miscommunication

❌ **DON'T:** Leave WORKING_SESSION.md stale (not updated for hours)
→ **Risk:** Other PC doesn't know status

✅ **DO:** Pick the simpler mode (LOCKED) unless you have a specific reason for SHARED
✅ **DO:** Update WORKING_SESSION.md before every handoff
✅ **DO:** Read BRANCH_STATUS.md + WORKING_SESSION.md before touching a branch
✅ **DO:** Use External Comments to coordinate if overlap is detected

---

## Summary Decision: Pick One

**For you and your fellow in most cases:**
1. **Assign independent features** → Use LOCKED for each
2. **If emergency or complex feature** → Use SHARED with WORKING_SESSION.md
3. **If 24/7 coverage needed** → Use SHARED with scheduled handoffs
4. **Default to LOCKED** (simplest, least coordination overhead)

**Locked branches can always be upgraded to SHARED later if needed.**

