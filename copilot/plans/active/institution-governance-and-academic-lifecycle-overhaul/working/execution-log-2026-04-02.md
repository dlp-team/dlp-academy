<!-- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/working/execution-log-2026-04-02.md -->

# Execution Log - 2026-04-02

## Kickoff
- Loaded required instruction files and applicable skills.
- Parsed full original request and structured prompt.
- Built initial dependency map across rules, hooks, dashboards, bin flows, and role model.

## Phase 01 Decision Snapshot
1. Customization preview direction:
   - Preferred path: exact UI reuse via existing app/home surfaces in isolated mock-data mode.
   - Rationale: highest parity with lower auth/claims complexity than synthetic mock user accounts.
2. Academic year ownership direction:
   - Preferred path: course/class as canonical owner; subjects derive from course linkage.
3. Dual-role direction:
   - Preferred path: single identity with switchable active role context.

## Immediate Next
- Move plan to active and begin Phase 02 permission reliability remediation.

## Phase 02 Starter - Implemented
- Firestore invite-code rules updated to support teacher transaction flow safely:
   - create path now validates target subject with `existsAfter/getAfter`,
   - get path supports same-institution missing-doc preflight for non-student actors.
- Added callable backend `syncCurrentUserClaims` to align Auth claims with `users/{uid}` profile role/institution before Storage operations.
- Customization uploads (`icon`, `logo`) now:
   - check/sync claims before upload,
   - force refresh token,
   - retry once on `storage/unauthorized`.
- Home subject deletion guard updated:
   - same-institution institution admins can execute delete flow,
   - unauthorized non-owner path now surfaces explicit modal error instead of silent closure.

## Validation Evidence
- `get_errors` on touched files: clean.
- Unit test pass:
   - `npm run test -- tests/unit/hooks/useHomeHandlers.shortcuts.test.js`
- Rules tests status:
   - direct run without emulator host fails as expected.
   - emulator exec attempt failed due workspace emulator startup config not present (`No emulators to start`).
- Additional checks:
   - `npm run lint` (0 errors, 4 pre-existing warnings out of scope),
   - `npx tsc --noEmit` passed.

## Phase 03 Slice 01 - Folder Bin Lifecycle Core
- Replaced folder hard-delete cascade with trash-first cascade in `useFolders.deleteFolder`.
- Added folder bin lifecycle APIs:
   - `getTrashedFolders`,
   - `restoreFolder`,
   - `permanentlyDeleteFolder`.
- Upgraded bin UI to typed entries (`subject` + `folder`) and type-aware restore/delete flows.
- Added top-level bin filtering to hide subjects nested inside trashed folders.
- Added folder drilldown navigation from bin entries to view nested trashed subject items and execute individual restore/delete.
- Added/updated hook tests to verify:
   - trash metadata updates,
   - top-level trashed-folder filtering,
   - subtree restore,
   - subtree permanent deletion.

## Phase 03 Slice 01 Validation
- `npm run test -- tests/unit/hooks/useFolders.test.js` (pass)
- `npm run test -- tests/unit/hooks/useHomeHandlers.shortcuts.test.js tests/unit/hooks/useHomeLogic.test.js` (pass)
- `npm run lint` (pass, warnings only)
- `npx tsc --noEmit` (pass)
- `get_errors` on touched files (clean)

## Phase 03 Slice 02 - Nested Subfolder Actions
- Extended `BinView` drilldown from nested-subject-only to hierarchical nested folder navigation:
   - maintains folder trail and back-navigation by level,
   - surfaces immediate subfolders and immediate subjects at active level.
- Updated `useFolders` folder-bin APIs for target-aware scope:
   - root folder target keeps full-root restore/delete behavior,
   - nested folder target applies restore/delete only to selected subtree.
- Added unit coverage for:
   - `getTrashedFolders({ includeNested: true })`,
   - nested-subtree-only restore,
   - nested-subtree-only permanent delete.

## Phase 03 Slice 02 Validation
- `npm run test -- tests/unit/hooks/useFolders.test.js tests/unit/hooks/useHomeHandlers.shortcuts.test.js tests/unit/hooks/useHomeLogic.test.js` (pass, 56 tests)
- `npx tsc --noEmit` (pass)
- `npm run lint` (pass, warnings only outside scope)
- `get_errors` on touched files (clean)

