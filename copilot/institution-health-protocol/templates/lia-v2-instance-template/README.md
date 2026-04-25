# LIA v2 Instance Template — README

> **This is a TEMPLATE for LIA Version 2.** Copy this entire folder to `active/lia-v2-YYYY-MM-DD/` to start a new v2 run.  
> **DO NOT execute a LIA from this templates folder.**

---

## What Is LIA v2?

**LIA v2 (Lifecycle Integrity Audit — Version 2)** is designed to pick up where LIA v1 left off.

While **LIA v1** provisions everything from scratch (creates institution, users, subjects, classes), **LIA v2** starts from an existing emulator data snapshot exported from a completed LIA v1 run. This means:

- No time wasted re-provisioning users and data
- Deeper focus on workflows, edge cases, and advanced feature testing
- Can run on action-specific areas (customization, content management, permissions) without repeating the full setup cycle
- Enables regression testing against a known good baseline

---

## Pre-Conditions

Before running LIA v2, you need:

1. **A completed LIA v1 run** with a saved emulator snapshot at:  
   `emulator-data/lia-snapshots/lia-YYYY-MM-DD/`  
   (Snapshot is created in LIA v1 Phase 9, Step 9.7 — before cleanup)

2. **Firebase Emulator running** with snapshot imported:  
   `firebase emulators:start --import=emulator-data/lia-snapshots/lia-YYYY-MM-DD`

3. **DLP web app running** at `http://localhost:5173`

4. **Both pages open in VSCode** (or external browser):
   - `http://localhost:5173` — DLP web app
   - `http://127.0.0.1:4000` — Firebase Emulator UI

---

## What LIA v2 Tests

LIA v2 phases focus on:
- **Phase 0:** Pre-flight + snapshot import verification
- **Phase 1:** Snapshot integrity (all users, institution, subjects present)
- **Phase 2:** Institution admin deep feature testing (all dashboard options)
- **Phase 3:** Teacher advanced workflow (subject management, content operations)
- **Phase 4:** Student advanced workflow (quiz experience, progress, enrollment edge cases)
- **Phase 5:** Content management deep testing (topic reordering, document handling, quiz editing)
- **Phase 6:** Permission edge cases and adversarial testing
- **Phase 7:** UX gap analysis from all four perspectives
- **Phase 8:** Regression comparison vs LIA v1 baseline

---

## Live Run Log

**LIA v2 introduces mandatory live logging.** While executing, the executor MUST append an entry to `logs/live-run-log.md` for:
- Every completed step (pass or fail)
- Every significant action taken
- Any observation worth noting mid-phase

Log format:
```
[YYYY-MM-DD HH:MM] PHASE X — Step X.Y | STATUS | Action: <what was done> | Result: <what happened>
```

This creates a real-time audit trail of the execution.

---

## Folder Structure

```
active/lia-v2-YYYY-MM-DD/
├── README.md                ← This file (customized with dates/executor)
├── step-checklist.md        ← Working checklist for this v2 run
├── findings.md              ← All findings, observations, decisions
├── environment-snapshot.md  ← Environment state + snapshot reference
└── logs/
    ├── live-run-log.md      ← Real-time execution log (NEW in v2)
    ├── security-findings.md ← Security issues found in this run
    ├── working-parts.md     ← Features confirmed working
    └── failures.md          ← Failures discovered
```

---

## How to Instantiate

1. Copy this folder: `templates/lia-v2-instance-template/` → `active/lia-v2-YYYY-MM-DD/`
2. Replace all `YYYY-MM-DD` occurrences with the actual date
3. Replace `[EXECUTOR]` with the name or ID of the person running the LIA
4. Fill in `environment-snapshot.md` — especially which LIA v1 snapshot is being used
5. Open the emulator with the snapshot loaded
6. Open both pages in VSCode/browser
7. Start `logs/live-run-log.md` with the LIA STARTED entry
8. Begin Phase 0 of `step-checklist.md`

---

## Template Version

v2-template-1.0.0 | Created: 2026-04-23
