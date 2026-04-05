<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/settings/CoursePromotionOrderEditor.md -->
# CoursePromotionOrderEditor.tsx

## Overview
- Source file: `src/pages/InstitutionAdminDashboard/components/settings/CoursePromotionOrderEditor.tsx`
- Last documented: 2026-04-05
- Role: Settings UI editor for institution course hierarchy order used by automatic promotion mapping.

## Responsibilities
- Renders non-empty, non-duplicated course labels as reorderable rows.
- Supports drag-and-drop reordering with visual drop feedback.
- Supports keyboard/mouse fallback reordering via up/down controls.
- Emits normalized reordered arrays through `onChange` callback for settings form persistence.

## Exports
- `default CoursePromotionOrderEditor`

## Main Dependencies
- `react`
- `lucide-react`

## Changelog
- 2026-04-05: Added draggable course-order editor with accessibility-friendly arrow controls and guidance copy for promotion precedence.
