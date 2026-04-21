<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/test-strategy.md -->
# Test Strategy — Multi-Feature Enhancement Architecture

**Purpose**: Complete test plan per phase. Every phase requires passing tests before merge.

---

## Testing Framework

| Type | Tool | Config | Command |
|------|------|--------|---------|
| Unit Tests | Vitest | `vitest.config.js` | `npm run test` |
| E2E Tests | Playwright | `playwright.config.js` | `npx playwright test` |
| Type Check | TypeScript | `tsconfig.json` | `npx tsc --noEmit` |
| Lint | ESLint | `eslint.config.js` | `npm run lint` |

---

## Phase 01: Cursor Pointer Audit

### Unit Tests
| Test File | Coverage |
|-----------|----------|
| `tests/unit/utils/cursorAudit.test.ts` | Global CSS rule applies `cursor: pointer` to buttons and `[role="button"]` |
| (Integration-level) | Spot-check 5+ components for `cursor-pointer` class presence in rendered output |

### E2E Tests
- Not required (visual/CSS only; manual spot-check sufficient)

---

## Phase 02: Theme Toggle Smoothness

### Unit Tests
| Test File | Coverage |
|-----------|----------|
| `tests/unit/utils/themeMode.test.js` (extend) | `applyThemeToDom` applies `theme-switching` class; class is removed after timeout |
| `tests/unit/hooks/useDarkMode.test.ts` | Toggle produces correct state transition; no immediate class jump |

### E2E Tests
| Test File | Coverage |
|-----------|----------|
| `tests/e2e/theme-toggle.spec.ts` | Toggle from light→dark: verify ball position transitions (not instant); verify all elements have `transition` property during switch |

---

## Phase 03: Centralized Unsaved-Changes Guard

### Unit Tests
| Test File | Coverage |
|-----------|----------|
| `tests/unit/hooks/useUnsavedChangesGuard.test.ts` | `isDirty` false initially; `isDirty` true after form change; `isDirty` false after reset; `confirmClose()` logic |
| `tests/unit/components/UnsavedChangesConfirmModal.test.tsx` | Renders with correct Spanish text; calls discard handler; calls cancel handler; applies dark mode classes |
| `tests/unit/components/GuardedOverlay.test.tsx` | Shows guard when dirty + close attempt; passes through when clean; integrates with hook |

### E2E Tests
| Test File | Coverage |
|-----------|----------|
| `tests/e2e/unsaved-changes-guard.spec.ts` | Open overlay → modify field → click outside → confirmation appears → "Cancelar" keeps open → "Descartar" closes |

---

## Phase 04: Subject Uniqueness Constraint

### Unit Tests
| Test File | Coverage |
|-----------|----------|
| `tests/unit/utils/subjectValidation.test.ts` | Duplicate detection returns true for matching (name, course, year, classes); returns false for non-matching; handles edge cases (empty strings, null values, different case) |
| `tests/unit/pages/Subject/SubjectFormModal.test.tsx` | Form shows error message when duplicate detected; form allows submission when unique |

### E2E Tests
| Test File | Coverage |
|-----------|----------|
| `tests/e2e/subject-uniqueness.spec.ts` | Create subject → attempt to create duplicate → error message shown → modify one field → creation succeeds |

---

## Phase 05: Subject Field Cascading Updates

### Unit Tests
| Test File | Coverage |
|-----------|----------|
| `tests/unit/utils/subjectCascading.test.ts` | Year change → class list filter updated; period change → completion status recalculated; batch write success/failure handling |
| `tests/unit/pages/Subject/SubjectFormModal.test.tsx` (extend) | Changing year updates class dropdown; changing period updates finished indicator |

### E2E Tests
| Test File | Coverage |
|-----------|----------|
| `tests/e2e/subject-cascading.spec.ts` | Edit subject → change year → verify classes tab shows only new-year classes → save → verify subject status updates |

---

## Phase 06: Teacher Dashboard Conduct Default

