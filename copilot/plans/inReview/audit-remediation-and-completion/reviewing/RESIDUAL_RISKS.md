<!-- copilot/plans/inReview/audit-remediation-and-completion/reviewing/RESIDUAL_RISKS.md -->

# Residual Risks and Follow-Up

## Confirmed Residuals
- Existing lint warnings in:
  - `src/pages/Content/Exam.jsx`
  - `src/pages/Content/StudyGuide.jsx`
- These warnings predate phases 09-11 and are not regressions from current scope.

## Open Audit Review Items (from plan README)
- Phase 03 review log still lists unresolved/partially-covered items:
  - student join-via-invite scenario completeness,
  - institution alignment validation for class assignment,
  - full coverage for all stated access vectors.

## Product/UX Considerations
- Completion history sorting currently relies on `updatedAt` fallback and not a dedicated completion timestamp field.
- If strict completion chronology is required, add `completedAtBySubject` metadata in user profile or equivalent indexed model.

## Recommendation
- Keep plan in `inReview` until team confirms whether remaining phase-03 review items are:
  - accepted as backlog follow-up, or
  - required for this plan’s formal completion criteria.
