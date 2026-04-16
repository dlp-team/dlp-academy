# Phase 4: Playwright Config & Test Runner Integration

## Objective
Configure Playwright to automatically start Firebase emulators before the test suite and stop them after.

## Tasks

1. **Update `playwright.config.js`**:
   - Add emulator startup as a second `webServer` entry (Playwright supports arrays):
   ```javascript
   webServer: [
     {
       command: 'firebase emulators:start --only auth,firestore,storage,functions',
       url: 'http://localhost:4000', // Emulator UI
       reuseExistingServer: !process.env.CI,
       timeout: 30000,
     },
     {
       command: 'npm run dev',
       url: 'http://localhost:5173',
       reuseExistingServer: !process.env.CI,
       env: { VITE_USE_EMULATORS: 'true' },
     }
   ]
   ```

2. **Add npm scripts to `package.json`**:
   ```json
   "test:e2e:emulator": "cross-env VITE_USE_EMULATORS=true npx playwright test --workers=1",
   "test:e2e:live": "npx playwright test --workers=1"
   ```

3. **Update `.env` for test mode**:
   - Add `VITE_USE_EMULATORS=true` for E2E testing
   - Set `FIRESTORE_EMULATOR_HOST=localhost:8080` for Admin SDK
   - Set `FIREBASE_AUTH_EMULATOR_HOST=localhost:9099` for Admin SDK

4. **Ensure Vite dev server picks up emulator flag**:
   - Vite must be started with `VITE_USE_EMULATORS=true` in its environment
   - The app's `config.ts` then connects to emulators automatically

## Validation Gate
- [ ] `npm run test:e2e:emulator` starts emulators + dev server + runs tests
- [ ] `npm run test:e2e:live` still works against live Firebase (backward compatible)
- [ ] Emulators shut down cleanly after tests complete
- [ ] No port conflicts

## Estimated Effort: Small
