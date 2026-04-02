<!-- copilot/explanations/temporal/lossless-reports/2026-04-02/phase-07-active-role-surface-alignment-slice-03.md -->

# Lossless Report - Phase 07 Slice 03 (Active-Role Surface Alignment)

## Requested Scope
Continue Phase 07 beyond dashboard/route gates by aligning additional role-sensitive UI and hook logic with active-role semantics, while preserving existing non-requested behaviors.

## Preserved Behaviors
- Single-role users continue to function with the same effective behavior as before.
- Existing role hierarchy and route-gate semantics from Slices 01-02 remain unchanged.
- Existing preview-mode behavior in Topic/Quizzes remains intact (active role plus preview override where applicable).
- Existing Firestore query scoping by institution and ownership remains unchanged.
- Existing unrelated workspace deletion (`phase07-lint-current.json`) remained untouched.

## Touched Files
- `src/pages/Topic/Topic.tsx`
- `src/pages/Topic/hooks/useTopicLogic.ts`
- `src/pages/Topic/components/TopicTabs.tsx`
- `src/pages/Topic/components/TopicContent.tsx`
- `src/pages/Topic/components/TopicAssignmentsSection.tsx`
- `src/pages/Quizzes/Quizzes.tsx`
- `src/pages/Subject/Subject.tsx`
- `src/pages/Subject/components/SubjectTestsPanel.tsx`
- `src/pages/Subject/components/SubjectGradesPanel.tsx`
- `src/pages/Home/components/BinView.tsx`
- `src/hooks/useNotifications.tsx`
- `src/hooks/useFolders.ts`
- `src/hooks/useSubjects.ts`
- `src/hooks/useShortcuts.tsx`
- `src/pages/InstitutionAdminDashboard/hooks/useCustomization.ts`
- `tests/unit/hooks/useShortcuts.test.js`
- `tests/unit/hooks/useTopicLogic.test.js`

## Per-File Verification
- Topic stack (`Topic`, `useTopicLogic`, `TopicTabs`, `TopicContent`, `TopicAssignmentsSection`):
  - student/manage/viewer branches now resolve from `getActiveRole(user)`.
  - preserved existing viewer/preview checks and content-flow behavior.
- Subject stack (`Subject`, `SubjectTestsPanel`, `SubjectGradesPanel`):
  - teacher-vs-student manage logic now resolves from active role.
- Quizzes/Bin:
  - runtime student checks now derive from active role.
- Hooks (`useNotifications`, `useFolders`, `useSubjects`, `useShortcuts`):
  - role-dependent read/listener/query branches now use active role.
  - Home readiness gate now keys role readiness from active role where role presence is required.
- Institution customization hook:
  - claim expectation role now derives from active role.
- Tests:
  - updated permission-utils mocks in `useShortcuts.test.js` and `useTopicLogic.test.js` to include `getActiveRole` export.

## Validation Summary
- Targeted role/impact suite:
  - `npm run test -- tests/unit/hooks/useTopicLogic.test.js tests/unit/hooks/useShortcuts.test.js tests/unit/utils/permissionUtils.test.js tests/unit/App.authListener.test.jsx`
  - Result: pass (4 files, 46 tests).
- Typecheck:
  - `npx tsc --noEmit`
  - Result: exit 0.
- Lint:
  - `npm run lint`
  - Result: exit 0 with 4 pre-existing warnings in unrelated `src/pages/Content/Exam.jsx` and `src/pages/Content/StudyGuide.jsx`.
- IDE diagnostics:
  - `get_errors` clean on all touched source/test files.
- Additional guard:
  - PowerShell search for `user?.role`/`user.role` in the targeted Slice 03 surfaces returned `NO_MATCHES`.

## Residual Risk / Next Slice
- Phase 07 remains in progress at the plan level; residual role-read audit outside the current targeted surface set can continue if requested before transitioning to Phase 08 stabilization.
