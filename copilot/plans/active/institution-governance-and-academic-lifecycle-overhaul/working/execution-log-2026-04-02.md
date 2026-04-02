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

