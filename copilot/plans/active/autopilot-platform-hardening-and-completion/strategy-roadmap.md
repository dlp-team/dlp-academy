<!-- copilot/plans/active/autopilot-platform-hardening-and-completion/strategy-roadmap.md -->
# Strategy Roadmap - Autopilot Platform Hardening and Completion

## Phase Status Legend
- PLANNED
- IN_PROGRESS
- COMPLETED
- BLOCKED

## Ordered Phases

### Phase 01 - Reliability and Security Foundations
- Status: COMPLETED
- Goal: remove high-impact reliability regressions and harden authorization boundaries.
- Outputs:
  - Home loading and permission resiliency improvements,
  - bulk-operation partial failure handling,
  - constrained Firestore teacher update rules,
  - regression rules tests for allow/deny boundaries.

### Phase 02 - Authentication and Session Controls
- Status: COMPLETED
- Goal: complete authentication-session UX requirements.
- Outputs:
  - remember-me persistence in user profile doc,
  - settings-level password change flow,
  - logout controls and redirect behavior.

### Phase 03 - Profile and Teacher Recognition Workflows
- Status: COMPLETED
- Goal: support teacher-managed recognition with aggregate visibility.
- Outputs:
  - aggregate student statistics for teachers,
  - badge utilities with course-scoped support,
  - profile badge assignment and auto academic badges.

### Phase 04 - Institution Customization Preview Stabilization
- Status: COMPLETED
- Goal: replace fragile iframe preview with deterministic mock roles and viewport controls.
- Outputs:
  - teacher/student mock preview component,
  - integration in institution customization tab,
  - unit coverage for preview behavior.

### Phase 05 - Subject, Topic, and Exam Workflow Completion
- Status: IN_PROGRESS
- Goal: complete missing end-to-end workflow behavior across academic content flows.
- Outputs:
  - workflow parity for subject/topic/exam/task actions,
  - explicit error/loading/empty-state handling where currently weak,
  - high-risk flow test coverage additions.

### Phase 06 - Responsive and Mobile Optimization
- Status: PLANNED
- Goal: ensure reliable tablet/mobile behavior across priority routes.
- Outputs:
  - responsive layout and interaction fixes,
  - viewport-specific validation matrix,
  - no-regression checks for desktop behavior.

### Phase 07 - TypeScript, Lint Debt, and Logic Centralization Tranche
- Status: PLANNED
- Goal: reduce maintenance risk by typing and centralizing duplicated logic.
- Outputs:
  - scoped TypeScript migration tranche,
  - lint debt reduction focused on touched modules,
  - extraction of duplicated logic to hooks/utils.

### Phase 08 - Final Review, Risk Report, and Closure
- Status: PLANNED
- Goal: produce closure-quality validation and risk documentation.
- Outputs:
  - complete review checklist,
  - residual risk report and rollback references,
  - inReview transition package.

## Immediate Next Actions
1. Continue Phase 05 after forty-six delivered slices (topic/subject deletion hardening + Home inline feedback migration + save/delete error feedback hardening + Topic alert-to-toast feedback migration + QuizEdit not-found inline feedback migration + useFolders circular-move feedback migration + Topic in-page delete confirmation migration + Subject topic in-page delete confirmation migration + Subject grades extra delete in-page confirmation migration + QuizEdit question delete in-page confirmation migration + Institution Admin courses/classes in-page delete confirmation migration + Institution Admin invite access in-page delete confirmation migration + Admin Dashboard institutions/users in-page confirmation migration + Admin Dashboard users pagination effect hardening + Admin Dashboard users pagination cursor regression coverage + SubjectTestsPanel snapshot error/loading feedback hardening + useTopicFailedQuestions listener error hardening and regression coverage + SubjectTopicModal snapshot inline error feedback hardening and regression coverage + useSubjectManager snapshot listener error fallback hardening and regression coverage + TopicAssignmentsSection submissions listener error feedback hardening and regression coverage + Topic page realtime listener feedback banner hardening and regression coverage + AdminPasswordWizard user-listener snapshot error fallback hardening and regression coverage + SubjectGradesPanel realtime listener feedback hardening and regression coverage + useTopicLogic snapshot listener toast feedback hardening and regression coverage + useTopicLogic child-listener teardown hardening and regression coverage + useSubjectManager resumen in-query chunking hardening and regression coverage + Exam load fallback determinism hardening and regression coverage + QuizClassResultsModal attempts feedback hardening and regression coverage + ViewResource iframe preview fallback hardening and regression coverage + TopicModals file-viewer fallback hardening and regression coverage + QuizReviewPage load fallback determinism hardening and regression coverage + Quizzes runtime load fallback determinism hardening and regression coverage + QuizRepaso session-storage fallback determinism hardening and regression coverage + QuizRepaso save-failure feedback determinism hardening and regression coverage + Quizzes save-result feedback determinism hardening and regression coverage + SubjectTopicModal reorder-commit failure feedback and rollback hardening with regression coverage + SubjectFormModal classes-list load feedback hardening and regression coverage + SubjectFormModal courses-list load feedback hardening and regression coverage + SubjectFormModal institution-user suggestions load feedback hardening and regression coverage + SubjectFormModal owner-email resolution feedback hardening and regression coverage + SubjectFormModal institution-policy load feedback hardening and regression coverage + SubjectFormModal class-request mutation permission feedback hardening and regression coverage + SubjectFormModal shortcut self-unshare permission feedback hardening and regression coverage + SubjectFormModal transfer-ownership permission feedback hardening and regression coverage + SubjectFormModal apply-all share-add permission feedback hardening and regression coverage).
2. Define viewport matrix and route priority for Phase 06 before mobile edits begin.
3. Select low-risk TypeScript tranche candidates (utilities/hooks first) for Phase 07.
4. Keep lossless reports synchronized after each phase output.

## Validation Gates per Active/Planned Phase
- Phase 05 gate:
  - All modified flows manually exercised,
  - relevant unit tests pass,
  - `npm run lint` and `npm run test` clean.
- Phase 06 gate:
  - Mobile/tablet matrix pass for priority routes,
  - no desktop regressions,
  - interaction parity for core teacher/student actions.
- Phase 07 gate:
  - Type/lint checks pass for migrated modules,
  - import boundaries and centralization validated,
  - no runtime behavior drift.
- Phase 08 gate:
  - Review checklist fully checked,
  - residual risks documented with owner and mitigation,
  - transition readiness to `inReview` confirmed.
