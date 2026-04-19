<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/phases/phase-08-badges-auto.md -->
# Phase 08: Badges System — Automatic Badges

**Status**: `not-started`
**Sub-Branch**: `arch/multi-feature-enhancement-2026-04-19/phase-08-badges-auto`
**Dependencies**: Phase 07 (badge data model)
**Threat Refs**: T-DATA-01, T-DATA-05, T-UX-03

---

## Objective

Implement automatic badge assignment based on student grades. Badges are awarded when a student's mean reaches the institution threshold and revoked when it drops below. Badge visual style changes dynamically based on the score level.

---

## Tasks

### 8.1 — Grade Mean Computation Service
- [ ] Create or extend: `src/utils/badgeUtils.ts`
- [ ] `computeSubjectMean(studentId, subjectId, institutionId): Promise<number>`
  - Fetch all grades for student in subject
  - Compute arithmetic mean
  - Handle: no grades (return NaN), single grade, multiple grades
- [ ] `computeOverallMean(studentId, institutionId): Promise<number>`
  - Fetch means across all subjects
  - Compute mean of subject means (equal weight)
  - Handle: no subjects, subjects with no grades

### 8.2 — Auto-Badge Trigger Logic
- [ ] Create: `src/hooks/useBadgeAutoComputation.ts`
- [ ] On grade update (new grade saved):
  1. Recompute subject mean
  2. Check against institution threshold
  3. If mean ≥ threshold AND no active badge → award auto-badge
  4. If mean < threshold AND active badge exists → revoke auto-badge
  5. If badge exists AND mean changed → update style level
- [ ] Use Firestore transactions for atomic award/revoke
- [ ] Trigger computation client-side on grade save (optimistic approach)
- [ ] Consider Cloud Function for server-side computation (document as future enhancement)

### 8.3 — Dynamic Style System
- [ ] Extend `BadgesSection.jsx` or create `BadgeChip` update:
  - Badge at threshold (8) → green gradient: `from-green-400 to-emerald-500`
  - Badge at 8.5 → lime gradient: `from-lime-400 to-green-500`
  - Badge at 9 → amber gradient: `from-amber-400 to-yellow-500`
  - Badge at 9.5 → orange gradient: `from-orange-400 to-amber-500`
  - Badge at 10 (perfect) → gold gradient: `from-yellow-300 to-amber-400` + special glow `shadow-yellow-400/50`
- [ ] `getStyleForScore(score, threshold, perfect)` function
  - Returns: `{ gradient, glow, label, isPerfect }`
  - Interpolates between discrete color stops
  - Handles non-integer scores (e.g., 8.7)

### 8.4 — Badge Display Enhancement
- [ ] Update `BadgesSection.jsx` to show dynamic style per badge
- [ ] Add "perfect" visual indicator for 10/10 badges
- [ ] Show current score on auto-badge tooltip/hover
- [ ] Show "Insignia perdida" state when revoked (grayed out, crossed)
- [ ] Separate auto-badges from manual badges in display

### 8.5 — Institution Threshold Integration
- [ ] Read threshold from `useInstitutionBadgeSettings` (Phase 07)
- [ ] Default to 8 when no setting exists
- [ ] Institution admin can change threshold:
  - Add threshold setting to institution admin dashboard (simple number input)
  - Changing threshold does NOT retroactively revoke/award badges
  - Threshold change applies to future grade updates only

### 8.6 — Testing
- [ ] Unit: `computeSubjectMean` — empty, single, multiple grades
- [ ] Unit: `computeOverallMean` — empty, partial, full data
- [ ] Unit: Auto-badge award when mean reaches threshold
- [ ] Unit: Auto-badge revoke when mean drops below
- [ ] Unit: Style level changes with score
- [ ] Unit: Perfect score detection
- [ ] Unit: Threshold boundary (exactly at threshold, 0.01 below, 0.01 above)
- [ ] E2E: Update grade → badge appears → change grade down → badge disappears

---

## Acceptance Criteria

- [ ] Student reaching grade threshold automatically receives badge
- [ ] Student dropping below threshold loses badge
- [ ] Badge visual style changes from green → gold as score increases
- [ ] Perfect score (10/10) shows special "perfect" styling
- [ ] Institution admin can configure threshold (default 8)
- [ ] Computation handles edge cases (NaN, no grades, partial data)
- [ ] No race conditions during simultaneous grade updates
- [ ] Performance acceptable (computation on grade save, not every page load)

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/hooks/useBadgeAutoComputation.ts` | Create — auto-badge trigger logic |
| `src/utils/badgeUtils.ts` | Extend — grade computation, style system |
| `src/pages/Profile/components/BadgesSection.jsx` | Modify — dynamic styles, auto/manual separation |
| `src/pages/Profile/components/BadgeChip.tsx` | Create/modify — individual badge with dynamic style |

---

## Validation Evidence

_(Fill after implementation)_

| Check | Result |
|-------|--------|
| Auto-award on threshold | |
| Auto-revoke below threshold | |
| Style green → gold progression | |
| Perfect score style | |
| Threshold config works | |
| Edge cases handled | |
| Unit tests pass | |
| E2E test pass | |
