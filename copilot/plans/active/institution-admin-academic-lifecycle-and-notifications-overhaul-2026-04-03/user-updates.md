<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/user-updates.md -->
# User Updates

## How to Use
- Add new requests under `Pending User Updates` as bullet points.
- Include optional context (why, constraints, affected phase).
- Copilot must read this file before each implementation block and sync accepted items into roadmap/phase docs.

## Pending User Updates
- CSV workflow follow-up: add direct Google Sheets ingestion and richer n8n AI response mapping/reporting on top of current storage + manual/n8n import foundation.

- Add that for both the student and the teacher codes on the users tab of the intitution admin dashboard, they can be changed immediately, and that they can be disabled. I don't know how to do the immediate change, because the codes go following a time restriction, so you maybe can change the restriction to 1 second and after the code changes don't change it until the it was suppossed to before, but I am not sure, make an audit on what would be the best implementation for this and decide how to do it.

## Processed Updates
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
