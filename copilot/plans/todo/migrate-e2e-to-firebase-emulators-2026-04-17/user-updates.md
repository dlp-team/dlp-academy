# User Updates

## 2026-04-17 — Plan Created
- 7-phase plan to migrate all 75 E2E tests from live Firestore to Firebase Emulators
- Emulator config already exists in `firebase.json` (ports: Auth 9099, Firestore 8080, Storage 9199)
- Plan preserves backward compatibility: live mode stays available as fallback
- Biggest effort: Phase 3 (Firestore data seeding) and Phase 5 (test validation)
