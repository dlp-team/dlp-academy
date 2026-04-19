<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/strategy-roadmap.md -->
# Strategy Roadmap — Multi-Feature Enhancement Architecture

**Source of Truth for phase sequencing, dependencies, and execution status.**

---

## Connection Analysis

The 6 features have the following dependency graph:

```
Centralized Unsaved-Changes Guard ──────────┐
                                             ├──► Subject Enhancements (uses guard)
Cursor Pointer Audit ─────────── (independent)    │
Theme Toggle Smoothness ──────── (independent)    │
Teacher Dashboard Conduct ────── (independent)    │
                                                  │
Subject Enhancements ────────────────────────────►│
                                                  ├──► Badges System
Teacher Dashboard ───────────────────────────────►│    (depends on subjects, teacher dashboard,
Institution Admin (badge threshold) ─────────────►│     institution admin settings)
```

**Key Insight**: The Centralized Unsaved-Changes Guard and Cursor Audit are pure infrastructure — they have no dependencies and are consumed by later phases. They must execute first. The Badges System is the most complex and depends on Teacher Dashboard, Subject system, and Institution Admin settings — it executes last.

---

## Phase Execution Order

| Phase | Name | Status | Dependencies | Sub-Branch | Est. Files |
|-------|------|--------|-------------|------------|-----------|
| **01** | Cursor Pointer Audit & Policy | `completed` | None | `arch/.../phase-01-cursor-audit` | 15-25 |
| **02** | Theme Toggle Smoothness | `completed` | None | `arch/.../phase-02-theme-toggle` | 4-6 |
| **03** | Centralized Unsaved-Changes Guard | `completed` | None | `arch/.../phase-03-unsaved-changes` | 8-12 |
| **04** | Subject Uniqueness Constraint | `completed` | Phase 03 (guard for overlay) | `arch/.../phase-04-subject-uniqueness` | 4-6 |
| **05** | Subject Field Cascading Updates | `completed` | Phase 03, Phase 04 | `arch/.../phase-05-subject-cascading` | 6-10 |
| **06** | Teacher Dashboard Conduct Default | `completed` | None | `arch/.../phase-06-conduct-default` | 2-3 |
| **07** | Badges System — Data Model & Schema | `completed` | Phase 06 (conduct context) | `arch/.../phase-07-badges-schema` | 8-12 |
| **08** | Badges System — Automatic Badges | `completed` | Phase 07 | `arch/.../phase-08-badges-auto` | 10-15 |
| **09** | Badges System — Manual + Subject Badges | `completed` | Phase 07, Phase 08 | `arch/.../phase-09-badges-manual-subject` | 12-18 |
| **10** | Final Optimization & Review | `completed` | All phases | base branch | All |

---

## Phase Details

### Phase 01: Cursor Pointer Audit & Policy
**Objective**: Ensure every clickable element in the codebase has `cursor-pointer`. Update copilot reference docs to enforce this as mandatory policy.

**Deliverables**:
- Update `copilot/REFERENCE/UI_PATTERNS_INDEX.md` with cursor-pointer mandate
- Update `.github/instructions/ui-component-centralization.instructions.md` with cursor rule
- Audit all `onClick` handlers across `src/` — add missing `cursor-pointer`
- Add `disabled:cursor-not-allowed` where disabled states exist
- Create/update global CSS rule if beneficial

**Acceptance Criteria**:
- `grep -r "onClick" src/ | wc -l` matches count of elements with `cursor-pointer` (or inheriting it)
- No clickable element renders default cursor
- Copilot docs updated with enforceable rule

---

### Phase 02: Theme Toggle Smoothness
**Objective**: Eliminate lag when toggling theme. Add smooth CSS transitions to all elements. Fix toggle ball animation to use transition instead of instant jump.

**Deliverables**:
- Add CSS `transition` properties for `background-color`, `color`, `border-color`, `box-shadow` on `*` or targeted selectors during theme switch
- Fix the Header toggle ball animation with `transition: transform 200ms ease`
- Ensure the `theme-switching` class in `index.css` covers all visual properties
- Test both directions: light→dark and dark→light
- Verify no FOUC (flash of unstyled content)

