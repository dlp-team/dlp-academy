<!-- copilot/plans/active/autopilot-platform-hardening-and-completion/phases/phase-05-subject-topic-exam-workflow-completion.md -->
# Phase 05 - Subject, Topic, and Exam Workflow Completion

## Status
IN_PROGRESS

## Objective
Close the remaining functional gaps in academic workflows (subjects, topics, exams, and linked tasks) while preserving existing role-based behavior.

## Planned Change Set
- Audit current user journeys for teacher and student flows across subject/topic/exam/task surfaces.
- Fill missing transitions, edge-case handling, and user feedback for create/edit/assign/complete paths.
- Normalize repeated workflow logic into shared hooks or utilities when duplication is confirmed.
- Add or expand tests for high-risk workflow branches.

## Progress Update - 2026-03-30
- Centralized topic cascade cleanup into `src/utils/topicDeletionUtils.js`.
- Wired shared cleanup utility into both:
  - `useSubjectManager.deleteTopic` (Subject view deletion entry point),
  - `useTopicLogic.handleDeleteTopic` (Topic view deletion entry point).
- Expanded default cleanup scope to include exam collections (`exams`, `examns`) in addition to documents/resources/quizzes.
- Added/updated unit coverage:
  - `tests/unit/utils/topicDeletionUtils.test.js` (new),
  - `tests/unit/hooks/useSubjectManager.test.js` (integration assertion),
  - `tests/unit/hooks/useTopicLogic.test.js` (exam cascade expectations).

## Progress Update - 2026-03-30 (Slice 2)
- Refactored `useSubjects.permanentlyDeleteSubject` to reuse `cascadeDeleteTopicResources` for each topic.
- Removed duplicate inline per-collection cleanup logic from subject-level permanent delete flow.
- Confirmed subject permanent deletion now cleans exam artifacts through shared default cascade collections.
- Expanded `tests/unit/hooks/useSubjects.test.js` cascade assertions to verify `exams` and `examns` deletions.

## Progress Update - 2026-03-30 (Slice 3)
- Removed browser alerts from Home workflow hooks by replacing them with inline feedback plumbing.
- Added optional `onHomeFeedback` callback flow across:
  - `Home.jsx` (tone-aware inline message rendering),
  - `useHomeLogic` (callback threading),
  - `useHomeHandlers` (DnD and nesting error reporting),
  - `useHomePageState` (folder auto-cleaner notification).
- Added handler tests that validate error feedback callback behavior for failed move/nesting operations.

## Progress Update - 2026-03-30 (Slice 4)
- Extended Home inline feedback coverage to save/delete branches in `useHomeHandlers`.
- Added callback-driven error reporting for subject/folder save failures and folder unshare/delete failure paths.
- Added/updated unit tests in `tests/unit/hooks/useHomeHandlers.shortcuts.test.js` to verify these new feedback branches.

## Progress Update - 2026-03-30 (Slice 5)
- Replaced remaining browser alert-based Topic feedback paths in `useTopicLogic` with `showNotification(...)` toast feedback.
- Covered failure/info branches for:
  - rename failure,
  - file delete failure,
  - category change failure,
  - quiz delete failure,
  - empty file view attempts,
  - file categorization failure.
- Expanded `tests/unit/hooks/useTopicLogic.test.js` with toast assertions for the migrated branches and stabilized the FileReader categorization mock flow.

## Progress Update - 2026-03-30 (Slice 6)
- Removed browser alert usage from `QuizEdit` when topic context is missing.
- Added dedicated inline not-found UI state (`Tema no encontrado`) with explicit recovery action (`Volver`) instead of disruptive alert dialogs.
- Added focused page-level regression coverage in `tests/unit/pages/quizzes/QuizEdit.test.jsx` to ensure:
  - no browser alert is triggered,
  - inline feedback is rendered,
  - back navigation action remains available.

