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

