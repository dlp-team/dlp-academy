<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal.md -->
# CsvImportWorkflowModal.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal.tsx`
- **Last documented:** 2026-04-05
- **Role:** Reusable import workflow modal for institution-admin CSV/Excel flows with Firebase Storage upload, manual mapping, and n8n dispatch paths.

## Responsibilities
- Allows file upload (`CSV/XLS/XLSX/TXT`) through parent-provided storage handler.
- Allows source selection between uploaded file and direct Google Sheets URL.
- Provides two execution modes: manual mapping in-app or external n8n automation.
- Collects configurable column mappings (`email`, `identifier`, `name`, `course`) for import execution.
- Surfaces inline status, validation errors, and import summary feedback.
- Supports both student-data import and student-course-link import workflows.

## Exports
- `default CsvImportWorkflowModal`

## Main Dependencies
- `react`
- `lucide-react`

## Changelog
- 2026-04-05: Migrated overlay shell to shared [src/components/ui/DashboardOverlayShell.tsx](src/components/ui/DashboardOverlayShell.tsx) for consistent constrained-overlay behavior across Institution Admin create/import overlays.
- 2026-04-04: Added direct Google Sheets source mode for manual/n8n flows and expanded summary rendering for AI feedback (`warnings`, `recommendations`, `detectedColumns`, `aiMapping`).
- 2026-04-04: Added reusable import modal to unify CSV/Excel onboarding workflows across Users and Courses sections with manual + n8n paths.
