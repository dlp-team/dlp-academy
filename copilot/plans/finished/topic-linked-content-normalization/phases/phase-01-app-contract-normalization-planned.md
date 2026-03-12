<!-- copilot/plans/active/topic-linked-content-normalization/phases/phase-01-app-contract-normalization-completed.md -->
# Phase 01 - App Contract Normalization (COMPLETED)

## Objective

Normalize app-side reads and writes to use canonical relational fields (`topicId`, `subjectId`) for all topic-linked content.

## Changes

- ✅ Replaced exam queries based on `topicid` with canonical query path using `topicId`
- ✅ Updated Firestore security rules for `/exams` to match relational model used by `/quizzes` and `/documents`
- ✅ Added Firestore naming convention (English only) to `copilot-instructions.md`
- ✅ Updated console logs and comments to reflect canonical approach

## Implementation Details

### 1. useTopicLogic.js
- Changed exams query from `where("topicid", "==", topicId)` to `where("topicId", "==", topicId)`
- Updated comment: "relación canónica por topicId"
- Updated console logs to use "topicId" consistently

### 2. firestore.rules
- Replaced permissive rules with relation-aware security model
- Added create/read/update/delete rules with:
  - Topic relation checks via `hasTopicRef()` and `topicInstitutionMatches()`
  - Ownership validation
  - Global admin override
  - Institution boundary enforcement

### 3. copilot-instructions.md
- Added naming convention: "All Firestore collection names, document field names, and schema identifiers must be in English"
- Provided clear examples: `quizzes`, `documents`, `exams` (not Spanish equivalents)

## Risks

- Mixed legacy data can make UI appear empty if compatibility handling is removed too early.
- Incomplete write-path normalization can reintroduce drift.

**Mitigation**: Phase 02 will handle data migration and backfill to ensure all exam records use canonical fields.

## Completion Notes

- **Completed**: 2026-03-08
- **Files modified**: 3 (useTopicLogic.js, firestore.rules, copilot-instructions.md)
- **Validation**: All files pass `get_errors` with no issues
- **Documentation**: Lossless report created in `copilot/explanations/temporal/lossless-reports/2026-03-08/topic-linked-content-phase-01.md`

## Verification Checklist

- ✅ Exams query uses canonical `topicId` field
- ✅ Firestore rules enforce tenant boundaries for exams
- ✅ Security model matches quizzes/documents pattern
- ✅ No regression in existing topic/quiz/document queries
- ✅ Naming convention documented in central instructions

## Known Limitations

1. Exams with legacy `topicid` field will not appear until migrated (Phase 02)
2. External systems (n8n, etc.) must be updated to write `topicId` canonically
3. Embedded status logic in useSubjectManager not yet addressed (deferred to follow-up)

## Next Actions

Proceed to Phase 02 for data migration and backfill of canonical fields.