## Progress Update - 2026-03-30 (Slice 7)
- Removed browser alert usage from `useFolders.moveFolderBetweenParents` circular-dependency guard.
- Circular/self/no-op move branches now return explicit status metadata (`moved`, `reason`) without using blocking dialogs.
- Added regression coverage in `tests/unit/hooks/useFolders.test.js` verifying circular moves:
  - do not trigger browser alerts,
  - do not perform Firestore batch writes,
  - return deterministic failure reason.
- Cleared pre-existing file-scoped lint blockers in `useFolders.js` (unused imports/vars and no-useless-catch) to keep touched-file lint validation clean.

## Progress Update - 2026-03-30 (Slice 8)
- Replaced browser confirm dialogs in Topic destructive workflows with an in-page confirmation modal.
- Migrated the following actions to explicit modal-confirmed execution:
  - file deletion,
  - quiz deletion,
  - topic deletion.
- Added confirmation state/control flow in `useTopicLogic` (`confirmDialog`, `confirmDeleteAction`, `closeConfirmDialog`, `isConfirmingAction`).
- Added new UI component `TopicConfirmDeleteModal` and wired it through `TopicModals`.
- Expanded `tests/unit/hooks/useTopicLogic.test.js` to verify:
  - topic deletion only executes after modal confirmation,
  - file and quiz deletions are queued first and executed on confirm,
  - read-only users still cannot trigger destructive flows.

## Progress Update - 2026-03-30 (Slice 9)
- Replaced browser confirm dialog in Subject topic deletion workflow with an in-page confirmation modal.
- `Subject.jsx` now queues topic deletion intent and executes deletion only after explicit modal confirmation.
- Added focused page-level regression coverage in `tests/unit/pages/subject/Subject.topicDeleteConfirm.test.jsx` verifying:
  - modal opens when delete action is requested,
  - delete operation does not execute before confirmation,
  - cancel path closes the modal without deleting.

## Progress Update - 2026-03-30 (Slice 10)
- Replaced browser confirm dialog in Subject grades extra-activity deletion with an in-page confirmation modal in `SubjectGradesPanel`.
- Deletion now queues intent (`evaluationDeleteConfirm`) and executes only after explicit confirmation (`confirmDeleteEvaluationItem`), including related grade cleanup in the existing Firestore batch path.
- Added focused page-component regression coverage in `tests/unit/pages/subject/SubjectGradesPanel.deleteConfirm.test.jsx` verifying:
  - modal opens without browser `window.confirm(...)`,
  - deletion does not execute before explicit confirmation,
  - confirmation deletes both the evaluation item and associated grade docs.
- Cleared file-scoped pre-existing unused-variable lint blockers in `SubjectGradesPanel.jsx` to keep touched-file validation error-free.

## Progress Update - 2026-03-30 (Slice 11)
- Replaced browser confirm dialog in `QuizEdit` question deletion flow with an in-page confirmation modal.
- Question deletion now queues deletion intent (`questionDeleteConfirm`) and mutates `questions` only after explicit confirm (`confirmDeleteQuestion`).
- Added explicit delete-button accessibility label (`Eliminar pregunta N`) for deterministic UI interaction and testability.
- Expanded `tests/unit/pages/quizzes/QuizEdit.test.jsx` with confirmation-first deletion coverage verifying:
  - modal opens before deletion,
  - browser `window.confirm(...)` is not invoked,
  - confirm path deletes the target question,
  - cancel path preserves questions.

## Progress Update - 2026-03-30 (Slice 12)
- Replaced browser confirm dialogs in `ClassesCoursesSection` for both course and class deletion with a shared in-page confirmation modal.
- Deletion now queues intent metadata (`deleteConfirm`) and runs destructive actions only after explicit confirm (`confirmDelete`).
- Preserved existing delete semantics:
  - course delete still warns that associated classes are not deleted,
  - selected course/class detail is cleared after confirmed deletion when applicable.
- Added focused regression coverage in `tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx` verifying:
  - modal-first deletion flow for courses and classes,
  - cancel path does not execute destructive handlers,
  - browser `window.confirm(...)` is never invoked.

