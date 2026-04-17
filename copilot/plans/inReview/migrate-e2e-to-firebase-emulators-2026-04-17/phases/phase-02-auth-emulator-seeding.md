# Phase 2: Auth Emulator Setup & User Seeding

## Objective
Create all E2E test user accounts in the Auth emulator before tests run.

## Tasks

1. **Create `tests/e2e/emulator-seed.ts`** — Script to seed Auth emulator users:
   - Create all test personas (owner, editor, viewer, admin, institution-admin, teacher, student)
   - Set email+password credentials matching `.env` E2E variables
   - Mark all emails as verified
   - Uses Firebase Admin SDK pointed at Auth emulator (`FIREBASE_AUTH_EMULATOR_HOST=localhost:9099`)

2. **Update `tests/e2e/global-setup.ts`**:
   - Detect emulator mode via `VITE_USE_EMULATORS` or `FIRESTORE_EMULATOR_HOST`
   - If emulator mode: create users via Admin SDK against emulator (no real Firebase needed)
   - If live mode: keep existing email verification logic (backward compatible)

3. **Create emulator user UIDs mapping** so Firestore seed data can reference correct UIDs

## Validation Gate
- [ ] `firebase emulators:start` launches successfully
- [ ] Global setup seeds all 7+ test users in Auth emulator
- [ ] Login helper successfully authenticates against Auth emulator
- [ ] UIDs are deterministic/retrievable for Firestore seeding

## Estimated Effort: Medium
