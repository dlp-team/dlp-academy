<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/user-updates.md -->
# User Updates

## How to Use
- Add new requests under `Pending User Updates` as bullet points.
- Include optional context (why, constraints, affected phase).
- Copilot must read this file before each implementation block and sync accepted items into roadmap/phase docs.

## Pending User Updates
- (No pending updates right now)


## Processed Updates
- 2026-04-04: Updated `create-plan` skill to enforce a final optimization phase at the end of each multi-phase plan.
  - Synced in:
    - `.github/skills/create-plan/SKILL.md`
    - `README.md`
    - `phases/phase-05-student-course-linking-and-transfer-planned.md`
  - Implementation completed:
    - Added mandatory final-phase checklist for deep optimization of touched files (centralization, file-division, readability/efficiency, lint + validation).

- 2026-04-04: Updated `create-plan` skill intake flow to require immediate `Pending -> Processed` transition after syncing user updates into plan docs.
  - Synced in:
    - `.github/skills/create-plan/SKILL.md`
    - `README.md`
    - `phases/phase-05-student-course-linking-and-transfer-planned.md`
  - Implementation completed:
    - Added strict sequence rules: read intake, sync impacted plan docs, move handled entries to processed log, then start coding.

- 2026-04-04: Completed CSV follow-up with direct Google Sheets ingestion and richer n8n AI response reporting.
  - Synced in:
    - `strategy-roadmap.md`
    - `phases/phase-05-student-course-linking-and-transfer-planned.md`
  - Implementation completed:
    - Added Google Sheets public URL source mode in shared import modal.
    - Added URL normalization to CSV export for manual processing.
    - Extended n8n payload/response contract with source metadata and AI feedback (`warnings`, `recommendations`, `detectedColumns`, `aiMapping`).
- 2026-04-04: Implemented immediate teacher/student access-code regeneration and preserved disable controls with versioned backend rotation.
  - Synced in:
    - `strategy-roadmap.md`
    - `phases/phase-05-student-course-linking-and-transfer-planned.md`
  - Implementation completed:
    - Added backend callable `rotateInstitutionalAccessCodeNow` with institution-admin/global-admin guardrails.
    - Added role policy `codeVersion` support so `Regenerar ahora` invalidates old code immediately without changing interval hours.
    - Added users-tab `Regenerar ahora` action and inline feedback for both teacher and student security views.
    - Preserved disable semantics (`requireCode = false`) and blocked rotation when disabled.
- 2026-04-04: Implemented first CSV workflow overhaul slice for student/course linking imports.
  - Synced in:
    - `strategy-roadmap.md`
    - `phases/phase-05-student-course-linking-and-transfer-planned.md`
  - Implementation completed:
    - Moved `Vincular cursos por CSV` entrypoint to organization courses section.
    - Renamed users-tab action to `Vincular alumnos por CSV`.
    - Added shared import overlay with Firebase Storage upload and two execution options: manual column mapping or n8n webhook.
    - Manual workflow now supports student matching by email or identifier, optional name/identifier enrichment, and optional/required course linking depending on flow.
- 2026-04-04: Added requirement to support per-course period start/end timelines for each configured period (trimester/cuatrimester/custom), while keeping institution-level ordinary/extraordinary date windows as global defaults/fallback.
  - Synced in:
    - `README.md` scope
    - `strategy-roadmap.md` dependencies/actions/risks
    - `phases/phase-02-settings-domain-model-foundation-planned.md` follow-up addendum
    - `phases/phase-04-subject-periods-and-lifecycle-automation-planned.md` roadmap extension note
    - `subplans/course-period-overrides-subplan.md`
  - Implementation started:
    - `src/utils/subjectPeriodLifecycleUtils.ts` now supports optional `coursePeriodSchedule` override boundaries in `buildSubjectPeriodTimeline(...)`.
    - `tests/unit/utils/subjectPeriodLifecycleUtils.test.js` includes override/fallback coverage.
