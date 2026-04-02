<!-- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/phases/phase-02-access-control-reliability-recovery-firestore-storage.md -->

# Phase 02 - Access Control Reliability Recovery (Firestore + Storage)

## Status
- COMPLETED

## Objective
Resolve permission-denied failures for teacher subject creation/deletion and institution icon upload using least-privilege rule updates.

## Scope
1. Firestore rule path checks for subject creation flow (`subjectInviteCodes`, transaction reads/writes).
2. Firestore delete-path reliability for teacher and institution admin according to policy toggles.
3. Storage write-path authorization for institution branding icon upload.
4. Surface non-silent error feedback paths where failures are policy-based.

## Files Expected
- `firestore.rules`
- `storage.rules`
- `src/hooks/useSubjects.ts`
- `src/pages/Home/hooks/useHomeHandlers.ts`
- `src/pages/InstitutionAdminDashboard/hooks/useCustomization.ts`
- Impacted tests in `tests/rules/**` and `tests/unit/**`

## Risks
- Over-permission in rules while resolving 403 failures.
- Regression in existing deny-path behavior.

## Validation Gate
- `get_errors` clean for touched files.
- Targeted rules tests pass.
- Targeted hook/unit tests pass.
- Deny-path tests remain valid.

## Rollback
- Keep rule changes in isolated atomic blocks with before/after traceability.

## Completion Notes
- Starter implementation completed:
	- `firestore.rules` invite-code paths updated with `existsAfter/getAfter` for transaction-safe create,
	- missing-doc invite-code `get` preflight now allowed only for non-student same-institution keys,
	- callable backend `syncCurrentUserClaims` added in `functions/index.js`,
	- `useCustomization` now syncs and refreshes claims before branding uploads with one unauthorized retry,
	- `useHomeHandlers` subject delete guard now permits same-institution institution-admin deletes and surfaces explicit deny feedback instead of silent close.
- Added tests:
	- rules: invite-code preflight and same-batch subject+invite reservation,
	- unit: institution-admin subject delete allow/deny cases and non-owner explicit feedback behavior.
- Validation snapshot:
	- `get_errors` clean for touched files,
	- `npm run test -- tests/unit/hooks/useHomeHandlers.shortcuts.test.js` passed,
	- emulator-backed rules tests now pass after emulator config activation:
		- `npm run test:rules` (Firestore + Storage rules suites, 58 tests),
		- Firebase emulators start/stop cleanly via `firebase emulators:exec --only firestore,storage`.
	- `npm run lint` passed with pre-existing warnings outside scope,
	- `npx tsc --noEmit` passed.

