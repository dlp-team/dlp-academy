<!-- copilot/explanations/codebase/src/pages/AdminDashboard/components/InstitutionTableRow.md -->

# InstitutionTableRow.tsx

## Overview
- **Source file:** `src/pages/AdminDashboard/components/InstitutionTableRow.tsx`
- **Last documented:** 2026-04-01
- **Role:** Encapsulates one row in the Admin institutions table.

## Responsibilities
- Renders institution identity/status/admin summary cells.
- Routes to institution dashboard through row click/keyboard interaction.
- Exposes row actions through callback props (edit, toggle, delete) without triggering row navigation.
- Keeps institutions row markup/interaction logic out of `AdminDashboard.tsx`.

## Exports
- `default InstitutionTableRow`

## Main Dependencies
- `react`
- `lucide-react`

## Changelog
- **2026-04-02:** Removed chevron entry icon and switched to row-click dashboard navigation; action buttons now stop event propagation to keep edit/toggle/delete behavior lossless.
