<!-- copilot/explanations/temporal/lossless-reports/2026-04-04/plan-user-updates-channel-and-studyguide-tsx-dedup.md -->
# Lossless Report - Plan User-Updates Channel + StudyGuide TSX Dedup

## Requested Scope
- Update the `create-plan` skill to require a user-editable plan update file that Copilot must read.
- Add a new requirement to the active institution-admin plan: keep institution-level ordinary/extraordinary defaults, but support per-course period start/end per configured period.
- Fix immediate TypeScript duplication issue by removing `StudyGuide.jsx` and keeping a single TypeScript implementation.
- Continue plan execution after these updates.

## Preserved Behaviors
- Existing `StudyGuide` route behavior and content rendering remain intact.
- Lifecycle access checks for direct StudyGuide entry remain enforced.
- Active plan lifecycle state (`Phase 05` in progress) remains unchanged.
- Existing roadmap/phase history is preserved; only additive requirement sync was applied.

## Implemented Changes
- Skill and policy updates:
  - `.github/skills/create-plan/SKILL.md`
    - Added mandatory `user-updates.md` plan artifact and required read/sync workflow.
  - `.github/copilot-instructions.md`
    - Added TypeScript-first and no JS/TS duplicate-module policy.
  - `AGENTS.md`
    - Added DoD checkpoint enforcing no JS/JSX duplicates when TS/TSX equivalent exists.
- Active plan updates:
  - `copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/README.md`
  - `copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md`
  - `copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-02-settings-domain-model-foundation-planned.md`
  - `copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-04-subject-periods-and-lifecycle-automation-planned.md`
  - `copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/README.md`
  - Added `copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/user-updates.md`
  - Added `copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/course-period-overrides-subplan.md`
- StudyGuide deduplication:
  - Updated `src/pages/Content/StudyGuide.tsx` to keep lifecycle subject-access gate and TS canonical behavior.
  - Deleted duplicate `src/pages/Content/StudyGuide.jsx`.
  - Synced explanation file `copilot/explanations/codebase/src/pages/Content/StudyGuide.md` to TSX source of truth.

## Validation Evidence
- `get_errors` clean:
  - `src/pages/Content/StudyGuide.tsx`
  - `src/App.tsx`
- Focused tests passed:
  - `npm run test:unit -- tests/unit/pages/content/StudyGuide.navigation.test.jsx tests/unit/pages/content/StudyGuide.fallback.test.jsx tests/unit/App.authListener.test.jsx`
  - Result: `3` files passed, `6` tests passed.
- Duplicate check:
  - `src/pages/Content/StudyGuide.*` now resolves to only `StudyGuide.tsx`.

## Lossless Conclusion
The request was completed with surgical changes: planning workflow now supports user-driven update intake, the active roadmap now includes per-course period window requirements, and StudyGuide duplication was resolved in favor of TypeScript without regressing existing route/test behavior.
