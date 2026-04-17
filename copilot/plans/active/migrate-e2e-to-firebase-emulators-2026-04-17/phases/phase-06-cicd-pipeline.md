# Phase 6: CI/CD Pipeline Setup

## Objective
Configure GitHub Actions (or equivalent) to run E2E tests against emulators in CI.

## Tasks

1. **Create/update GitHub Actions workflow**:
   - Install Java (required for Firestore emulator)
   - Install Firebase CLI
   - Start emulators in background
   - Start Vite dev server with `VITE_USE_EMULATORS=true`
   - Run Playwright tests
   - Upload test reports as artifacts

2. **Remove CI dependency on `FIREBASE_SERVICE_ACCOUNT_JSON`**:
   - Emulator mode doesn't need real credentials
   - Only `VITE_USE_EMULATORS=true` and emulator host vars needed

3. **Configure caching**:
   - Cache Firebase emulator binaries (~200MB)
   - Cache node_modules
   - Cache Playwright browsers

4. **Add emulator health check** before test execution

## Validation Gate
- [x] CI pipeline runs E2E tests successfully (.github/workflows/e2e-emulator.yml)
- [x] No real Firebase credentials needed in CI (uses emulator-only test personas)
- [x] Test artifacts (reports, traces) uploaded on failure
- [x] Pipeline configured with 15-minute timeout

## Status: COMPLETE (2026-04-18)

### Implementation Details
- **Workflow file**: `.github/workflows/e2e-emulator.yml`
- **Triggers**: push to main/development/feature/**, PRs to main/development
- **Concurrency**: cancels in-progress runs on same ref
- **Java**: temurin 17 (Firestore emulator requirement)
- **Caching**: Firebase emulator binaries, Playwright browsers, node_modules
- **Test personas**: 9 fixed emulator-only emails (@test.local domain)
- **Artifacts**: HTML report (14d retention), failure traces (7d retention)
- **Key env vars**: `VITE_USE_EMULATORS=true`, `E2E_RUN_MUTATIONS=true`, all emulator hosts

## Estimated Effort: Medium
