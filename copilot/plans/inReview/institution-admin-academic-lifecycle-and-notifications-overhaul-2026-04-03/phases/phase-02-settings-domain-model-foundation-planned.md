<!-- copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-02-settings-domain-model-foundation-planned.md -->
# Phase 02 - Settings Domain Model Foundation (COMPLETED)

## Objective
Introduce institution-level settings structures needed by lifecycle behaviors (calendar windows, period model, and post-course policy decisions).

## Planned Changes
- Add/extend institution settings for:
  - academic year start date
  - ordinary period end date
  - extraordinary period end date
  - periodization mode (trimester, cuatrimester, custom)
  - post-course subject policy
- Move existing teacher-governance toggles from users tab to settings/configuration section.
- Keep institution-level date windows as global defaults consumed by downstream course-level period overrides.

## Progress Notes
- Added a new Institution Admin tab: `Configuración`.
- Implemented `useInstitutionSettings` hook to load and persist:
  - academic calendar core dates
  - period mode
  - post-course subject policy
  - teacher governance toggles
- Added `SettingsTabContent` UI and moved teacher-governance controls out of `UsersTabContent`.
- Foundation objectives were delivered without regressing existing users/organization/customization tab behavior.

## Follow-up Addendum (2026-04-04)
- User requested course-specific period timelines per configured period (trimester/cuatrimester/custom) while preserving institution-level ordinary/extraordinary windows as fallback defaults.
- This requirement is accepted into the active roadmap and tracked via a dedicated subplan for implementation sequencing.

## Risks and Controls
- Risk: breaking existing settings persistence shape.
  - Control: additive schema extension and compatibility defaults.

## Exit Criteria
- Settings UI and data model support new fields with safe defaults.
- Existing governance toggles remain functional in new location.
