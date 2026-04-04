<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/reviewing/verification-checklist-2026-04-03.md -->
# Verification Checklist (Seed)

## Plan Integrity
- [x] Plan package exists with required folders and files.
- [x] Roadmap and phase files are synchronized for initial state.
- [x] Primary/secondary source precedence is explicit.
- [x] Source files moved and renamed into plan folder.
- [x] `create-plan` skill updated with dual-source handling rule.

## Implementation Readiness
- [x] Dependency map drafted with real code paths.
- [x] Course lifecycle summary drafted.
- [x] Course lifecycle deep-dive drafted.
- [x] Language strategy audit drafted.
- [x] Target implementation files reviewed line-by-line before Phase 02.

## Closure Gates (To Complete Later)
- [x] `get_errors` clean for touched files in this phase block.
- [x] `npm run lint` clean.
- [x] `npx tsc --noEmit` clean.
- [x] `npm run test` clean.
- [x] Lossless report created and linked.
- [x] Relevant codebase explanation docs updated.
- [ ] Lifecycle transition to `inReview` executed after implementation.

## Current Evidence Snapshot (2026-04-04)
- `npm run lint`: **PASS**.
- `npx tsc --noEmit`: **PASS**.
- `npm run test`: **PASS** (134 files, 606 tests).
- `npm run test:e2e -- tests/e2e/transfer-promotion.spec.js` (non-mock callable path): **PASS** (3 passed).
- Full suite includes latest Phase 08 bin parity regressions and Phase 09 type-safety fixes.

## Current Evidence Snapshot (2026-04-03)
- `npm run test`: **PASS** (113 files, 536 tests).
- `npx tsc --noEmit`: **PASS**.
- `npm run lint`: **PASS with 4 pre-existing warnings** (`Exam.jsx`, `StudyGuide.jsx`), no new lint errors.
- Emulator callable dry-run validation: **PASS**
	- Command: `firebase emulators:exec --only 'firestore,functions,auth' "node scripts/lifecycle-dry-run-emulator-check.mjs"`
	- Result: `scannedSubjects=2`, `updatedSubjects=1`, `skippedSubjects=1`, `committedUpdates=0`, `previewSubjectIds=['dryrun-subject-update']`.
