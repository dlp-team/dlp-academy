<!-- copilot/explanations/temporal/lossless-reports/2026-04-03/plan-creation-and-source-normalization-institution-admin-overhaul.md -->
# Lossless Review Report

- Timestamp: 2026-04-03 local
- Task: Plan creation and source normalization for institution-admin academic lifecycle roadmap
- Request summary: Create a new plan from ORIGINAL_PLAN (authoritative), use GEMINI_PLAN as secondary aid, start working on the plan, and update create-plan skill behavior for dual-source handling with move/rename rules.

## 1) Requested scope
- Create a new protocol-compliant plan package from user-authored requirements.
- Treat `ORIGINAL_PLAN.md` as the most accurate source.
- Keep `GEMINI_PLAN.md` as secondary readability aid.
- Move both source files into the new plan and rename to specific names.
- Start execution work (not planning-only).
- Update `.github/skills/create-plan/SKILL.md` with explicit dual-source handling rule.

## 2) Out-of-scope preserved
- No application runtime logic was changed yet.
- No Firebase rules, functions, or production deployment behavior was modified.
- Existing UI behavior remains unchanged in this change set.

## 3) Touched files
- `.github/skills/create-plan/SKILL.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/README.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/source-original-user-spec-institution-admin-academic-lifecycle.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/source-gemini-structured-reference-institution-admin-academic-lifecycle.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-01-audits-and-source-normalization-in-progress.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-02-settings-domain-model-foundation-planned.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-03-courses-and-classes-academic-year-ux-planned.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-04-subject-periods-and-lifecycle-automation-planned.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-06-notifications-and-email-sync-planned.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-07-customization-preview-parity-planned.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-08-bin-selection-mode-unification-planned.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-09-validation-docs-review-and-closure-planned.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/reviewing/verification-checklist-2026-04-03.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/README.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/working/dependency-map-and-target-files-2026-04-03.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/working/course-lifecycle-summary.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/working/course-lifecycle-deep-dive.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/working/language-strategy-audit.md`
- `copilot/explanations/codebase/.github/skills/create-plan/SKILL.md`

## 4) Per-file verification (required)
### File: `.github/skills/create-plan/SKILL.md`
- Why touched: add mandatory dual-source intake behavior.
- Reviewed items:
  - lifecycle section preserved and extended.
  - new rule explicitly states primary vs secondary source precedence.
  - new rule requires moving and renaming both source files into plan folder.
- Result: ✅ adjusted intentionally.

### File: `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/*`
- Why touched: create a complete active plan package and start phase execution artifacts.
- Reviewed items:
  - required structure present (`README`, roadmap, phases, reviewing, subplans, working).
  - phase statuses aligned with roadmap initial state.
  - phase 01 marks completed planning/audit tasks and keeps execution in progress.
- Result: ✅ adjusted intentionally.

### File: `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/source-*.md`
- Why touched: fulfill user request to relocate and rename source inputs.
- Reviewed items:
  - both source files exist in plan folder.
  - root `copilot/plans/ORIGINAL_PLAN.md` and `copilot/plans/GEMINI_PLAN.md` removed from top level.
- Result: ✅ adjusted intentionally.

### File: `copilot/explanations/codebase/.github/skills/create-plan/SKILL.md`
- Why touched: codebase explanation sync for changed skill file.
- Reviewed items:
  - file documents new dual-source behavior and changelog entry.
- Result: ✅ adjusted intentionally.

## 5) Risk checks
- Potential risk: requirement loss from relying on Gemini summary.
- Mitigation check: explicit precedence rule and source-priority section in plan README.
- Outcome: mitigated.

- Potential risk: future confusion from duplicate generic source filenames.
- Mitigation check: moved and renamed both files to task-specific names inside plan folder.
- Outcome: mitigated.

## 6) Validation summary
- Diagnostics: `get_errors` run on `.github/skills/create-plan/SKILL.md` and active plan folder path; no errors found for the skill file.
- Runtime checks: file existence and placement confirmed via directory listing.

## 7) Cleanup metadata
- Keep until: 2026-04-05 local (minimum 48h retention)
- Cleanup candidate after: 2026-04-05 local
- Note: cleanup requires explicit user confirmation.