## Progress Update - 2026-03-30 (Slice 13)
- Replaced browser confirm dialog in Institution Admin invite-access removal flow with an in-page confirmation modal in `UsersTabContent`.
- Invite removal now queues intent metadata (`accessDeleteConfirm`) and executes destructive handler only after explicit confirm (`confirmRemoveAccess`).
- Removed hook-level browser confirm from `useUsers.handleRemoveAccess`; UI now owns confirmation while preserving the same Firestore delete path.
- Added focused regression coverage in `tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx` verifying:
  - modal opens before access removal,
  - cancel path preserves invite data and avoids handler execution,
  - browser `window.confirm(...)` is never invoked.

## Progress Update - 2026-03-30 (Slice 14)
- Replaced remaining browser confirm dialogs in `AdminDashboard` institutions and users tabs with a shared in-page confirmation modal (`AdminConfirmModal`).
- Migrated institution actions to confirmation-first execution:
  - enable/disable institution,
  - delete institution.
- Migrated user actions to confirmation-first execution:
  - enable/disable user,
  - role change.
- Added focused regression coverage in `tests/unit/pages/admin/AdminDashboard.confirmDialogs.test.jsx` verifying modal-first behavior for all four action paths and confirming browser `window.confirm(...)` is not invoked.

## Progress Update - 2026-03-30 (Slice 15)
- Hardened `AdminDashboard` users pagination fetch flow to remove stale effect dependency warnings while preserving behavior.
- Refactored `fetchUsers` in `UsersTab` into `useCallback` with explicit cursor input for next-page loads.
- Updated load-more trigger to pass `lastVisible` explicitly (`fetchUsers(true, lastVisible)`) and aligned initial effect dependency to `[fetchUsers]`.
- Revalidated modal-confirm destructive actions via focused AdminDashboard regression suite.

## Progress Update - 2026-03-30 (Slice 16)
- Added focused pagination regression coverage to `tests/unit/pages/admin/AdminDashboard.confirmDialogs.test.jsx` for `UsersTab` load-more behavior.
- New test validates cursor-based pagination contract:
  - second-page query uses `startAfter(lastVisible)` cursor,
  - next-page users are appended to existing table rows,
  - migrated in-page confirmation architecture still avoids browser `window.confirm(...)` usage.
- Revalidated with focused AdminDashboard suite and full repository test suite.

## Progress Update - 2026-03-30 (Slice 17)
- Hardened `SubjectTestsPanel` Firestore listener lifecycle to avoid stuck loading states on snapshot failures.
- Added explicit listener error callback in `src/pages/Subject/components/SubjectTestsPanel.jsx` that:
  - logs listener failures,
  - surfaces inline feedback (`No se pudieron cargar los tests. Intentalo de nuevo.`),
  - exits loading state deterministically.
- Added focused regression coverage in `tests/unit/pages/subject/SubjectTestsPanel.snapshotError.test.jsx` verifying:
  - snapshot success path renders quizzes and clears loading,
  - snapshot error path renders inline feedback and does not remain blocked in loading UI.

## Progress Update - 2026-03-30 (Slice 18)
- Hardened `useTopicFailedQuestions` listener error paths in `src/pages/Topic/hooks/useTopicFailedQuestions.js`.
- Added explicit error handling for both subscriptions:
  - attempts listener now logs failures, clears stale attempt/mastered state, and exits loading,
  - mastered-questions listener now logs failures and falls back to empty mastered state.
- Added focused hook regression coverage in `tests/unit/hooks/useTopicFailedQuestions.test.js` verifying:
  - failed question derivation excludes mastered entries,
  - stale failed-question state is cleared when a new topic listener errors.

## Progress Update - 2026-03-30 (Slice 19)
- Hardened `SubjectTopicModal` snapshot feedback behavior in `src/pages/Subject/modals/SubjectTopicModal.jsx`.
- Added inline modal error state (`loadError`) so topic-list listener failures are visible to users instead of failing silently.
- Snapshot error path now clears stale topic rows and shows explicit feedback (`No se pudieron cargar los temas. Intentalo de nuevo.`).
- Added focused regression coverage in `tests/unit/pages/subject/SubjectTopicModal.snapshotError.test.jsx` verifying:
  - successful snapshot path renders topic rows,
  - error snapshot path renders inline feedback and exits loading state.

