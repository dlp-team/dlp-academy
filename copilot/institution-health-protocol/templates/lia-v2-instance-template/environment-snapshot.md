# Environment Snapshot — LIA v2 YYYY-MM-DD

> **Complete this file BEFORE starting Phase 0.**

---

## LIA Instance Info

| Field | Value |
|-------|-------|
| LIA ID | `lia-v2-YYYY-MM-DD` |
| LIA Version | v2 |
| Date | YYYY-MM-DD |
| Executor | [EXECUTOR] |

---

## Source Snapshot Reference

| Field | Value |
|-------|-------|
| Source LIA v1 ID | `lia-YYYY-MM-DD` *(fill in)* |
| Snapshot Path | `emulator-data/lia-snapshots/lia-YYYY-MM-DD/` *(fill in)* |
| Emulator Start Command | `firebase emulators:start --import=emulator-data/lia-snapshots/lia-YYYY-MM-DD` |
| Snapshot Created Date | YYYY-MM-DD *(fill in)* |

---

## Git State

| Field | Value |
|-------|-------|
| Branch | *(run `git branch --show-current`)* |
| Commit Hash | *(run `git rev-parse --short HEAD`)* |
| Last Commit Message | *(run `git log -1 --pretty=%s`)* |
| Dirty (uncommitted changes?) | Yes / No |

---

## Build State

| Field | Value |
|-------|-------|
| `npm run build` | ✅ / ❌ |
| `npx tsc --noEmit` | ✅ / ❌ |
| `npm run lint` | ✅ / ❌ |
| `npm run test` | ✅ / ❌ |

---

## Firebase Target

| Field | Value |
|-------|-------|
| Using emulators? | Yes / No |
| `VITE_USE_EMULATORS` | true / false |
| Firebase project | *(run `firebase use`)* |
| Emulator UI | http://127.0.0.1:4000 |
| Auth emulator | http://localhost:9099 |
| Firestore emulator | http://localhost:8080 |
| Storage emulator | http://localhost:9199 |

---

## Browser Setup

| Field | Value |
|-------|-------|
| DLP Web App URL | http://localhost:5173 |
| Open in | VSCode Simple Browser / External Browser *(fill in)* |
| Emulator UI Open In | VSCode Simple Browser / External Browser *(fill in)* |

---

## Test Institution Data (from Snapshot)

| Field | Value |
|-------|-------|
| Institution Name | *(from source LIA README)* |
| Institution ID | *(from source LIA)* |
| Institution Admin Email | *(from source LIA)* |
| Teacher 1 Email | *(from source LIA)* |
| Teacher 2 Email | *(from source LIA)* |
| Student 1–5 Emails | *(from source LIA)* |

---

## Notes

*(Any relevant observations about the environment before starting)*
