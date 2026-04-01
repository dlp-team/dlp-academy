# Lossless Report - Exam/StudyGuide Hook Order + Duplicate Audit

Date: 2026-04-01

## Requested Scope
- Continue strict readiness audit.
- Add explicit verification for duplicate JS/JSX vs TS/TSX files that appeared.
- Prioritized next fix: remove hook-order unit-test blockers in Exam and StudyGuide.

## Implementation Changes

### 1) Hook-order crash fix in Exam
- File: src/pages/Content/Exam.jsx
- Change:
  - Converted `toggleAnswer` and `navigateQuestion` from `useCallback` constants to function declarations.
  - Removed now-unused `useCallback` import.
- Why:
  - The keyboard `useEffect` referenced these callbacks in the dependency array before their const declarations, triggering TDZ/ReferenceError in tests.

### 2) Hook-order crash fix in StudyGuide
- File: src/pages/Content/StudyGuide.jsx
- Change:
  - Converted `navigateToNextSection` and `navigateToPreviousSection` from `useCallback` constants to function declarations.
- Why:
  - Keyboard navigation `useEffect` dependency array referenced `navigateToNextSection` before const initialization, causing ReferenceError in tests.

## Duplicate-File Verification Added

### Scope and counts
- JSX/TSX duplicate basenames: 41
- JS/TS duplicate basenames: 6
- New or added duplicate files in current git state: 47

### High-risk resolution findings
- Explicit extension import forcing JS/JSX path in app bootstrap:
  - src/main.tsx imports `./App.jsx` while TS entry exists.
- Explicit extension imports in institution admin classes/courses:
  - src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx imports `.js`/`.jsx` modules directly.

## Preserved Behavior Checklist
- No route or feature flow changed intentionally.
- No API payload shape changed.
- No permission-gating logic changed.
- No style/theme behavior changed.

## Validation
- Diagnostics (`get_errors`) on touched files:
  - src/pages/Content/Exam.jsx: clean
  - src/pages/Content/StudyGuide.jsx: clean
- Unit tests:
  - Result: PASS
  - Summary: 71 files passed, 385 tests passed.

## Remaining Known Risks (not modified in this patch)
- Duplicate-file sprawl still unresolved (audit-only for this part).
- Last known e2e status from previous audit run was failing due login-to-home timeout path; not reworked in this patch.

## Touched Files
- src/pages/Content/Exam.jsx
- src/pages/Content/StudyGuide.jsx