## Progress Update - 2026-03-30 (Slice 20)
- Hardened `useSubjectManager` real-time listener failure behavior in `src/pages/Subject/hooks/useSubjectManager.js`.
- Added explicit error callbacks for both listeners:
  - topics listener now logs failures, clears topic state, and exits loading state,
  - resumen listener now logs failures explicitly.
- Added focused regression coverage in `tests/unit/hooks/useSubjectManager.test.js` verifying topics listener failure path:
  - loading is released,
  - topics fallback to empty state,
  - listener error is logged.

## Progress Update - 2026-03-30 (Slice 21)
- Hardened `TopicAssignmentsSection` submission listeners in `src/pages/Topic/components/TopicAssignmentsSection.jsx`.
- Added explicit snapshot error callbacks for both role paths:
  - teacher submissions-count listener now logs failures, resets counts fallback, and shows inline feedback,
  - student own-submissions listener now logs failures, resets submission map fallback, and shows inline feedback.
- Added focused page-level regression coverage in `tests/unit/pages/topic/TopicAssignmentsSection.snapshotError.test.jsx` verifying:
  - teacher path renders inline error when submissions-count snapshot fails,
  - student path renders inline error when own-submissions snapshot fails.

## Progress Update - 2026-03-30 (Slice 22)
- Hardened `Topic.jsx` realtime listener feedback with stream-specific error state and a visible inline fallback banner.
- Added non-fatal feedback wiring for snapshot failures in:
  - quiz-results stream,
  - quiz-reviews stream,
  - topic-assignments stream.
- Added focused page-level regression coverage in `tests/unit/pages/topic/Topic.realtimeFeedback.test.jsx` verifying:
  - no banner appears when listeners succeed,
  - assignments-listener failures surface inline fallback feedback (`No se pudieron sincronizar las tareas del tema.`).

## Progress Update - 2026-03-30 (Slice 23)
- Hardened `AdminPasswordWizard` user snapshot lifecycle in `src/pages/Auth/components/AdminPasswordWizard.jsx`.
- Added explicit snapshot error callback to avoid silent listener failures and force safe hidden-state fallback when user-doc watch fails.
- Added focused component regression coverage in `tests/unit/pages/auth/AdminPasswordWizard.snapshotError.test.jsx` verifying:
  - wizard appears for institution admins authenticated via Google-only provider,
  - listener failure path keeps wizard hidden and logs the failure.

## Progress Update - 2026-03-30 (Slice 24)
- Hardened `SubjectGradesPanel` realtime listener feedback in `src/pages/Subject/components/SubjectGradesPanel.jsx`.
- Added stream-specific listener error tracking and a non-blocking inline banner for snapshot sync failures.
- Listener success paths now clear their own stale feedback state while preserving existing fallback resets for derived arrays/maps.
- Added focused component regression coverage in `tests/unit/pages/subject/SubjectGradesPanel.snapshotError.test.jsx` verifying:
  - no realtime error banner appears when listeners succeed,
  - evaluation-items listener failures surface inline fallback feedback (`No se pudieron sincronizar las actividades extra del panel de notas.`).

## Validation Gates
- Workflow checks:
  - teacher create/edit/assign path behaves correctly,
  - student consume/submit path behaves correctly,
  - empty/loading/error states are explicit and non-blocking.
- Quality gates:
  - `npm run lint` passes,
  - `npm run test` passes,
  - targeted tests for changed workflows pass.

## Rollback Triggers
- Regression in existing teacher/student permissions.
- Broken navigation or unresolved loading states in subject/topic/exam routes.

## Completion Criteria
- Remaining high-risk workflow gaps are closed and tested.
- No regression in adjacent behaviors or role gating.
- Lossless report updated with preserved behaviors and evidence.
