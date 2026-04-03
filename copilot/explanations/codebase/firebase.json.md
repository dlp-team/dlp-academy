<!-- copilot/explanations/codebase/firebase.json.md -->

# firebase.json

## Overview
- **Source file:** `firebase.json`
- **Role:** Firebase project configuration for functions source, Firestore rules/indexes, Storage rules, and local emulator settings.

## Changelog
### 2026-04-03
- Added explicit emulator ports for lifecycle callable validation flows:
  - Auth emulator port `9099`
  - Functions emulator port `5001`
- This enables combined `firebase emulators:exec --only 'firestore,functions,auth' ...` validation for callable dry-run checks.

### 2026-04-02
- Added explicit emulator configuration for local validation flows:
  - Firestore emulator port `8080`
  - Storage emulator port `9199`
  - Emulator UI enabled on port `4000`
  - `singleProjectMode: true`
- This unblocks deterministic `firebase emulators:exec --only firestore,storage` execution used by `npm run test:rules`.

## Validation
- `npm run test:rules` passed after emulator configuration update.
