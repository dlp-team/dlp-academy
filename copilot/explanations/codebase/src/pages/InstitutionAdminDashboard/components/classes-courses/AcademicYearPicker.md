<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/classes-courses/AcademicYearPicker.md -->
# AcademicYearPicker.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/classes-courses/AcademicYearPicker.tsx`
- **Last documented:** 2026-04-02
- **Role:** Reusable academic-year input + quick picker for classes/courses forms.

## Responsibilities
- Renders editable text input with calendar affordance.
- Exposes a selectable list built from `buildAcademicYearRange(-20,+10)`.
- Provides "Usar año actual" shortcut.
- Supports disabled/read-only-like usage in derived-value contexts.

## Exports
- `default AcademicYearPicker`

## Main Dependencies
- `react`
- `lucide-react`
- `./academicYearUtils`
- `./Shared`

## Changelog
- 2026-04-02: Added picker component for mandatory academic-year governance flows.
