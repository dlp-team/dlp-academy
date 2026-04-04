<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/SettingsTabContent.md -->
# SettingsTabContent.tsx

## Overview
- Source file: `src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx`
- Last documented: 2026-04-03
- Role: Renders institution-level configuration UI for academic calendar, period model, post-course policy, and teacher governance toggles.

## Responsibilities
- Displays editable calendar dates (inicio, fin ordinario, fin extraordinario).
- Displays periodization mode selector (trimestres, cuatrimestres, personalizado).
- Displays post-course subject policy selector.
- Displays teacher-governance toggles moved from users tab.
- Surfaces validation feedback and save status from the settings hook.
- Clarifies that institution dates are defaults and each course may override per-period windows.

## Exports
- `default SettingsTabContent`

## Main Dependencies
- `react`
- `lucide-react`

## Changelog
- 2026-04-04: Added explicit baseline/override guidance so admins understand course-level period schedules do not overwrite institution defaults.
- 2026-04-03: Added initial implementation as part of Phase 02 settings foundation.
