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
- [ ] CI pipeline runs E2E tests successfully
- [ ] No real Firebase credentials needed in CI
- [ ] Test artifacts (reports, traces) uploaded on failure
- [ ] Pipeline completes in < 15 minutes

## Estimated Effort: Medium
