<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/utils/importSourceUtils.md -->
# importSourceUtils.ts

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/utils/importSourceUtils.ts`
- **Last documented:** 2026-04-04
- **Role:** Utility helpers for normalizing CSV import sources, especially Google Sheets URL conversion to CSV export endpoints.

## Responsibilities
- Detects whether a source URL belongs to Google Sheets.
- Converts common Google Sheets share/edit URLs into deterministic CSV export URLs.
- Preserves non-Google URLs unchanged for external source compatibility.

## Exports
- `isGoogleSheetUrl(value)`
- `buildGoogleSheetCsvExportUrl(value)`

## Changelog
- 2026-04-04: Added utility module to support direct Google Sheets ingestion in institution-admin CSV workflows.
