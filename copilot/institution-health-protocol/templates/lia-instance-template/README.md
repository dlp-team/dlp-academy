# LIA Instance Template — README

> **This is a template.** Copy this entire folder to `active/lia-YYYY-MM-DD/` to start a new LIA run.  
> **DO NOT execute a LIA from this templates folder.**

---

## Folder Structure

When instantiated, the folder looks like this:

```
active/lia-YYYY-MM-DD/
├── README.md              ← This file (customized with dates/executor)
├── step-checklist.md      ← Copy of MASTER_CHECKLIST.md (fill in as you go)
├── findings.md            ← All findings, observations, decisions
├── environment-snapshot.md ← Exact environment state at start of run
└── logs/
    ├── security-findings.md  ← Security issues found in this specific run
    ├── working-parts.md      ← Features confirmed working in this run
    └── failures.md           ← Failures discovered in this run
```

---

## How to Instantiate

1. Copy this folder: `templates/lia-instance-template/` → `active/lia-YYYY-MM-DD/`
2. Replace all `YYYY-MM-DD` occurrences with the actual date
3. Replace `[EXECUTOR]` with the name or ID of the person running the LIA
4. Delete this instructions block from the README
5. Begin with Phase 0 of `step-checklist.md`

---

## Version

Template version: 1.0.0 | Created: 2026-04-21