## Phase 03 Slice 03 - Institution Admin Bin Lifecycle
- Refactored `useClassesCourses` to support trash lifecycle state and actions:
   - active vs trashed split for courses/classes,
   - soft-delete for course/class,
   - restore for course/class,
   - permanent-delete for course/class with linked-class cleanup for course deletion.
- Extended `ClassesCoursesSection` with:
   - `Papelera` tab for trashed courses/classes,
   - restore buttons for trashed items,
   - permanent-delete action routing,
   - typed-name confirmation input for permanent delete only.
- Updated focused unit suite to validate:
   - move-to-trash confirmation flows for course/class,
   - bin restore for trashed course,
   - typed-name guard for permanent delete.

## Phase 03 Slice 03 Validation
- `npm run test -- tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx` (pass, 5 tests)
- `npm run test -- tests/unit/hooks/useFolders.test.js tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx` (pass, 31 tests)
- `npx tsc --noEmit` (pass)
- `npm run lint` (pass, warnings only outside scope)
- `get_errors` on touched files (clean)

## Phase 03 Slice 04 - Retention Window Enforcement
- Added shared retention utility `src/utils/trashRetentionUtils.ts`:
   - canonical 15-day constants,
   - timestamp normalization helpers,
   - expiry/remaining-day calculations.
- Updated Home bin retention flow:
   - `BinView` now purges expired trashed folders/subjects during load,
   - purge executes once per load cycle with recursion guard.
- Updated institution-admin retention flow:
   - `useClassesCourses.fetchAll` purges expired trashed courses/classes,
   - expired trashed course purge includes linked class cleanup,
   - bin rows now show auto-delete countdown copy.
- Added retention-focused unit coverage and synced helper docs.

## Phase 03 Slice 04 Validation
- `npm run test -- tests/unit/utils/trashRetentionUtils.test.js tests/unit/pages/home/binViewUtils.test.js tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx` (pass, 12 tests)
- `npx tsc --noEmit` (pass)
- `npm run lint` (pass, warnings only outside scope)
- `get_errors` on touched files (clean)

## Phase 04 Slice 01 - Institution User List Pagination
- Refactored `useUsers` with cursor-based pagination for teachers/students:
   - initial reads use `limit(25)`,
   - subsequent reads use `startAfter(lastVisible)` via `handleLoadMoreUsers`,
   - per-tab pagination state now tracks `hasMore` and cursor snapshots.
- Updated users tab UI (`UsersTabContent`):
   - renders `Cargar más profesores/alumnos` controls,
   - binds loading state for paginated fetch requests,
   - keeps existing search/filter behavior on currently loaded rows.
- Reduced unnecessary heavy reads:
   - `useUsers` now accepts `loadAllUsers` option,
   - `InstitutionAdminDashboard` enables full teachers/students fetch only when `organization` tab is active.
- Updated focused users-tab unit suite with pagination callback coverage.

## Phase 04 Slice 01 Validation
- `npm run test -- tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx` (pass, 9 tests)
- `npx tsc --noEmit` (pass)
- `npm run lint` (pass, warnings only outside scope)
- `get_errors` on touched files (clean)

## Phase 04 Slice 02 - Exact Preview + Policy Matrix Verification
- Reworked customization preview architecture in `InstitutionCustomizationMockView`:
   - replaced static mock cards with exact Home UI surface rendering,
   - preserved existing editor interactions (palette apply, role toggle, viewport toggle, save/reset).
- Added new adapter component `CustomizationHomeExactPreview`:
   - reuses `HomeControls` and `HomeContent` directly,
   - uses isolated deterministic mock data (no auth/account coupling),
   - applies live theme colors via Home CSS variables for parity.
- Executed policy-toggle verification matrix (Phase 04 scope):
   - dynamic code requirement path (`useRegister` + institutional code callable flow),
   - teacher autonomous subject creation toggle enforcement (`useSubjects`),
   - teacher class/student assignment restricted path (`SubjectFormModal` request path),
   - teacher deletion with associated students toggle enforcement (`useSubjects`).

