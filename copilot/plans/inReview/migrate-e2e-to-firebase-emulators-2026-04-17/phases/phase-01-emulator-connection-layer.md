# Phase 1: Emulator Connection Layer

## Objective
Add conditional emulator connection to `src/firebase/config.ts` so the app connects to local emulators when `VITE_USE_EMULATORS=true`.

## Tasks

1. **Update `src/firebase/config.ts`**:
   ```typescript
   import { connectFirestoreEmulator } from 'firebase/firestore';
   import { connectAuthEmulator } from 'firebase/auth';
   import { connectStorageEmulator } from 'firebase/storage';
   import { connectFunctionsEmulator } from 'firebase/functions';

   // After initializing services:
   if (import.meta.env.VITE_USE_EMULATORS === 'true') {
     connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
     connectFirestoreEmulator(db, 'localhost', 8080);
     connectStorageEmulator(storage, 'localhost', 9199);
     connectFunctionsEmulator(functions, 'localhost', 5001);
     console.log('[Firebase] Connected to emulators');
   }
   ```

2. **Add env variable to `.env.example`** (not `.env`):
   ```
   VITE_USE_EMULATORS=false
   ```

3. **Verify**: App still works normally when `VITE_USE_EMULATORS` is unset/false

## Validation Gate
- [ ] App loads normally without emulator flag
- [ ] App connects to emulators when flag is `true` and emulators are running
- [ ] No TypeScript errors (`get_errors` clean)
- [ ] Existing tests unaffected (still pass against live Firestore)

## Estimated Effort: Small
