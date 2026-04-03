<!-- copilot/explanations/codebase/scripts/lifecycle-dry-run-emulator-check.mjs.md -->
# lifecycle-dry-run-emulator-check.mjs

## Changelog
### 2026-04-03
- Added emulator-backed validation script for lifecycle automation dry-run callable.
- Script behavior:
  - seeds admin profile and institution-scoped subject fixtures in Firestore emulator,
  - signs in via Auth emulator using Admin custom token,
  - invokes callable `runSubjectLifecycleAutomation` with `dryRun: true`,
  - asserts deterministic response contract (`success`, `dryRun`, `previewSubjectIds`, update counters),
  - prints payload evidence for review records.

## Overview
- Source file: `scripts/lifecycle-dry-run-emulator-check.mjs`
- Role: deterministic local validation harness for Phase 04 lifecycle automation dry-run flow.

## Validation
- `firebase emulators:exec --only 'firestore,functions,auth' "node scripts/lifecycle-dry-run-emulator-check.mjs"`