## Phase 04 Slice 02 Validation
- `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (pass, 3 tests)
- `npm run test -- tests/unit/hooks/useSubjects.test.js tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx tests/unit/hooks/useRegister.test.js tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx` (pass, 54 tests)
- `npx tsc --noEmit` (pass)
- `npm run lint` (pass, warnings only outside scope)
- `get_errors` on touched files (clean)

## Phase 05 Slice 01 - Academic-Year Governance Baseline
- Added shared academic-year governance utilities:
   - strict `YYYY-YYYY` consecutive validation,
   - canonical default-year resolver (`Jul-Dec => Y-(Y+1)`, `Jan-Jun => (Y-1)-Y`),
   - selectable range builder (`-20` to `+10`).
- Added reusable `AcademicYearPicker` for deterministic year selection in institution-admin flows.
- Updated course governance flows:
   - `CreateCourseModal` now requires academic year,
   - `CourseDetail` can edit canonical academic year with strict validation,
   - `useClassesCourses` normalizes persisted year values and propagates course year updates to linked classes.
- Updated class governance flows:
   - `CreateClassModal` derives year from selected course (fallback for legacy invalid courses),
   - `ClassDetail` now treats year as course-derived metadata and no longer supports direct free-form editing.
- Added defensive validation in `ClassesCoursesSection` create handlers.
- Added focused deterministic tests:
   - `academicYearUtils.test.js`,
   - `CreateClassModal.academicYear.test.jsx`,
   - `CreateCourseModal.academicYear.test.jsx`.

## Phase 05 Slice 01 Validation
- `npm run test -- tests/unit/pages/institution-admin/academicYearUtils.test.js tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx tests/unit/pages/institution-admin/CreateCourseModal.academicYear.test.jsx` (pass, 7 tests)
- `npx tsc --noEmit` (pass)
- `npm run lint` (pass, warnings only outside scope)
- `get_errors` on touched files (clean)

## Phase 05 Slice 02 - History Retirement on Home Surfaces
- Retired Home history mode in controls/state wiring:
   - removed `history` from `HOME_VIEW_MODES`,
   - removed history icon mapping from `HomeControls`,
   - removed `history` from persisted-mode allow-list in `useHomePageState` restore flow.
- Removed send-to-history wiring on Home content pipeline:
   - `HomeMainContent` no longer forwards completion-tracking props into `HomeContent`,
   - `HomeContent` no longer forwards completion toggle callbacks to subject card/list renderers.
- Updated grouped visibility behavior in `useHomeState`:
   - removed history-only grouping branch,
   - kept completed subjects visible in regular grouped/manual views,
   - stale `history` persisted preference now falls back to regular grouping behavior.
- Updated deterministic hook coverage in `useHomeState.completionTracking.test.js` to assert post-history fallback behavior.

## Phase 05 Slice 02 Validation
- `npm run test -- tests/unit/hooks/useHomeState.completionTracking.test.js` (pass, 2 tests)
- `npx tsc --noEmit` (pass)
- `npm run lint` (pass, warnings only outside scope)
- `get_errors` on touched files (clean)

## Phase 05 Slice 03 - Courses Academic-Year Range Filter Baseline
- Added courses-tab academic-year range filter UI next to `Filtrar`:
   - new reusable `AcademicYearRangeFilter` control,
   - existing-years-only options,
   - paginated selector panel (`10` per page),
   - explicit start/end year bound selection.
- Added Home state wiring for persisted courses year-range selection:
   - `coursesAcademicYearFilter` state in `useHomeState`,
   - normalization/clamping against available years,
   - preference hydration via existing Home preference flow.
- Added courses grouping logic updates in `useHomeState`:
   - filters courses buckets by selected academic-year range,
   - appends year suffix to bucket labels in multi-year result sets.
- Added courses UX behavior updates:
   - courses collapsible groups now default to collapsed,
   - create-subject prefill sanitizes grouped labels that include academic-year suffixes.
- Added deterministic test suite `useHomeState.academicYearFilter.test.js`.

## Phase 05 Slice 03 Validation
- `npm run test -- tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/hooks/useHomeState.completionTracking.test.js` (pass, 4 tests)
- `npx tsc --noEmit` (pass)
- `npm run lint` (pass, warnings only outside scope)
- `get_errors` on touched files (clean)

## Phase 05 Slice 04 - Nested Academic-Year Wrappers
- Updated courses multi-year rendering to include outer academic-year wrapper sections in `HomeContent`:
   - wrapper sections render only when more than one academic year is present,
   - each wrapper has its own collapsed state and subject-count badge,
   - wrappers default to collapsed.
- Updated courses grouping emission order in `useHomeState` to year-first sequencing so wrapper sections render contiguous grouped buckets.
- Preserved inner per-course collapsible behavior and year suffixes in multi-year course titles.

## Phase 05 Slice 04 Validation
- `npm run test -- tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/hooks/useHomeState.completionTracking.test.js tests/unit/pages/home/HomeMainContent.test.jsx` (pass, 7 tests)
- `npx tsc --noEmit` (pass)
- `npm run lint` (pass, warnings only outside scope)
- `get_errors` on touched files (clean)

## Phase 05 Slice 05 - Ended Indicators + Active/Current Visibility Controls
- Added shared lifecycle utility `academicYearLifecycleUtils`:
   - current academic-year resolution,
   - ended/current subject classification,
   - robust subject score/pass extraction,
   - role-aware ended badge style mapping (teacher yellow, student red-to-green).
- Added persisted Home controls toggle `showOnlyCurrentSubjects` for `courses` and `usage` tabs.
- Updated `useHomeState` grouped-content pipeline:
   - applies active/current filtering in courses and usage views,
   - applies same filter in search results while in courses/usage context.
- Updated Home subject surfaces:
   - `SubjectCard`/`SubjectCardFront` render top-left ended bookmark badges,
   - `SubjectListItem` renders inline ended badges in list rows.
- Added/updated focused deterministic tests:
   - `useHomeState.academicYearFilter.test.js` (courses/usage active-only coverage),
   - `HomeControls.activeCurrentToggle.test.jsx` (toggle visibility + preference wiring),
   - `academicYearLifecycleUtils.test.js` (lifecycle helper + badge mapping behavior).

## Phase 05 Slice 05 Validation
- `npm run test -- tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/pages/home/HomeControls.activeCurrentToggle.test.jsx tests/unit/utils/academicYearLifecycleUtils.test.js tests/unit/pages/home/HomeMainContent.test.jsx` (pass, 14 tests)
- `npx tsc --noEmit` (pass)
- `npm run lint` (pass, 4 pre-existing warnings only in unrelated `src/pages/Content/*`)
- `get_errors` on touched files (clean)

## Phase 06 Slice 01 - Selection/Bin UX Reliability + Admin Row Navigation
- Updated Home selection toolbar (`HomeSelectionToolbar`) for safer multi-select flow communication:
   - clearer grouped actions (create folder, move, move to bin),
   - explicit safety copy clarifying that selection delete moves items to paper bin (not permanent).
- Extended bin utility/helpers (`binViewUtils`) with deterministic sort modes:
   - urgency ascending/descending,
   - alphabetical ascending/descending.
- Upgraded `BinView` with bin-only selection mode:
   - multi-select toggles in both grid and list bin layouts,
   - bulk restore action,
   - bulk permanent delete action protected by confirmation modal,
   - selection-safe behavior across folder-bin navigation boundaries,
   - toolbar sort selector + mode-specific guidance.
- Extended `BinConfirmModals` for reusable bulk-delete confirmation copy and loading states.
- Fixed first-open overlay jump for Escala/Filtrar controls:
   - `CardScaleSlider` and `TagFilter` now compute panel position before display to avoid top-left flash.
- Updated admin institution table interaction:
   - removed chevron entry button,
   - institution row click (plus keyboard Enter/Space) opens institution dashboard,
   - action buttons stop propagation to preserve edit/toggle/delete behavior.
- Added/updated targeted tests:
   - `binViewUtils.test.js` now covers new sort-mode behavior,
   - `InstitutionTableRow.test.jsx` now validates row-click navigation and non-propagating action buttons.

## Phase 06 Slice 01 Validation
- `npm run test -- tests/unit/pages/home/binViewUtils.test.js tests/unit/pages/admin/InstitutionTableRow.test.jsx` (pass, 8 tests)
- `npx tsc --noEmit` (pass)
- `npm run lint` (pass, 4 pre-existing warnings only in unrelated `src/pages/Content/*`)
- `get_errors` on touched files (clean)

## Phase 07 Slice 01 - Active Role Model Baseline (Shell + Guards)
- Added canonical active-role model in `permissionUtils`:
   - `getAssignedRoles(...)` resolves deduplicated assigned roles from legacy + additive profile fields.
   - `getActiveRole(...)` resolves validated active role with deterministic fallback to assigned primary role.
   - `hasRequiredRoleAccess(...)` now evaluates required role against active-role context.
- Updated root auth shell (`App.tsx`):
   - user hydration now enriches auth profile with `availableRoles` + `activeRole`,
   - active role preference persists per-user in `localStorage` and rehydrates on auth restore,
   - app listens to role-switch event + storage updates to keep route guards synchronized in-tab and cross-tab.
- Updated header role UX (`Header.tsx`):
   - added active-role selector for users with multiple assigned roles,
   - dashboard shortcut route/label now resolves from active role,
   - role switch emits app-level active-role change event without logout.
- Updated dashboard guards to consume active role context:
   - `AdminDashboard`, `TeacherDashboard`, `StudentDashboard` strict guards now evaluate `getActiveRole(user)`.
   - `InstitutionAdminDashboard` now derives admin-only institution override from active role.
- Added/updated focused tests:
   - `tests/unit/utils/permissionUtils.test.js` (dual-role assigned/active role resolution coverage).
   - `tests/unit/App.authListener.test.jsx` (permission utils mock compatibility with new role helpers).

## Phase 07 Slice 01 Validation
- `npm run test -- tests/unit/utils/permissionUtils.test.js tests/unit/App.authListener.test.jsx` (pass, 16 tests)
- `npx tsc --noEmit` (pass)
- `npm run lint` (pass, 4 pre-existing warnings only in unrelated `src/pages/Content/*`)
- `get_errors` on touched files (clean)

## Phase 07 Slice 02 - Deterministic Allowed-Role Route Gate
- Extended `ProtectedRoute` with optional `allowedRoles` for explicit active-role route whitelists.
- Applied explicit allowed-role gates to dashboard routes in `App.tsx`:
   - `/admin-dashboard` -> `['admin']`
   - `/institution-admin-dashboard/**` -> `['institutionadmin', 'admin']`
   - `/teacher-dashboard/**` -> `['teacher']`
   - `/student-dashboard` -> `['student']`
- Added deterministic route-level regression test in `App.authListener.test.jsx`:
   - dual-role admin+teacher with active role `teacher` is denied admin dashboard route and redirected to Home.
- Stabilized auth-listener test setup for role-context persistence:
   - mocked `getDoc`/`setDoc` Firestore calls,
   - clear `localStorage` per test to isolate active-role preference behavior.

## Phase 07 Slice 02 Validation
- `npm run test -- tests/unit/utils/permissionUtils.test.js tests/unit/App.authListener.test.jsx` (pass, 17 tests)
- `npx tsc --noEmit` (pass)
- `npm run lint` (pass, 4 pre-existing warnings only in unrelated `src/pages/Content/*`)
- `get_errors` on touched files (clean)

## Phase 07 Slice 03 - Broad Active-Role Surface Alignment
- Replaced remaining role-sensitive raw `user.role` checks in targeted Phase 07 surfaces with `getActiveRole(user)`:
   - Topic stack: `Topic`, `useTopicLogic`, `TopicTabs`, `TopicContent`, `TopicAssignmentsSection`.
   - Subject stack: `Subject`, `SubjectTestsPanel`, `SubjectGradesPanel`.
   - Additional role-sensitive modules: `Quizzes`, `BinView`, `useNotifications`, `useFolders`, `useSubjects`, `useShortcuts`, `useCustomization`.
- Fixed impacted test mock shape drift introduced by new helper imports:
   - `tests/unit/hooks/useShortcuts.test.js` now mocks `getActiveRole`.
   - `tests/unit/hooks/useTopicLogic.test.js` now mocks `getActiveRole`.
- Confirmed no remaining raw role checks in targeted files via PowerShell search (`NO_MATCHES`).

## Phase 07 Slice 03 Validation
- `npm run test -- tests/unit/hooks/useTopicLogic.test.js tests/unit/hooks/useShortcuts.test.js tests/unit/utils/permissionUtils.test.js tests/unit/App.authListener.test.jsx` (pass, 46 tests)
- `npx tsc --noEmit` (exit 0)
- `npm run lint` (exit 0, 4 pre-existing warnings only in unrelated `src/pages/Content/*`)
- `get_errors` on touched source/test files (clean)

