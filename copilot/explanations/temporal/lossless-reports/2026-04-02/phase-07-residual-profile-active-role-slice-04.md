<!-- copilot/explanations/temporal/lossless-reports/2026-04-02/phase-07-residual-profile-active-role-slice-04.md -->

# Lossless Report - Phase 07 Slice 04 (Residual Profile Active-Role Alignment)

## Requested Scope
Continue Phase 07 residual audit after Slice 03 by aligning remaining profile-level role-sensitive logic with active-role semantics.

## Preserved Behaviors
- Profile load, update, and logout flows remain unchanged.
- Role badge icon/color mapping remains unchanged.
- Teacher-only badge award constraints and assigned-student scope remain unchanged in semantics; only role-source resolution changed.
- Existing admin/institutionadmin badge-award capability remains unchanged.

## Touched Files
- `src/pages/Profile/hooks/useProfile.ts`
- `src/pages/Profile/components/UserCard.tsx`
- `tests/unit/hooks/useProfile.test.js`

## Per-File Verification
- `useProfile.ts`
  - Added `getActiveRole` import and centralized role-context resolver.
  - Role-sensitive checks (`awardBadgeToStudent`, teacher-student assignment branch) now resolve role through active role context.
- `UserCard.tsx`
  - Role badge source now resolves with active role context.
- `useProfile.test.js`
  - Added `permissionUtils.getActiveRole` mock compatibility for new hook dependency.

## Validation Summary
- Residual role audit:
  - src-wide `user.role` search returned no matches.
- Focused impacted tests:
  - `npm run test -- tests/unit/hooks/useProfile.test.js tests/unit/hooks/useTopicLogic.test.js tests/unit/hooks/useShortcuts.test.js tests/unit/utils/permissionUtils.test.js tests/unit/App.authListener.test.jsx`
  - Result: pass (5 files, 49 tests).
- Typecheck:
  - `npx tsc --noEmit` -> exit 0.
- Lint:
  - `npm run lint` -> exit 0, with 4 pre-existing warnings in unrelated `src/pages/Content/*` files.
- IDE diagnostics:
  - `get_errors` clean on touched profile source/test files.

## Residual Risk / Next Slice
- Phase 07 code-surface residual role audit is functionally complete for `src` role checks. Remaining plan-level gates are Phase 07 closure decision and pending Phase 02 emulator validation gate.
