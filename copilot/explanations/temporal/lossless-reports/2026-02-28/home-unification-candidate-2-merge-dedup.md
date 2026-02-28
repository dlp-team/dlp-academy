# Lossless Report — home-unification-candidate-2-merge-dedup

## Timestamp
- 2026-02-28

## 1) Requested scope
- Continue with Candidate 2 and update reviewing with concrete tests: extract repeated source+shortcut merge/dedup logic and define explicit verification checklist to ensure no feature loss.

## 2) Out-of-scope behavior explicitly preserved
- No changes to user-facing Spanish copy.
- No change to share/unshare business branches.
- No theming token rollout in this step.
- No modal UX redesign.

## 3) Touched files list
- src/utils/homeMergeUtils.js
- src/pages/Home/Home.jsx
- src/pages/Home/components/HomeContent.jsx
- copilot/plans/active/home-unification-and-institution-theming/phases/phase-02-shared-home-abstractions-planned.md
- copilot/plans/active/home-unification-and-institution-theming/reviewing/verification-checklist-2026-02-28-phase-02-candidates-1-2.md

## 4) Per-file verification list
### File: src/utils/homeMergeUtils.js
- Why touched: introduce a reusable source+shortcut merge utility.
- Reviewed items:
  - `mergeSourceAndShortcutItems` keeps source key and shortcut key semantics.
  - Dedupe preserves first-seen ordering and ignores invalid keys.
- Result: ✅ adjusted intentionally

### File: src/pages/Home/Home.jsx
- Why touched: replace duplicated tree merge logic.
- Reviewed items:
  - `treeFolders` now delegates to merge utility with same source/shortcut inputs.
  - `treeSubjects` now delegates to merge utility with same source/shortcut inputs.
  - Shared scope/tag logic remains unchanged.
- Result: ✅ preserved

### File: src/pages/Home/components/HomeContent.jsx
- Why touched: replace duplicated tree merge logic.
- Reviewed items:
  - `allFoldersForTree` uses merge utility then existing shared filter.
  - `allSubjectsForTree` uses merge utility then existing shared filter.
  - Downstream tree navigation and filtering references untouched.
- Result: ✅ preserved

### File: copilot/plans/active/home-unification-and-institution-theming/reviewing/verification-checklist-2026-02-28-phase-02-candidates-1-2.md
- Why touched: requested update to reviewing with exact tests.
- Reviewed items:
  - Added functional parity checks, mode parity checks, and no-feature-loss checks.
  - Added technical validation + review-log instruction.
- Result: ✅ adjusted intentionally

### File: copilot/plans/active/home-unification-and-institution-theming/phases/phase-02-shared-home-abstractions-planned.md
- Why touched: reflect progress status and artifacts.
- Reviewed items:
  - Candidate 2 completion note.
  - Reviewing checklist linkage.
- Result: ✅ adjusted intentionally

## 5) Risks found + how they were checked
- Risk: changed dedup ordering could alter visible order.
  - Check: utility preserves insertion order consistent with prior loops.
- Risk: hidden behavior change in shared filtering.
  - Check: shared filtering remains post-merge and unchanged in both files.
- Risk: compile/import issues from new utility.
  - Check: `get_errors` clean on all touched code files.

## 6) Validation summary
- `get_errors` run for:
  - `src/utils/homeMergeUtils.js`
  - `src/pages/Home/Home.jsx`
  - `src/pages/Home/components/HomeContent.jsx`
- Result: no errors found.
- Manual runtime verification: pending via checklist in reviewing.
