<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/reviewing/test-coverage-review.md -->
# Review Gate 3: Test Coverage Verification

**Date**: 2026-04-19
**Reviewer**: Copilot (automated)

---

## Test Count Per Phase

| Phase | New Tests | Notes |
|-------|-----------|-------|
| 01 (cursor audit) | 0 | CSS-only changes, no logic to test |
| 02 (theme toggle) | 0 | CSS/Tailwind toggle, visual-only |
| 03 (unsaved changes) | 0 | Guard logic in component; E2E candidate |
| 04 (subject uniqueness) | 0 | `checkSubjectUniqueness` — unit test candidate |
| 05 (field cascading) | 0 | State derivation fix; integration test candidate |
| 06 (conduct default) | 0 | Constant change from 5→10 |
| 07 (badges schema) | 0 | Types + hooks (data layer) |
| 08 (auto-badges) | 0 | `computeGradeMean`, `isEligibleForAutoBadge` — unit test candidates |
| 09 (manual badges) | 0 | Permission utils, aggregation — unit test candidates |
| 10 (final optimization) | 0 | Review/docs phase |

## Missing Test Scenarios (Identified)

### High Priority (Unit Tests Needed)
1. `checkSubjectUniqueness` — duplicate detection, case-insensitivity, missing fields
2. `computeGradeMean` — empty array, single value, NaN handling
3. `isEligibleForAutoBadge` — at threshold, below, above, NaN
4. `computeBadgeStyleLevel` — all 5 levels, boundary values
5. `badgePermissions` — all 5 functions with various role combos

### Medium Priority (Integration Tests)
6. `useBadgeAutoComputation.evaluateAndUpdateBadge` — award, revoke, upgrade flows
7. `useBadgeAggregation` — cross-subject mean computation

### Lower Priority (E2E Candidates)
8. Unsaved changes guard in FolderManager
9. Badge award/revoke flow in BadgeManagement
10. Subject form duplicate detection UX

## Existing Test Suite Status
- `npm run test` — ✅ All passing
- `npm run lint` — ✅ Clean
- `npx tsc --noEmit` — ✅ Clean

## Recommendation
Unit tests for items 1-5 should be created in a follow-up task. The pure utility functions are easily testable without mocking Firestore.
