<!-- copilot/explanations/codebase/tests/unit/pages/admin/InstitutionTableRow.test.md -->
# InstitutionTableRow.test.jsx

## Overview
- **Source file:** `tests/unit/pages/admin/InstitutionTableRow.test.jsx`
- **Last documented:** 2026-04-02
- **Role:** Verifies institution-row interactions in the global admin table.

## Coverage
- Renders core institution identity/status cells.
- Validates row-click navigation callback to institution dashboard.
- Validates action buttons (`Editar`, `Deshabilitar`, `Eliminar`) without accidental row-navigation propagation.

## Changelog
- 2026-04-02: Updated expectations to row-click navigation after chevron entry action removal.
