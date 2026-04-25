# LIA Instance — lia-2026-04-26

> **Status:** 🔄 IN PROGRESS  
> **LIA ID:** `lia-2026-04-26`  
> **Date:** 2026-04-26  
> **Executor:** *(fill in)*  
> **LIA Version:** v1 (full from-scratch run — no prior emulator snapshot available)  
> **Protocol Version:** ILHP v1.0.0

---

## Context

This is the second LIA run for DLP Academy. It uses the updated MASTER_CHECKLIST (184 steps) including Phase 2B (institution admin deep feature audit), expanded Phase 5 (subject deep testing), and expanded Phase 6 (class management deep testing).

The prior LIA run (`lia-2026-04-21`) completed Phases 0–4 but emulator data was lost before Phase 5 due to no pause checkpoint export. That run confirmed the provisioning and onboarding workflows are solid. This run starts fresh and aims to push through Phases 5–10 while re-verifying Phases 1–4.

---

## Objectives for This Run

1. Re-verify provisioning and onboarding (Phases 1–4) — quick pass, expected all ✅
2. **NEW:** Full Phase 2B — institution admin deep feature audit
3. **NEW:** Full Phase 5 deep testing — subject settings, invite codes, visibility
4. **NEW:** Full Phase 6 deep testing — class rename, roster, multi-subject, deletion
5. Content management and quiz workflow (Phase 7)
6. Permission boundary validation (Phase 8)
7. UX gap analysis (Phase 10)
8. **Export emulator snapshot at Phase 9.7** for future LIA v2 use

---

## ⏸️ PAUSE CHECKPOINT — CRITICAL

> **Before stopping this LIA at ANY point, run:**
> ```bash
> firebase emulators:export emulator-data/lia-sessions/lia-2026-04-26-pause
> ```
> **To resume:**
> ```bash
> firebase emulators:start --import=emulator-data/lia-sessions/lia-2026-04-26-pause
> ```
> ⚠️ Forgetting to export means starting over from Phase 1.

---

## Files in This Instance

| File | Purpose |
|------|---------|
| [step-checklist.md](step-checklist.md) | Working checklist — mark steps as you go |
| [findings.md](findings.md) | All findings and final assessment |
| [environment-snapshot.md](environment-snapshot.md) | Environment state at start |
| [logs/security-findings.md](logs/security-findings.md) | Security findings this run |
| [logs/working-parts.md](logs/working-parts.md) | Confirmed working features this run |
| [logs/failures.md](logs/failures.md) | Failures discovered this run |

---

## Quick Reference — Test Institution Spec

| Field | Value |
|-------|-------|
| Institution Name | Academia DLP Test |
| Institution Admin | `lia-admin@prueba.dlp-test.internal` |
| Teacher A | `lia-teacher-a@prueba.dlp-test.internal` |
| Teacher B | `lia-teacher-b@prueba.dlp-test.internal` |
| Students 1–5 | `lia-student-[1-5]@prueba.dlp-test.internal` |
| Subject A | Matemáticas Test (Teacher A) |
| Subject B | Ciencias Test (Teacher B) |
| Subject C | Historia Test (Institution Admin) |
| Class A | Clase A Test (Students 1, 2, 5) |
| Class B | Clase B Test (Students 3, 4, 5) |
| Access Code | `LIA-TEST-2026` |
