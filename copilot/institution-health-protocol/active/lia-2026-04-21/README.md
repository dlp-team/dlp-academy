# LIA Instance — lia-2026-04-21

> **Status:** 🔄 READY TO START  
> **LIA ID:** `lia-2026-04-21`  
> **Date:** 2026-04-21  
> **Executor:** *(fill in)*  
> **Protocol Version:** ILHP v1.0.0

---

## Context

This is the **first ever** Lifecycle Integrity Audit for DLP Academy. There is no prior baseline — this run establishes the baseline for all future runs.

The security risks registry and known issues log were pre-populated from architecture analysis before this run. This run will either confirm those risks as real (verify in Phase 8) or mark them as mitigated.

---

## Objectives for This Run

1. Establish the working features baseline (every feature that passes gets a ✅ in the global log)
2. Verify or refute the 17 pre-identified SEC-* security risks
3. Verify or refute the 3 pre-identified ISSUE-* functional issues
4. Document the actual state of the app as of 2026-04-21

---

## Files in This Instance

| File | Purpose |
|------|---------|
| [step-checklist.md](step-checklist.md) | Working checklist — mark steps as you go |
| [findings.md](findings.md) | All findings and final assessment |
| [environment-snapshot.md](environment-snapshot.md) | Environment state at start |
| [logs/security-findings.md](logs/security-findings.md) | Security findings this run |
| [logs/working-parts.md](logs/working-parts.md) | Confirmed working features this run |
| [logs/failures.md](logs/failures.md) | Failures found this run |

---

## Quick Reference — Test Institution Spec

| Field | Value |
|-------|-------|
| Institution Name | Academia de Prueba DLP |
| Institution Admin | `admin.lia.20260421@dlptest.dev` |
| Teacher 1 | `teacher1.lia.20260421@dlptest.dev` |
| Teacher 2 | `teacher2.lia.20260421@dlptest.dev` |
| Students | `student[1-5].lia.20260421@dlptest.dev` |
| Subject A | Matemáticas I (Teacher 1) |
| Subject B | Historia Universal (Teacher 2) |
| Class A | 1ro Secundaria A → Students 1–4 + 5 |
| Class B | 1ro Secundaria B → Student 5 only |

Full spec: [TEST_INSTITUTION_SPEC.md](../../TEST_INSTITUTION_SPEC.md)

---

## Start Instructions

1. **Create a dedicated branch first:** `git checkout -b lia/2026-04-21` from `development`
2. Complete `environment-snapshot.md` first (record the branch there)
3. Follow `step-checklist.md` phase by phase
4. Log every failure immediately in `logs/failures.md`
5. Log every security finding in `logs/security-findings.md`
6. Log working features in `logs/working-parts.md`
7. At Phase 9, sync all logs to global logs
8. Complete `findings.md` summary (include Phase 10 UX/Gap analysis)
9. Move this folder to `finished/` when done
