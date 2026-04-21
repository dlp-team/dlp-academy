# LIA Environment Snapshot — YYYY-MM-DD

> Fill this out at the START of the LIA run, before making any changes or running any tests.  
> This snapshot is the reference for any "before state" comparisons during this run.

---

## Run Metadata

| Field | Value |
|-------|-------|
| LIA ID | `lia-YYYY-MM-DD` |
| Date | YYYY-MM-DD |
| Executor | [EXECUTOR] |
| Start Time | HH:MM (timezone) |
| End Time | HH:MM (timezone) |
| Overall Result | ⬜ In Progress / ✅ PASS / ❌ FAIL / ⚠️ PARTIAL |

---

## Environment

| Field | Value |
|-------|-------|
| Node Version | *(run `node --version`)* |
| npm Version | *(run `npm --version`)* |
| Git Branch | *(run `git branch --show-current`)* |
| Git Commit SHA | *(run `git rev-parse HEAD`)* |
| Firebase Project | *(emulator or production project ID)* |
| Execution Mode | ⬜ Emulator / ⬜ Staging / ⬜ Production |

---

## Pre-Run Checks

| Check | Status |
|-------|--------|
| `npm run build` exits 0 | ⬜ |
| `npx tsc --noEmit` exits 0 | ⬜ |
| `npm run lint` exits 0 | ⬜ |
| `npm run test` all green | ⬜ |

---

## Test Institution Spec Reference

Using the standardized institution specification in `TEST_INSTITUTION_SPEC.md`.

**Test Institution Data:**
- Institution Name: Academia DLP Test
- Institution ID: `dlp-test-YYYY-MM-DD` *(fill in actual generated ID)*
- Institutional Access Code: *(fill in generated code)*
- Institution Admin Email: `admin.lia.YYYYMMDD@dlptest.dev`

---

## Notes

*(Any pre-existing issues, known skipped checks, or context that affects this run's validity)*