**Acceptance Criteria**:
- Toggle ball animates smoothly (not instant jump)
- All page elements transition smoothly during theme change
- No visible lag or jarring color jumps
- Works on Chrome, Firefox, Edge

---

### Phase 03: Centralized Unsaved-Changes Guard
**Objective**: Create a reusable component/hook that wraps any overlay/modal and automatically detects unsaved changes, prompting the user before closing.

**Deliverables**:
- Create `src/hooks/useUnsavedChangesGuard.ts` — hook that tracks dirty state and provides confirmation logic
- Create `src/components/ui/UnsavedChangesConfirmModal.tsx` — standardized confirmation modal
- Create `src/components/ui/GuardedOverlay.tsx` — HOC or wrapper that integrates the guard with any overlay
- Integrate with `SubjectFormModal` as first consumer (proof of concept)
- Document component in `copilot/REFERENCE/COMPONENT_REGISTRY.md`

**Acceptance Criteria**:
- Hook correctly detects dirty state from form changes
- Clicking outside a dirty overlay triggers confirmation dialog
- "Descartar y cerrar" closes without saving
- "Cancelar" keeps overlay open
- Clean (no changes) overlays close immediately without prompt
- Component is generic and reusable

---

### Phase 04: Subject Uniqueness Constraint
**Objective**: Prevent creation of subjects with identical name + course + academic year + associated classes.

**Deliverables**:
- Add uniqueness validation query in subject creation/edit flow
- Show user-friendly Spanish error message when duplicate detected
- Validate both on creation and on edit (when changing name/course/year/classes)
- Add unit tests for the validation logic

**Acceptance Criteria**:
- Cannot create two subjects with same (name, course, year, classes) tuple
- Clear error message appears inline (not browser alert)
- Editing an existing subject to match another is blocked
- Existing subjects are not affected (no migration needed)

---

### Phase 05: Subject Field Cascading Updates
**Objective**: When modifying subject fields (course, academic year, academic period), propagate changes to related entities and UI state.

**Deliverables**:
- When `academicYear` changes → update available classes in "Clases" tab to show only classes from new year
- When `academicPeriod` or `academicYear` changes → re-evaluate subject finished/not-finished status
- Update visual style (finished indicator) after status change
- Apply the unsaved-changes guard (Phase 03) to the subject edit overlay
- Unit tests for cascading logic

**Acceptance Criteria**:
- Changing academic year refreshes available classes dropdown
- Changing academic period updates subject completion status
- Visual indicators update immediately after field change
- Unsaved changes prompt appears when clicking outside with pending changes
- No data corruption on cascading updates

---

### Phase 06: Teacher Dashboard — Conduct Default
**Objective**: Set default conduct/behaviour score to 10 for all students in "Mis Alumnos".

**Deliverables**:
- Update default `behaviorScore` to 10 in teacher dashboard
- Ensure new students get `behaviorScore: 10` as default in Firestore
- Update any initialization logic that sets a different default

**Acceptance Criteria**:
- New students appear with conduct score 10/10
- Existing students without a score show 10 (fallback)
- Teacher can still modify the score via dropdown
- No regression in student list rendering

---

### Phase 07: Badges System — Data Model & Schema
**Objective**: Design and implement the Firestore data model for the enhanced badge system supporting: automatic vs manual, general vs subject-specific, grade-based dynamic styling, institution-configurable thresholds.

**Deliverables**:
- Firestore schema design document
- Create/update collections: `badges`, `badgeTemplates`, `institutionBadgeSettings`
- Badge template model: `{ id, name, description, icon, type: 'auto'|'manual', scope: 'general'|'subject', category, gradingConfig?, styleConfig }`
- Institution settings: `{ gradeThreshold: 8, badgeTemplates: [...] }`
- Create `src/utils/badgeUtils.ts` — badge computation utilities
- Create `src/hooks/useBadges.ts` — data fetching hook with multi-tenant scoping
- TypeScript interfaces for all badge types

