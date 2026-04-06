# Temporal Explanation Cleanup Protocol

**Date Established:** April 6, 2026  
**Applies To:** `copilot/explanations/temporal/`

---

## PURPOSE

Prevent temporal explanation folder bloat and maintain workspace hygiene while respecting the 48-hour retention rule for task documentation and context continuity.

---

## RETENTION POLICY

All temporal files must be retained for **minimum 48 hours** from creation:

- **Rationale:** Provides context continuity across related sessions and multi-agent handoffs
- **Exception:** Never clean files < 48 hours old without explicit user permission
- **Archive Location:** `copilot/explanations/temporal/archived/`

---

## CLEANUP TRIGGERS

Proactively suggest cleanup (via `vscode/askQuestions`) when ANY of these conditions are met:

### Trigger 1: Time-Based
- **Condition:** Any temporal file older than 48 hours + new unrelated session starts
- **Action:** Suggest cleanup for files beyond retention window

### Trigger 2: Space-Based
- **Condition:** `copilot/explanations/temporal/` folder exceeds:
  - 50 files, OR
  - 5 MB total size
- **Action:** Suggest cleanup for oldest files

### Trigger 3: Topic-Based
- **Condition:** Starting work on completely new feature with no overlap to existing temporal files
- **Action:** Suggest cleanup for stale topic files from previous work

### Trigger 4: Session-Based
- **Condition:** New session begins and > 72 hours elapsed since last session
- **Action:** Suggest cleanup for all temporal files from prior session (with user confirmation)

---

## CLEANUP SUGGESTION FORMAT

Use `vscode/askQuestions` to present cleanup proposal:

```
Subject: Temporal File Cleanup Suggested

Temporal files found from {{X days}} ago on {{topic}}.

Candidates for archival:
• copilot/explanations/temporal/{{file1}}.md 
  (Size: {{X KB}}, Age: {{X days}}, Topic: {{topic}})
• copilot/explanations/temporal/{{file2}}.md 
  (Size: {{X KB}}, Age: {{X days}}, Topic: {{topic}})

Total recovery: {{X MB}} freed

Proceed with cleanup?
- [ ] Yes, archive selected files
- [ ] No, keep everything
- [ ] Archive different files (ask me)
```

---

## CLEANUP EXECUTION

Once user confirms via `vscode/askQuestions`:

### Step 1: Archive Files
```bash
# Create archive subfolder with date
mkdir -p copilot/explanations/temporal/archived/2026-04-06

# Move confirmed files
mv copilot/explanations/temporal/file1.md copilot/explanations/temporal/archived/2026-04-06/
mv copilot/explanations/temporal/file2.md copilot/explanations/temporal/archived/2026-04-06/
```

### Step 2: Create Cleanup Log

File: `copilot/explanations/temporal/cleanup-log-{{YYYY-MM-DD}}.md`

```markdown
# Cleanup Log – {{DATE}}

**Executed:** {{DATE}} {{TIME}}  
**Triggered By:** {{trigger_type}} (time | space | topic | session)  
**Archived Count:** {{N}} files  
**Space Freed:** {{X.X MB}}  

## Archived Files

| File | Size | Age (days) | Topic | Archive Path |
|---|---|---|---|---|
| {{file1}} | {{X KB}} | {{N}} | {{topic}} | temporal/archived/2026-04-06/ |
| {{file2}} | {{X KB}} | {{N}} | {{topic}} | temporal/archived/2026-04-06/ |

## Retention Check

- [x] All archived files >= 48 hours old
- [x] User confirmed cleanup
- [x] Backup archive location verified
- [x] New session context verified

## Notes

{{Any notes about why cleanup was needed, impact, or future actions}}
```

### Step 3: Commit Cleanup

```bash
git add copilot/explanations/temporal/
git commit -m "chore(docs): archive temporal explanations $(date +%Y-%m-%d)"
git push origin <branch>
```

---

## RECOVERY PROTOCOL

If archived file is needed:

1. Check `copilot/explanations/temporal/archived/` subfolder with matching date
2. Restore to main temporal folder: `mv archived/YYYY-MM-DD/file.md ./`
3. Document recovery: "Restored {{file}} from archive dated {{date}} — still relevant"
4. Commit: `git add/commit/push`

---

## AUTOMATION RECOMMENDATIONS

Future enhancement: Consider automated cleanup trigger

```yaml
# Pseudo-automation rules (not yet implemented)
autopilot:
  temporal_cleanup:
    enabled: true
    triggers:
      - age_hours: 72
        conditions:
          - folder_size_mb: 5
          - file_count: 50
        action: suggest_cleanup_via_askQuestions
    retention_minimum_hours: 48
```

---

## EXCEPTIONS & EDGE CASES

**Should NOT cleanup:**
- Files actively referenced in active plans
- Files matching current session topic
- Files < 48 hours old
- Files marked with `[KEEP]` prefix in name

**Example:** `copilot/explanations/temporal/[KEEP]-archive-reference-2026-04.md`

---

## RELATED DOCUMENTS

- [lossless-change-protocol.md](./lossless-change-protocol.md#temporal-cleanup-policy) – 48-hour retention rule
- [copilot/explanations/README.md](../explanations/README.md) – Temporal folder guidelines
- [code-explanation.md](./code-explanation.md#temporal-retention-rule) – When to create temporal files
