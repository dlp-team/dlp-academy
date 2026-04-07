<!-- copilot/ACTIVE-GOVERNANCE/BRANCH_RETENTION_POLICY.md -->
# Branch Retention Policy

**Purpose:** Define retention period for branches marked as `pending-delete` before automatic deletion.

**Effective Date:** 2026-04-07  
**Last Updated:** 2026-04-07

---

## Retention Period Configuration

**Default Retention Days:** `7` (days after marking as pending-delete)

This period allows:
- Grace window for rollback if issues discovered post-merge
- Time to audit the merged changes
- Buffer for accidental deletions

---

## Policy Rules

### When a Branch is Marked `pending-delete`

1. **Status Transition:** After successful merge into development and validation:
   - Update BRANCHES_STATUS.md: `Status` → `pending-delete`
   - Add `pending-delete-date`: Today's date (YYYY-MM-DD format)
   - Document reason in Notes column

2. **Grace Period:** The branch is retained for **7 consecutive days** from the pending-delete-date

3. **Automatic Cleanup:** When the retention period expires:
   - Copilot detects expired branches during Step 22.5 (Cleanup Phase)
   - Deletes the branch both locally and remotely (`git push origin --delete <branch>`)
   - Removes the row from BRANCHES_STATUS.md
   - Logs deletion to audit trail

### When a Branch May Be Retained Beyond Retention Period

If a branch should NOT be deleted (e.g., for audit/rollback reasons):
1. Change Status from `pending-delete` to `retained`
2. Add explanation in Notes (e.g., "Retained for security audit until 2026-04-30")
3. Update regularly to prevent automatic deletion
4. Archive to `copilot/plans/archived/` if no longer active

---

## Retention Period Override

**Special Cases:**
- **Security-sensitive branches:** Retention period may be extended to 30 days or longer
- **Production hotfix branches:** May be retained indefinitely with explicit documentation
- **Audit/compliance branches:** Mark as `retained` (never auto-delete)

To override:
1. Change Status to `retained` (not `pending-delete`)
2. Document override reason and expected retention end-date in Notes
3. Update retention end-date quarterly

---

## Implementation Details

### Configuration Values

```
BRANCH_RETENTION_DAYS=7
AUTO_DELETE_ENABLED=true
AUTO_DELETE_CHECK_SCHEDULE=daily (on each autopilot start)
```

### Detection Logic (in AUTOPILOT_EXECUTION_CHECKLIST.md Step 22.5)

```
For each row in BRANCHES_STATUS.md:
  IF Status == "pending-delete" AND pending-delete-date exists:
    days_elapsed = current_date - pending-delete-date
    IF days_elapsed >= BRANCH_RETENTION_DAYS:
      [Delete branch from GitHub]
      [Delete local if exists]
      [Remove row from BRANCHES_STATUS.md]
      [Log deletion event]
```

### Audit Trail

All deletions are logged to: `copilot/ACTIVE-GOVERNANCE/branch-deletion-audit.log`

Format:
```
[2026-04-14T10:30:00Z] DELETED: feature/pc1/some-feature (pending since 2026-04-07, 7 days elapsed)
[2026-04-14T10:30:00Z] REASON: Auto-cleanup (retention period expired)
```

---

## Manual Branch Deletion

If immediate deletion is needed (e.g., sensitive data accidentally committed):
1. **STOP:** Do NOT use auto-cleanup
2. **Escalate:** Contact repository admin
3. **Manual Process:** Force-delete both remote and local after verification
4. **Purge History:** If data sensitivity requires, consider git gc/prune

---

## Related Files

- Policy enforcement: `copilot/ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md` (Step 22.5)
- Branch registry: `copilot/ACTIVE-GOVERNANCE/BRANCHES_STATUS.md`
- Deletion audit: `copilot/ACTIVE-GOVERNANCE/branch-deletion-audit.log`

---

## Version History

| Date | Author | Change |
|------|--------|--------|
| 2026-04-07 | copilot | Initial policy: 7-day retention, auto-delete enabled |
