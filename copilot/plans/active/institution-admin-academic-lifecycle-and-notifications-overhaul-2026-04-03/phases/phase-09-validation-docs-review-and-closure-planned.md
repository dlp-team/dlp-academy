<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-09-validation-docs-review-and-closure-planned.md -->
# Phase 09 - Validation, Docs Sync, Review, and Closure (IN_PROGRESS)

## Objective
Execute full validation gates, synchronize required documentation, and prepare lifecycle transition to `inReview` then `finished`.

## Planned Changes
- Run lint/type/test and targeted runtime checks.
- Create/update temporal lossless reports for implementation phases.
- Update codebase explanation docs for touched implementation files.
- Complete reviewing checklist and review logs.

## Progress Update (2026-04-04)
- Executed full validation gates:
	- `npm run lint` -> **PASS**
	- `npx tsc --noEmit` -> **PASS**
	- `npm run test` -> **PASS** (134 files, 606 tests)
- Resolved type-check blockers discovered during Phase 09 gate execution:
	- added `codeVersion` defaults in [src/utils/institutionPolicyUtils.ts](src/utils/institutionPolicyUtils.ts),
	- added missing env typings (`VITE_N8N_CSV_IMPORT_WEBHOOK`, `VITE_E2E_TRANSFER_PROMOTION_MOCK`) in [src/global.d.ts](src/global.d.ts).
- Synced phase docs/explanations/lossless records for completed Phase 07 and Phase 08 implementation blocks.

## Validation Evidence
- `npm run lint`
- `npx tsc --noEmit`
- `npm run test`
- `get_errors` clean on touched files in this Phase 09 validation slice.

## Remaining in Phase 09
- Execute lifecycle transition gate (`active` -> `inReview`) after final closure decision on remaining optional Phase 05 non-mock execution evidence.

## Exit Criteria
- All quality gates pass.
- Documentation and lifecycle state are synchronized.
- Plan is ready for reviewer closure.
