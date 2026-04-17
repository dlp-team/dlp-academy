# Migrate E2E Tests to Firebase Emulators

## Status: IN REVIEW
## Created: 2026-04-17
## Completed: 2026-04-18
## Branch: feature/hector/e2e-firebase-emulators-2026-04-17

## Problem Statement

Current Playwright E2E tests (68/75 passing) run against **live Firestore/Auth**, causing:
- Flaky failures from network latency and rate limits
- Test data pollution in staging/production database
- Dependency on credentials in CI/CD pipelines
- Shared state conflicts between parallel/concurrent test runs
- Security risk from service account keys in environment

## Goal

Migrate all 75 E2E tests to use Firebase Emulators (Auth + Firestore + Storage) for:
- Complete test isolation (no live data touched)
- Faster execution (local emulator vs network)
- CI/CD friendly (no credentials needed)
- Deterministic results (no shared state)

## Scope

### In Scope
- Configure app to connect to emulators when `VITE_USE_EMULATORS=true`
- Update `src/firebase/config.ts` with emulator connection logic
- Create emulator seed data scripts for all E2E test personas
- Update `playwright.config.js` to start emulators before tests
- Update `global-setup.ts` to seed emulator Auth users
- Update all test helpers to work with emulator
- Validate all 68 passing tests still pass against emulators
- CI/CD pipeline configuration for emulator-based testing

### Out of Scope
- Changing test logic/assertions (tests stay identical)
- Migrating unit tests (only E2E)
- Firestore rules testing (separate concern)

## Key Files

- [src/firebase/config.ts](src/firebase/config.ts) - Firebase initialization (needs emulator connection)
- [firebase.json](firebase.json) - Emulator ports already configured (Auth:9099, Firestore:8080, Storage:9199)
- [playwright.config.js](playwright.config.js) - Test runner config
- [tests/e2e/global-setup.ts](tests/e2e/global-setup.ts) - Global setup (creates Admin SDK users)
- [tests/e2e/helpers/e2e-auth-helpers.ts](tests/e2e/helpers/e2e-auth-helpers.ts) - Login helpers

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Emulator behavior differs from production | Medium | Run subset against live as smoke test |
| Auth emulator lacks some features | Low | Most tests use email/password only |
| Seed data complexity | Medium | Reuse existing Admin SDK patterns |
| Emulator startup time adds to CI | Low | Emulators start in ~5s |

## Dependencies

- Firebase CLI installed (`firebase` command available)
- Java Runtime (required for Firestore emulator)
- No external service dependencies once migrated
