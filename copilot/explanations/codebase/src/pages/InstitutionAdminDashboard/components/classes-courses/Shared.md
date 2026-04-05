<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.md -->
# Shared.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx`
- **Last documented:** 2026-04-05
- **Role:** Shared UI primitives and class bundles for Classes/Courses feature.

## Responsibilities
- Expose style bundles (`inputCls`, button class constants).
- Provide small reusable UI helpers (`ColorPicker`, `SearchInput`, `StatCard`, etc.).
- Provide feature-level `Modal` wrapper used by create course/class flows.

## Changelog
### 2026-04-05
- Migrated shared `Modal` wrapper to use [src/components/ui/DashboardOverlayShell.tsx](src/components/ui/DashboardOverlayShell.tsx).
- Preserved existing API (`title`, `onClose`, `children`, `wide`) while standardizing header-to-bottom overlay shell behavior.
- Extended shared `Modal` wrapper with optional dirty-close confirmation controls (`hasUnsavedChanges`, `confirmOnUnsavedClose`) and render-prop close request routing for consistent cancel/header-close behavior.