### Unit Tests
| Test File | Coverage |
|-----------|----------|
| `tests/unit/pages/TeacherDashboard/TeacherDashboard.test.tsx` | New student rows show conduct = 10; fallback to 10 when `behaviorScore` is undefined |

### E2E Tests
- Not required for this phase (simple default value change)

---

## Phase 07: Badges System — Data Model & Schema

### Unit Tests
| Test File | Coverage |
|-----------|----------|
| `tests/unit/utils/badgeUtils.test.ts` | Badge template validation; grade threshold check; style interpolation (8→green, 9→amber, 10→gold); edge cases (NaN, undefined, 0, negative) |
| `tests/unit/hooks/useBadges.test.ts` | Fetches badges scoped by institutionId; handles empty collections; CRUD operations return correct state |
| `tests/unit/types/badges.test.ts` | Type guards for badge variants work correctly |

### E2E Tests
- Not required for data model phase (no UI changes yet)

---

## Phase 08: Badges System — Automatic Badges

### Unit Tests
| Test File | Coverage |
|-----------|----------|
| `tests/unit/utils/badgeUtils.test.ts` (extend) | Auto-badge computation: mean ≥ threshold → award; mean < threshold → revoke; perfect score detection; style grade mapping; no grades → no badge; single grade = mean |
| `tests/unit/hooks/useBadgeAutoComputation.test.ts` | Trigger on grade update; correct Firestore writes; transaction atomicity |
| `tests/unit/components/BadgeChip.test.tsx` | Dynamic style rendering for different grade levels; "perfect" style at 10; threshold style at 8 |

### E2E Tests
| Test File | Coverage |
|-----------|----------|
| `tests/e2e/badges-auto.spec.ts` | Student profile → update grade → badge appears; lower grade → badge disappears; badge color matches grade level |

---

## Phase 09: Badges System — Manual + Subject Badges

### Unit Tests
| Test File | Coverage |
|-----------|----------|
| `tests/unit/components/BadgeManagement.test.tsx` | Teacher can see award/revoke buttons; institution admin sees general badges; student cannot see management controls |
| `tests/unit/components/SubjectBadges.test.tsx` | Subject badges render per-subject; teacher can create custom badge; badge award flow completes |
| `tests/unit/components/GeneralBadges.test.tsx` | General badges render cross-subject; auto-computation from subject means |
| `tests/unit/utils/badgePermissions.test.ts` | Teacher can manage subject badges; admin can manage general badges; student has read-only |

### E2E Tests
| Test File | Coverage |
|-----------|----------|
| `tests/e2e/badges-manual.spec.ts` | Teacher dashboard → award manual badge → verify on student profile → revoke badge → verify removed |
| `tests/e2e/badges-subject.spec.ts` | Subject page → create custom badge → award to student → verify in student detail |
| `tests/e2e/badges-general.spec.ts` | Institution admin → configure general badge → auto-computes from subject data |

---

## Phase 10: Final Optimization & Review

### Validation Commands (ALL must pass)
```bash
npm run test                  # All vitest tests
npx playwright test           # All e2e tests (if emulator available)
npm run lint                  # 0 errors
npx tsc --noEmit              # Type check clean
npm run security:scan:branch  # No credentials
```

### Test Coverage Targets

| Area | Unit Test Target | E2E Target |
|------|-----------------|------------|
| Badge utilities | 90%+ | — |
| Badge hooks | 80%+ | — |
| Badge components | 80%+ | 3+ flows |
| Unsaved changes guard | 90%+ | 1 flow |
| Subject validation | 90%+ | 1 flow |
| Subject cascading | 80%+ | 1 flow |
| Theme toggle | 80%+ | 1 flow |
| Cursor audit | Basic | — |

---

## Test File Naming Convention

```
tests/unit/<mirror-of-src-path>/<FileName>.test.ts(x)
tests/e2e/<feature-name>.spec.ts
```

Example:
- `src/utils/badgeUtils.ts` → `tests/unit/utils/badgeUtils.test.ts`
- `src/hooks/useBadges.ts` → `tests/unit/hooks/useBadges.test.ts`
- Badge auto flow → `tests/e2e/badges-auto.spec.ts`