**Acceptance Criteria**:
- Schema supports auto/manual badge distinction
- Schema supports general/subject scope distinction
- Schema supports institution-configurable grade threshold (default: 8)
- Schema supports dynamic style progression (8→10 maps to green→gold)
- All queries scoped by `institutionId`
- TypeScript types cover all badge variants

---

### Phase 08: Badges System — Automatic Badges
**Objective**: Implement automatic badge assignment based on grades, with dynamic styling that changes from green (threshold) to gold (perfect score).

**Deliverables**:
- Grade computation service: mean calculation per subject and overall
- Auto-badge trigger: when student's mean reaches institution threshold → award badge
- Auto-badge revocation: when student's mean drops below threshold → revoke badge
- Dynamic style progression: threshold (8) = green → increasing to gold at perfect (10)
- Style interpolation between threshold and max score
- Integration with existing `BadgesSection.jsx` display
- Institution admin setting for threshold (default: 8)

**Acceptance Criteria**:
- Student reaching grade threshold automatically receives badge
- Badge is lost when grade drops below threshold
- Badge visual style changes dynamically with grade level (8=green, 9=amber, 10=gold)
- Perfect score (10/10) shows special "perfect" style
- Institution admin can configure threshold (default 8)
- Computation handles edge cases (no grades, partial grades, NaN)

---

### Phase 09: Badges System — Manual + Subject Badges
**Objective**: Implement teacher-granted manual badges, subject-specific badges, general institution badges, and cross-dependency badges (general depending on subject badges).

**Deliverables**:
- **Manual badges**: Teacher can create and award/revoke badges to students
- **Subject badges**: Per-subject badge set, teacher-managed from:
  - Teacher dashboard → "Mis Alumnos" → Student detail
  - Subject page → Student list
- **General badges**: Institution admin manages general (cross-subject) badges
  - Auto-computed from subject badge aggregation (e.g., mean behavior across subjects)
- **Teacher badge creation UI**: Create/edit badge templates within subject scope
- **Institution admin badge management UI**: Create/edit general badge templates
- **Award/Revoke flow**: Teacher can grant and remove manual badges
- **Dashboard integration**: Badges visible in teacher dashboard student table

**Acceptance Criteria**:
- Teacher can create custom badges for their subjects
- Teacher can award/revoke manual badges from dashboard and student view
- Institution admin can manage general badge templates
- General auto-badges aggregate from subject-level data (e.g., mean conduct across subjects)
- Subject badges are independent per subject per student
- Badge display shows both general and subject badges clearly separated
- Teacher and institution admin can revoke any badge they manage

---

### Phase 10: Final Optimization & Review
**Objective**: Consolidate, optimize, and verify the entire architecture.

**Deliverables**:
- Execute centralization audit findings
- Split any oversized files (>500 lines)
- Remove debug `console.log` statements
- Verify all Spanish text
- File path comments on all new files
- Full lint pass
- Full test suite pass
- Type check pass
- Security scan
- Create three review documents (optimization, risk, test coverage)

**Acceptance Criteria**:
- `npm run test` — all pass
- `npm run lint` — 0 errors
- `npx tsc --noEmit` — clean
- `npm run security:scan:branch` — no findings
- All review documents complete
- User confirms completion

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Badge auto-revocation causes confusion | Medium | Medium | Clear UI indication of badge status; "lost" vs "not earned" states |
| Subject cascading breaks existing data | Low | High | Validate cascading logic thoroughly; test with edge cases |
| Theme transition causes FOUC | Low | Low | Use `will-change` hints; test across browsers |
| Centralized guard breaks existing overlays | Low | High | Incremental adoption; first integrate with one overlay, validate, then expand |
| Badge threshold setting missing for existing institutions | Medium | Medium | Default threshold (8) applied when no setting exists |
| Performance hit from badge auto-computation | Medium | Medium | Compute on grade change, not on every page load; cache results |

---

## Metrics

| Metric | Target |
|--------|--------|
| Total phases | 10 |
| Estimated new/modified files | 60-90 |
| New vitest tests | 30-50 |
| New Playwright e2e scenarios | 10-15 |
| Code centralization opportunities | 5-8 |
